import { Reducer, Store } from 'redux';

import { getStore } from './store'
import {
  Builder,
  createReducerWithOpt,
} from "./create-reducer";
import {
  useSelector,
  UseSelectorOptions,
} from "../hooks/redux-hooks";
import { 
  isPending,
  setPending,
  createFetchHandler,
} from "../utils/async";
import { 
  StoreItem,
  createPersistenceItem,
  createSessionItem,
} from "../utils/storage";
import { 
  IsEqual,
  ValidObj,
  Selector,
  PromiseFn,
  CaseReducer,
  ExtendAction,
  ActionCreator,
  CaseReducerWithoutAction,
  CaseReducerWithOtherAction,
  CaseReducerWithPayloadAction,
} from "../typings";

/**
 * reducer case 方法集合对象
 */
type ModelCaseReducers<State> = Record<string, CaseReducer<State>>

/**
 * 计算所有 ActionCreator 的类型集合
 * CRS CaseReducers
 */
export type CaseReducerActions<CRS> = {
  [key in keyof CRS]: CRS[key] extends CaseReducerWithoutAction<any> ?
    ActionCreator :
    CRS[key] extends CaseReducerWithPayloadAction<any, infer P> ?
    ActionCreator<P> :
    CRS[key] extends CaseReducerWithOtherAction<any, infer O> ?
    ActionCreator<O> :
    never;
}

/**
 * State 数据获取方法
 */
type StateFetch<State> = {
  [key in keyof State]?: PromiseFn<State[key]>
}

/**
 * 创建 model 的通用参数
 */
type CreateModelCommonOptions<
  STATE extends ValidObj,
  CRS extends ModelCaseReducers<STATE>,
  SF extends StateFetch<STATE> = StateFetch<STATE>
> = {
  statePaths: string[];
  initialState: STATE;
  reducers: CRS;
  fetch?: SF;
  extraReducers?: Record<string, CaseReducer<STATE>> | ((builder: Builder<STATE>) => void);
}

/**
 * 持久化配置
 */
export type CacheOptions = {
  cacheStorage: 'session'|'local'|Storage;
  cacheKey: string;
}

/**
 * Model 配置项
 */
type CreateModelOptions<
  STATE extends Record<string, any>,
  CRS extends ModelCaseReducers<STATE>,
  SF extends StateFetch<STATE> = StateFetch<STATE>
> =  CreateModelCommonOptions<STATE, CRS, SF> | (CreateModelCommonOptions<STATE, CRS, SF> & CacheOptions);


/**
 * Model 对象数据结构
 */
type Model<
  STATE extends ValidObj,
  CRS extends ModelCaseReducers<STATE>,
  SF extends StateFetch<STATE>,
  OPT = CreateModelOptions<STATE, CRS, SF>
> = {
  name: string;
  reducer: Reducer<STATE>;
  actions: CaseReducerActions<CRS>;
  getState: () => STATE;
  useModel: <T = STATE>(selector?: Selector<STATE, T>, config?: { useThrow?: boolean | ((subState: any) => boolean); eq?: IsEqual<T>}) => T;
} & (OPT extends { fetch: any } ? { fetch: SF } : {});

const createSelector = (paths: string[], def: any = null) => state => {
  let subState = state;
  for (const p of paths) {
      if (!subState) {
          return def;
      }
      subState = subState[p];
  }
  return subState;
}

const handleCache = (options: CreateModelOptions<any, any, any>) => {
  if ('cacheKey' in options) {
    const { cacheKey, cacheStorage } = options;
    let storeItem:StoreItem<any> = null;
    if (cacheStorage === 'session') {
      storeItem = createSessionItem(cacheKey);
    } else {
      storeItem = createPersistenceItem(
        cacheStorage === 'local' ? localStorage : cacheStorage,
        cacheKey,
        options.initialState
      )
    }
    return {
      storeItem,
      state: storeItem.get()
    }
  }
  return {
    storeItem: null,
    state: options.initialState
  }
}

const createModel =
<State extends Record<string, any>, CRS extends ModelCaseReducers<State>, SF extends StateFetch<State>>
(
  options:  CreateModelOptions<State, CRS, SF>,
  store?: Store
):Model<State, CRS, SF, CreateModelOptions<State, CRS, SF>> => {
  const {
    statePaths,
    reducers,
    fetch: fetches,
    extraReducers,
  } = options;
  const prefix = statePaths.join('_').toUpperCase();
  const selector = createSelector(statePaths);
  const Dispatch = () => (store || getStore()).dispatch;

  let actions: Record<string, ActionCreator<any>> = {};
  let reducer: Reducer<State>;
  let fetch: SF;
  let { state: subState, storeItem } = handleCache(options);

  const builder = new Builder<State>();
  for (const rKey in reducers) {
    const reduceCase = reducers[rKey];
    const actionType = `${prefix}/${rKey}`;
    builder.addCase(actionType, reduceCase);
    actions[rKey] = (arg: any) => {
      return Dispatch()({
        type: actionType,
        ...(arg && typeof arg === 'object' ? arg : {}),
        payload: arg,
      });
    };
  }

  if (extraReducers) {
    if (typeof extraReducers === 'function') {
        extraReducers(builder)
    } else if (typeof extraReducers === 'object') {
      for (const eKey in extraReducers) {
        builder.addCase(eKey, extraReducers[eKey]);
      }
    }
  }

  if (fetches && typeof fetches === 'object') {
    for (const fKey in fetches) {
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
          Dispatch()({ type: fetchingType })
        }
      });
      builder.addCase(fetchingType, (state) => {
        state[fKey] = setPending(state[fKey], true);
      });
      builder.addCase(fetchedType, (state, action: ExtendAction<{ data, error }>) => {
        const  { data, error } = action;
        if (error) {
          state[fKey] = Object.assign(Object(state[fKey]), { error });
        } else {
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

  const useModel = <T = any>(subSelector?: Selector<State, T>, config?: UseSelectorOptions<T>)  => (
    useSelector((state) => subSelector ? subSelector(selector(state)) : selector(state), config)
  );

  const getState = () => selector((store || getStore()).getState());

  return {
    fetch,
    actions,
    reducer,
    useModel,
    getState,
    isPending: (key: string) => isPending((getState() || {})[key]),
  } as any;
}

export default createModel;

