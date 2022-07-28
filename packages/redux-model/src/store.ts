/**
 * redux store 管理
 */
import { DefaultRootState } from '../typings';
import {
  Store,
  Reducer,
  compose,
  AnyAction,
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

/**
 * reducer 切片配置对象
 */
type ReducerRecord = Record<string, Reducer>;

const STORE_UNINITIALIZED_ERROR = 'Store 未初始化';
const REDUX_DEVTOOL = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';

let store:Store = null as any;

/**
 * 检查 store 对象是否已经完成初始化
 */
function checkStore() {
  if (!store) throw new Error(STORE_UNINITIALIZED_ERROR);
  return true;
};

/**
 * 获取 Store
 */
function getStore() {
  return checkStore() && store;
}

/**
 * 设置 store
 * @param _store redux store 对象
 */
function setStore(_store: Store) {
  store = _store;
}

/**
 * 初始化 Store 的配置项
 */
type InitStoreOption = {
  /**
   * 是否开发模式
   */
  isDev?: boolean;
  /**
   * 初始值
   */
  initState?: any;
  /**
   * 中间件列表
   */
  middleware?: any[];
  /**
   * 切片 reducer
   */
  reducerRecord?: ReducerRecord;
  /**
   * 根 reducer
   */
  rootReducers?: ReducerRecord;
}

function createEnhancer(middleware: any[], isDev = false) {
  const composeEnhancers = isDev && window[REDUX_DEVTOOL] ? window[REDUX_DEVTOOL] : compose;
  return composeEnhancers(applyMiddleware(...middleware));
}

/**
 * 创建根 Reducer 方法
 * @param rootReducers 根 reducer 对象，它的 key 值就是 actionType，其作用的数据范围是全局的 state。
 * @param reducerRecord 切片 reducer 对象，它的 key 值是切片的 key，其作用的数据范围时当前切片对应的 state。
 */
function createRootReducer<State>(rootReducers: ReducerRecord, reducerRecord?: ReducerRecord) {
  const mainReducer = reducerRecord && Object.keys(reducerRecord).length
    ? combineReducers(reducerRecord)
    : (state: State) => state;
  return (state:State, action: AnyAction) => (
    rootReducers[action.type]
      ? rootReducers[action.type](state, action)
      : mainReducer(state, action)
  )
}

/**
 * 初始化 redux store
 * @param options {@link InitStoreOption}
 */
function initStore<STATE extends DefaultRootState>(options: InitStoreOption) {
  const {
    isDev = false,
    initState = {},
    middleware = [],
    reducerRecord = {},
    rootReducers = {},
  } = options;
  const _store = createStore(
    createRootReducer(rootReducers, reducerRecord),
    initState,
    createEnhancer(middleware, isDev),
  );
  const updateReducer = (reducers: ReducerRecord, force = false) => {
    let hasNew = false;
    for (const key in reducers) {
      if (Object.prototype.hasOwnProperty.call(reducers, key) && (!reducerRecord[key] || force)) {
        reducerRecord[key] = reducers[key];
        hasNew = true;
      }
    }
    if (hasNew) {
      _store.replaceReducer(createRootReducer(rootReducers, reducerRecord));
    }
  };
  if (!store) {
    store = _store;
  }
  return {
    updateReducer,
    store: _store as Store<STATE, AnyAction>,
  };
};

export {
  getStore,
  setStore,
  initStore,
};

export type {
  InitStoreOption,
  ReducerRecord,
}
