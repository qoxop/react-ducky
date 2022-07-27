/**
 * rd-model 是一个为了简化 redux 在 react 应用中使用的工具库。
 *
 * 核心功能在于将 reducer 切片进行统一封装，将某个 reducer 切片的初始值定义、动作派发函数、reducer 函数、数据加载，状态订阅等汇总在一起。
 * 让你在 react 中使用 redux 就像是在定义和使用一个数据模型一样简单。
 * @packageDocumentation
 */
export {
  setStore,
  getStore,
  initStore
} from './src/store';

export {
  ReduxContext,
  ReduxProvider,
} from './src/context';

export {
  useStore,
  useDispatch,
  useSelector,
} from './src/hooks';

export {
  Builder,
  createModel,
} from './src/create-model';

export {
  isEmpty,
  isPending,
  createFetchHandler,
} from './src/utils';

export type {
  PayloadAction,
  ExtendAction,
  Selector,
} from './typings';

export type {
  FetchHandlerOptions
} from './src/utils'

export type {
  UseSelectorOptions
} from './src/hooks';

export type {
  Model,
  CreateModelOptions
} from './src/create-model';