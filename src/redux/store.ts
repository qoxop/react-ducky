import {
  Store, Reducer, AnyAction, createStore, combineReducers,
} from 'redux';

type ReducerRecord = { [key: string]: Reducer };

let store:Store = null;

const checkStore = () => {
  if (!store) {
    throw new Error('store 未初始化');
  }
  return true;
};
const getStore = () => checkStore() && store;
const setStore = (_store: Store) => store = _store;

// TODO：考虑一下多实例的情况
type InitStoreOption = {
  reducerRecord?: ReducerRecord;
  initState?: any;
  enhancer?: any;
}
const initStore = <STATE = any>({
  reducerRecord = {},
  initState = {},
  enhancer,
}: InitStoreOption) => {
  store = createStore(
    Object.keys(reducerRecord).length ? combineReducers(reducerRecord) : (state = initState) => state,
    initState,
    enhancer,
  );
  const updateReducer = (reducers: ReducerRecord, force = false) => {
    let hasNew = false;
    for (const key in reducers) {
      if (
        Object.prototype.hasOwnProperty.call(reducers, key)
          && (!reducerRecord[key] || force)
      ) {
        hasNew = true;
        reducerRecord[key] = reducers[key];
      }
    }
    if (hasNew) {
      store.replaceReducer(combineReducers(reducerRecord));
    }
  };
  return {
    store: store as Store<STATE, AnyAction>,
    updateReducer,
  };
};

export {
  getStore,
  setStore,
  initStore,
};
