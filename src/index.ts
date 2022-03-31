import { 
  useDispatch,
  useSelector,
  useController,
  ReduxContext,
  ReduxProvider,
  useCtrlContext,
  useReduxController,
} from './hooks/redux-hooks';
import createModel from './redux/create-model';
import { initReduxStore, setReduxStore } from './redux/store';
import { createReducer } from './redux/create-reducer';
import { thunkMiddleware } from './middleware/thunk-middleware';
import {
  Controller,
  ReduxController,
  ctrlEnhance
} from "./helper/controller"
import {
  createFetchHandler,
  createPaginationHandler
} from './utils/async';
import { useFetcher } from './hooks/async-hooks';

/**
 * hooks
 */
export {
  useSelector,  // 查数据
  useDispatch,  // 获取 Dispatch 方法
  useFetcher
}

/** 
 * Redux
 */
export  {
  createModel,
  ReduxContext,
  ReduxProvider,
  initReduxStore,
  setReduxStore,
}

/** 
 * Controller
 */
export {
  Controller,
  ReduxController,
  useController,
  useReduxController,
  ctrlEnhance,
  useCtrlContext,
}

export { 
  createFetchHandler,
  createPaginationHandler,
}
// legacy
export {
  createReducer,
  thunkMiddleware,
}

export * from './typings';
