import {
  Controller,
  ReduxController,
  useController,
  useCtrlContext,
  createUseReduxController,
  ctrlEnhance
} from 'rc-controller';

import {
  setStore,
  getStore,
  initStore,
  ReduxContext,
  ReduxProvider,
  useStore,
  useDispatch,
  useSelector,
  Builder,
  createModel,
  isEmpty,
  isPending,
  createFetchHandler,
} from 'rd-model';

const useReduxController = createUseReduxController(ReduxContext);

export {
  Controller,
  Controller as Controler,
  ReduxController,
  ReduxController as ReduxControler,
  useController,
  useCtrlContext,
  useReduxController,
  ctrlEnhance,
  setStore,
  getStore,
  initStore,
  ReduxContext,
  ReduxProvider,
  useStore,
  useDispatch,
  useSelector,
  Builder,
  createModel,
  isEmpty,
  isPending,
  createFetchHandler,
}

export type {
  Model,
  PayloadAction,
  ExtendAction,
} from 'rd-model';

