import { current } from 'immer';
import { Store, Reducer } from 'redux';
import { setProperty } from '../utils/object';
import { getStore as _getStore } from './store';
import { JsonStringify, localStorage } from '../utils/constants';
import { Builder, createReducerWithOpt } from './create-reducer';
import { useSelector, UseSelectorOptions } from '../react/hooks';
import { isPending, setPending, createFetchHandler } from '../utils/async';
import { StoreItem, createPersistenceItem, createSessionItem } from '../utils/storage';
import {
  IsEqual,
  ValidObj,
  Selector,
  PromiseFn,
  ReducerCase,
  ExtendAction,
  FunctionLike,
  ActionCreator,
  XOR,
  PayloadAction,
} from '../typings';

/**
 * reducer case 方法集合对象
 */
type ModelCaseReducerActions<STATE> = Record<string, FunctionLike<[STATE, any?], any|void>>

/**
 * 推导 model.actions 对象类型
 */
type InferModelActions<MCRA> = {
  [key in keyof MCRA]: MCRA[key] extends (state: any) => any ?
    ActionCreator :
    MCRA[key] extends (state: any, action: PayloadAction<infer P>) => any ?
    ActionCreator<P> :
    MCRA[key] extends (state: any, action: ExtendAction<infer O>) => any ?
    ActionCreator<O> :
    never;
}

/**
 * 推导 model.fetch 对象类型
 */
type InferModelFetch<STATE = any> = {
  [key in keyof STATE]?: PromiseFn<STATE[key]>
}

/**
 * model 基础配置
 */
type ModelBaseOptions<
  STATE extends Record<string, any>,
  MCRA extends ModelCaseReducerActions<STATE>,
  SIF extends InferModelFetch<STATE> = InferModelFetch<STATE>
> = {
  name?: string;
  statePaths: string[];
  initialState: STATE;
  reducers: MCRA;
  fetch?: SIF;
  extraReducers?: Record<string, ReducerCase<STATE>> | FunctionLike<[Builder<STATE>], void>;
}

/**
 * 缓存配置
 */
type ModelCacheOptions = {
  cacheKey: string;
  cacheStorage: 'session'|'local'|Storage;
  cacheVersion?: string;
}

/**
 * Model 配置项
 */
type CreateModelOptions<
  STATE extends Record<string, any>,
  MCRA extends ModelCaseReducerActions<STATE>,
  SIF extends InferModelFetch<STATE> = InferModelFetch<STATE>
> = XOR<ModelBaseOptions<STATE, MCRA, SIF>, ModelBaseOptions<STATE, MCRA, SIF> & ModelCacheOptions>

/**
 * Model 对象数据结构
 */
type Model<
  STATE extends ValidObj,
  MCRA extends ModelCaseReducerActions<STATE>,
  SIF extends InferModelFetch<STATE>,
> = {
  name?: string;
  reducer: Reducer<STATE>;
  actions: InferModelActions<MCRA>;
  getState: () => STATE;
  /* eslint-disable no-unused-vars */
  useModel: <T = STATE>(
    selector?: Selector<STATE, T>,
    config?: {
      withSuspense?: boolean | ((subState: any) => boolean);
      eq?: IsEqual<T>
    }
  ) => T;
  fetch: SIF;
};

const createSelector = (paths: string[], def: any = null) => (state) => {
  let subState = state;
  for (const p of paths) {
    if (!subState) {
      return def;
    }
    subState = subState[p];
  }
  return subState;
};

const handleCache = (options: CreateModelOptions<any, any, any>) => {
  if (options.cacheKey) {
    const { cacheKey, cacheStorage = 'session' } = options;
    let storeItem:StoreItem<any> = null;
    if (cacheStorage === 'session') {
      storeItem = createSessionItem(cacheKey);
    } else {
      storeItem = createPersistenceItem(
        cacheStorage === 'local' ? localStorage : cacheStorage,
        cacheKey,
        options.cacheVersion || JsonStringify(options.initialState),
      );
    }
    return {
      storeItem,
      state: storeItem.get() || options.initialState,
    };
  }
  return {
    storeItem: null,
    state: options.initialState,
  };
};

