/* eslint-disable max-classes-per-file */
/**
 * 控制器
 */
import React, { Context, FunctionComponent } from 'react';
import { produce } from 'immer';
import { Dispatch, Store } from 'redux';
import { FunctionLike } from '../typings';

const {
  useState,
  useReducer,
  createContext,
} = React;

const $setState = Symbol ? Symbol('$setState') : '$__controller_$_set_state';
const $forceUpdate = Symbol ? Symbol('$forceUpdate') : '$__controller_$_force_update';
const $classHooks = Symbol ? Symbol('$classHooks') : '$__controller_$_class_hooks';
const $bindThis = Symbol ? Symbol('$bindThis') : '$__controller_$_bind_this';

/**
 * Controller 装饰器
 * @param options 配置对象
 * @remarks
 * 类型说明:
 * ```ts
 * type OptionsType = {
 *  // 提供 React Provider 、Context 等属性
 *  useCtx?: boolean;  
 *  // 自动给方法绑定 this 对象
 *  bindThis?: boolean;
 * }
 * ```
 */
function ctrlEnhance(options:{useCtx?: boolean, bindThis?: boolean} = {}) {
  const { useCtx = true, bindThis = false } = options;
  return (target: any) => {
    if (useCtx) {
      const CtrlContext: Context<any> = createContext(null);
      const CtrlProvider:React.FC<{
        controller: unknown,
        children: any
      }> = ({ controller, children }) => (
        <CtrlContext.Provider value={controller}>
          {children}
        </CtrlContext.Provider>
      )

      Object.defineProperties(target, {
        Provider: {
          value: CtrlProvider,
        },
        Context: {
          value: CtrlContext,
        },
      });
    }
    if (bindThis) {
      const protoFnKeys = Object.getOwnPropertyNames(target.prototype).filter((key) => {
        const item = target.prototype[key];
        return (typeof item === 'function' && !/^use/.test(key) && key !== 'constructor');
      });
      Object.defineProperty(target.prototype, $bindThis, {
        value(self:any) {
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < protoFnKeys.length; i++) {
            const key = protoFnKeys[i];
            self[key] = (target.prototype[key] as FunctionLike).bind(self);
          }
        },
      });
    }
    return target;
  };
}

/**
 * 控制器 - 模拟 class 组件行为
 */
class Controller<State = any, Props = any> {
  /**
   * 存放实例对象的 Context 
   */
  static Context: Context<any> = createContext(null);
  /**
   * 提供实例对象的 Provider
   */
  static Provider: FunctionComponent<{ controller: unknown, children: unknown }>;

  /**
   * 模拟 class 组件的 state
   * @readonly
   */
  state: State = {} as any;
  /**
   * 组件的 props 引用
   * @readonly
   */
  props: Props = {} as any;

  /**
   * 模拟 class 组件的 setState
   * @readonly
   */
  readonly setState = (updater: Partial<State> | FunctionLike<[State], void>) => (
    this[$setState](updater)
  );
  /**
   * 强制更新组件
   * @readonly
   */
  readonly forceUpdate = () => this[$forceUpdate]();

  /**
   * hooks 回调函数，需要被使用者重写
   * @override
   */
  public useHooks(): any {
    return {};
  }

  constructor(props?: Props) {
    if (props) {
      this.props = props;
    }
    if (this[$bindThis]) {
      this[$bindThis](this);
    }
  }

  // 模拟 class组件的 setState、forceUpdate 方法
  [$classHooks](props?:Props) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState(this.state);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    this[$forceUpdate] = useReducer((a) => (a + 1), 0)[1];
    this.state = state;
    this.props = props;
    if (!this[$setState]) { // 只赋值一次
      this[$setState] = (updater) => {
        if (typeof updater === 'function') {
          setState(produce<State>(updater));
        } else {
          setState((oldState) => ({ ...oldState, ...updater }));
        }
      };
    }
  }
}

/**
 * ReduxController 结合 Redux 使用的控制器，继承自 {@link Controller}
 */
class ReduxController<S = any, P = any> extends Controller<S, P> {
  /**
   * redux dispatch 方法
   */
  protected readonly dispatch: Dispatch;
  /**
   * redux store 对象
   */
  protected readonly store: Store;

  constructor(store: Store, props?: P) {
    super(props);
    this.store = store;
    this.dispatch = store.dispatch;
  }
}

export {
  Controller,
  ReduxController,
  ctrlEnhance,
  $classHooks,
  $bindThis,
};
