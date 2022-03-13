import { Store, createStore, Reducer, combineReducers } from "redux";

type ReducerRecord =  { [key: string]: Reducer };

let store:Store = null;

const checkStore = () => {
    if (!store) {
        throw new Error('please execute initReduxDucky(store)');
    }
    return true
}
const getStore = () => checkStore() && store;
const getReduxState = () => checkStore() && store.getState();
const getReduxDispatch = () => checkStore() && store.dispatch;
const setReduxStore = (_store: Store) => store = _store;


const initReduxStore = (rootReducerRecord: ReducerRecord, initState: any, enhancer?: any) => {
  store = createStore(combineReducers(rootReducerRecord), initState, enhancer);
  const mergeReducer = (reducers: ReducerRecord, force: boolean = false) => {
    let hasNew = false;
    for (const key in reducers) {
        if (
          Object.prototype.hasOwnProperty.call(reducers, key)
          && (!rootReducerRecord[key] || force)
        ) {
          hasNew = true;
          rootReducerRecord[key] = reducers[key];
        }
    }
    if (hasNew) {
      store.replaceReducer(combineReducers(rootReducerRecord));
    }
  }
  return {
    store,
    mergeReducer
  }
}

export {
  getStore,
  getReduxState,
  setReduxStore,
  initReduxStore,
  getReduxDispatch,
}