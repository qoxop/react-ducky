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
 * Controller 装饰器：
 * @param options.useCtx 提供 React Provider 、Context 等属性
 * @param options.bindThis 自动给方法绑定 this 对象
 * @returns
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
  static Context: Context<any> = createContext(null);

  static Provider: FunctionComponent<{ controller: unknown, children: unknown }>;

  // class like
  state: State = {} as any;

  props: Props = {} as any;

  readonly setState = (updater: Partial<State> | FunctionLike<[State], void>) => (
    this[$setState](updater)
  );

  readonly forceUpdate = () => this[$forceUpdate]();

  // eslint-disable-next-line class-methods-use-this
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
    if (!this[$setState]) {
      // 只赋值一次
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
 * ReduxController 结合 Redux 使用的控制器
 */
class ReduxController<S = any, P = any> extends Controller<S, P> {
  protected readonly dispatch: Dispatch;

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