/**
 * 创建一个基于 Redux 的模型
 */
function createModel<
  STATE extends Record<string, any>,
  MCRA extends ModelCaseReducerActions<STATE>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  SIF extends InferModelFetch<STATE> = {}
>(
  options: CreateModelOptions<STATE, MCRA, SIF>,
  getStore: () => Store = _getStore,
):Model<STATE, MCRA, SIF> {
  const {
    statePaths,
    reducers,
    fetch: fetches,
    extraReducers,
  } = options;
  const prefix = statePaths.join('_').toUpperCase();
  const selector = createSelector(statePaths);
  const Dispatch = () => getStore().dispatch;

  const actions: Record<string, ActionCreator<any>> = {};
  let reducer: Reducer<STATE>;
  // @ts-ignore
  const fetch: SIF = {};
  let { state: subState, storeItem } = handleCache(options);

  const builder = new Builder<STATE>();
  for (const rKey of Object.getOwnPropertyNames(reducers)) {
    const reduceCase = reducers[rKey];
    const actionType = `${prefix}/${rKey}`;
    builder.addCase(actionType, reduceCase);
    actions[rKey] = (arg: any) => Dispatch()({
      ...(arg && typeof arg === 'object' ? arg : {}),
      type: actionType,
      payload: arg,
    });
  }

  if (extraReducers) {
    if (typeof extraReducers === 'function') {
      extraReducers(builder);
    } else if (typeof extraReducers === 'object') {
      for (const eKey of Object.getOwnPropertyNames(extraReducers)) {
        builder.addCase(eKey, extraReducers[eKey]);
      }
    }
  }

  if (fetches && typeof fetches === 'object') {
    for (const fKey of Object.getOwnPropertyNames(fetches)) {
      const fetcher = fetches[fKey];
      const fetchingType = `${prefix}/fetching-${fKey}`;
      const fetchedType = `${prefix}/fetched-${fKey}`;
      // @ts-ignore
      fetch[fKey] = createFetchHandler({
        fetcher,
        after([data, _, error]) {
          Dispatch()({ type: fetchedType, data, error });
        },
        before() {
          Dispatch()({ type: fetchingType });
        },
      });
      builder.addCase(fetchingType, (state) => {
        // @ts-ignore
        state[fKey] = setPending((state[fKey]), true);
      });
      builder.addCase(fetchedType, (state, action: ExtendAction<{ data, error }>) => {
        const { data, error } = action;
        if (error) {
          // 发生错误时，清空加载中的标识
          const originValue = state[fKey]?.valueOf();
          try {
            const newData = originValue ? setPending(current(state[fKey]), false) : originValue;
            // @ts-ignore
            state[fKey] = setProperty(newData, 'error', error);
          } catch (error) {
            // @ts-ignore
            state[fKey] = setProperty(originValue, 'error', error);
          }
        } else {
          // @ts-ignore
          state[fKey] = data;
        }
      });
    }
  }

  reducer = createReducerWithOpt(subState, {
    builder,
    onChange: (data) => {
      subState = data;
      if (storeItem) {
        storeItem.set(data);
      }
    },
  });

  const useModel = <T = any>(subSelector?: Selector<STATE, T>, config?: UseSelectorOptions<T>) => (
    useSelector((state) => (subSelector ? subSelector(selector(state)) : selector(state)), config)
  );

  const getState = () => selector(getStore().getState());

  return {
    fetch,
    actions,
    reducer,
    useModel,
    getState,
    isPending: (key: string) => isPending((getState() || {})[key]),
  } as any;
}

export {
  createModel,
  Builder,
};
export type {
  ModelCaseReducerActions,
  InferModelFetch,
  CreateModelOptions,
  ModelBaseOptions,
  ModelCacheOptions,
  InferModelActions,
  Model,
}
