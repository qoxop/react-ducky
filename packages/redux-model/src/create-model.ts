/**
 * 封装用于创建 redux-model 的方法
 */
import { current } from 'immer';
import { Store, Reducer } from 'redux';
import { getStore as _getStore } from './store';
import { useSelector, UseSelectorOptions } from './hooks';
import { Builder, createReducerWithOpt } from './create-reducer';
import {
  setProperty,
  isPending,
  setPending,
  createFetchHandler,
  StoreItem,
  createPersistenceItem,
  createSessionItem,
  createAtomChunk,
} from './utils';
import {
  XOR,
  IsEqual,
  ValidObj,
  Selector,
  ReducerCase,
  ExtendAction,
  FunctionLike,
  ActionCreator,
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
  [key in keyof STATE]?: (...args: any[]) => Promise<STATE[key]>;
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
  /**
   * @deprecated
   * 
   * 这是兼容旧版API写法，请改为 `statePaths`
   */
  selector?: (appState: any) => any;
  /**
   * @deprecated
   * 
   * 这是兼容旧版API写法，请改为 `fetch`
   */
  atomFetchers?: SIF;
  extraReducers?: Record<string, ReducerCase<STATE>> | FunctionLike<[Builder<STATE>], void>;
}

/**
 * 缓存配置
 */
type ModelCacheOptions = {
  cacheKey: string;
  cacheStorage: 'session'|'local'|Storage;
  cacheVersion?: string;
  /**
   * @deprecated
   * 
   * 这是兼容旧版API写法，请改为 `cacheStorage`
   */
  persistence?: 'session'|'local';
  /**
   * @deprecated
   * 
   * 这是兼容旧版API写法，请改为 `cacheKey`
   */
  persistenceKey?: string;
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
    let storeItem:StoreItem<any> = null as any;
    if (cacheStorage === 'session') {
      storeItem = createSessionItem(cacheKey);
    } else {
      storeItem = createPersistenceItem(
        cacheStorage === 'local' ? localStorage : cacheStorage,
        cacheKey,
        options.cacheVersion || JSON.stringify(options.initialState),
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

function _defaultIsPending(subState: any) {
  return subState?.isPending || subState === undefined || subState === null;
}
/**
 * 创建一个基于 Redux 的状态模型
 * @param options 配置对象 {@link CreateModelOptions}
 * @param getStore 获取 `redux store` 的方法，多 redux 实例时使用
 * @returns 返回状态模型 {@link Model}
 */
function createModel<
  STATE extends Record<string, any>,
  MCRA extends ModelCaseReducerActions<STATE>,
  SIF extends InferModelFetch<STATE> = {}
>(
  options: CreateModelOptions<STATE, MCRA, SIF>,
  getStore: () => Store = _getStore as any,
):Model<STATE, MCRA, SIF> {
  // 兼容旧版 API
  if (options.persistence) {
    options.cacheStorage = options.persistence
  }
  if (options.persistenceKey) {
    options.cacheKey = options.persistenceKey;
  }
  let {
    name,
    statePaths,
    reducers,
    fetch: fetches,
    extraReducers,
    selector,
    atomFetchers,
  } = options;
  const isOld = !statePaths;
  // fetches = fetches || options.atomFetchers;
  // 兼容旧版 API
  const prefix = !isOld ? statePaths.join('_').toUpperCase() : name;
  selector = !isOld ? createSelector(statePaths) : (selector || ((state) => state[name]));
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
    // 兼容旧版 API
    if (isOld) {
      actions[rKey] = (arg: any) => ({
        ...(arg && typeof arg === 'object' ? arg : {}),
        type: actionType,
        payload: arg,
      });
    } else {
      actions[rKey] = (arg: any) => Dispatch()({
        ...(arg && typeof arg === 'object' ? arg : {}),
        type: actionType,
        payload: arg,
      });
    }
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
  // 兼容旧版本 API
  let atomActions: any;
  if (atomFetchers) {
    atomActions = Object.keys(atomFetchers).reduce((pre, aKey) => {
      const actionType = `${prefix}/fetch_${aKey}`;
      // action
      pre[aKey] = createAtomChunk(actionType, atomFetchers[aKey]);
      // reducer 
      builder.addCase(actionType, (state, action: PayloadAction<any>) => {
          const { payload } = action;
          // @ts-ignore
          state[aKey] = Object.assign({}, state[aKey], payload);
      });
      return pre;
  }, {});
  }
  if (fetches && typeof fetches === 'object') {
    for (const fKey of Object.getOwnPropertyNames(fetches)) {
      const fetcher = fetches[fKey];
      const fetchingType = `${prefix}/fetching-${fKey}`;
      const fetchedType = `${prefix}/fetched-${fKey}`;
      // @ts-ignore
      fetch[fKey] = createFetchHandler({
        // @ts-ignore
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
      // @ts-ignore
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

  const useModel = <T = any>(subSelector?: Selector<STATE, T>, config: UseSelectorOptions<T> = {}) => {
    // @ts-ignore 兼容旧版本API
    if (config.usePending) {
      config.withSuspense = _defaultIsPending;
    }
    // @ts-ignore 兼容旧版本API
    if (config.isEqual) {
      // @ts-ignore 兼容旧版本API
      config.eq = config.isEqual;
    }
    return useSelector((state) => (subSelector ? subSelector(selector(state)) : selector(state)), config);
  };

  const getState = () => selector(getStore().getState());

  return {
    name,
    fetch,
    actions,
    reducer,
    useModel,
    getState,
    atomActions,
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
