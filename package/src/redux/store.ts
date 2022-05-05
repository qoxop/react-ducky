import { DefaultRootState } from '../typings';
import { RouteActionType } from './middleware';
import {
  Store,
  Reducer,
  compose,
  AnyAction,
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';
import {
  REDUX_DEVTOOL,
  STORE_UNINITIALIZED_ERROR
} from '../utils/constants';

type ReducerRecord = Record<string, Reducer>;

let store:Store = null;

const checkStore = () => {
  if (!store) throw new Error(STORE_UNINITIALIZED_ERROR);
  return true;
};

/**
 * 获取 store
 * @returns
 */
const getStore = () => checkStore() && store;

/**
 * 设置 store
 * @param _store
 * @returns 
 */
const setStore = (_store: Store) => store = _store;

type InitStoreOption = {
  isDev?: boolean;
  initState?: any;
  middleware?: any[];
  reducerRecord?: ReducerRecord;
  rootReducers?: ReducerRecord;
}

const createEnhancer = (middleware: any[], isDev = false) => {
  const composeEnhancers = isDev && window[REDUX_DEVTOOL] ? window[REDUX_DEVTOOL] : compose;
  return composeEnhancers(applyMiddleware(...middleware));
}

/**
 * 创建根 Reducer 方法
 * @param rootReducers
 * @param reducerRecord 
 * @returns 
 */
const createRootReducer = (rootReducers: ReducerRecord, reducerRecord?: ReducerRecord) => {
  const mainReducer = reducerRecord && Object.keys(reducerRecord).length ? 
    combineReducers(reducerRecord) :
    (state: DefaultRootState) => state;
  return (state:DefaultRootState, action: AnyAction) => {
    switch (action.type) {
      case RouteActionType:
        return { ...state, _CURRENT_ROUTE: action.payload };
      default:
        const { _CURRENT_ROUTE, ...otherState } = state;
        return { 
          ...(rootReducers[action.type] ? rootReducers[action.type](otherState, action) : mainReducer(otherState, action)),
          _CURRENT_ROUTE
        };
    }
  }
}

/**
 * 初始化 redux store
 * @param InitStoreOption
 * @returns 
 */
const initStore = <STATE = any>({
  isDev = false,
  initState = {},
  middleware = [],
  reducerRecord = {},
  rootReducers = {},
}: InitStoreOption) => {
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