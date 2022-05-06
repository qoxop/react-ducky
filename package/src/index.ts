/**
 * React-Ducky 是一个专门为 React 应用编写的状态和缓存管理工具库。
 * 它对 Redux 进行了封装，通过切片的方式简化了 Redux 状态的管理和使用，同时还提供了与浏览器路由栈行为一致的页面缓存控制。
 * 
 * React-Ducky 核心目的在于通过提供便捷的状态和缓存管理方法。让使用者能够有更多的精力去关注业务逻辑本身，从而提升效率，同时让代码更加简洁。
 * @packageDocumentation
 */
import * as historyHelper from './utils/history';

export {
  historyHelper
}

export * from './redux/create-model';

export {
  thunkMiddleware,
  historyMiddleware,
} from './redux/middleware';

export * from './redux/store';

export {
  Controller,
  ReduxController,
  ctrlEnhance
} from './helper/controller';

export * from './utils/async';
export { isEmpty } from './utils/object';

export {
  withPageHook
} from './react/hoc';

export {
  ReduxContext,
  ReduxProvider,
  DuckyProvider,
} from './react/context'

export * from './react/hooks';

export * from './typings';