/**
 * 控制器
 */
import { produce } from "immer";
import { Dispatch, Store } from "redux";
import { Context, FunctionComponent, createContext, useState, useReducer, createElement } from 'react';

const $setState =  Symbol ? Symbol('$setState') : '$__controller_$_set_state';
const $forceUpdate =  Symbol ? Symbol('$forceUpdate') : '$__controller_$_force_update';

const $classHooks = Symbol ? Symbol('$classHooks') : '$__controller_$_class_hooks';
const $bindThis =  Symbol ? Symbol('$bindThis') : '$__controller_$_bind_this';

/**
 * Controller 装饰器：
 * @param options.useCtx 提供 React Provider 、Context 等属性
 * @param options.bindThis 自动给方法绑定 this 对象
 * @returns
 */
function ctrlEnhance(options:{useCtx?: boolean, bindThis?: boolean} = {}) {
    const {useCtx = true, bindThis = false } = options;
    return (target: any) => {
        if (useCtx) {
            const CtrlContext: Context<any> = createContext(null);
            const CtrlProvider = (props: { controller: unknown, children: unknown }) => createElement(CtrlContext.Provider, { value: props.controller }, props.children);
            Object.defineProperties(target, {
                'Provider': {
                    value: CtrlProvider
                },
                'Context': {
                    value: CtrlContext
                }
            });
        }
        if (bindThis) {
            const protoFnKeys = Object.getOwnPropertyNames(target.prototype).filter(key => {
                const item = target.prototype[key];
                return (typeof item === 'function' && !/^use/.test(key) && key !== 'constructor');
            });
            Object.defineProperty(target.prototype, $bindThis, {
                value: function(self:any) {
                    for(let i = 0; i < protoFnKeys.length; i++) {
                        const key = protoFnKeys[i];
                        self[key] = (target.prototype[key] as Function).bind(self);
                    }
                }
            })
        }
        return target;
    }
}

/**
 * 控制器 - 模拟 class 组件行为
 */
class Controller<State = any, Props = any> {
    static Context: Context<any> = createContext(null);
    static Provider: FunctionComponent<{ controller: unknown, children: unknown }>;
    // class like 
    state: State = {} as any;
    props: Props = {}  as any;
    readonly setState = (updater: Partial<State> | ((state: State) => void)) => this[$setState](updater);
    readonly forceUpdate = () => this[$forceUpdate]();
    public useHooks(): any {
        return {};
    };
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
        const [state, setState] = useState(this.state);
        this[$forceUpdate] = useReducer(a => (a + 1), 0)[1];
        this.state = state;
        this.props = props;
        if (!this[$setState]) {
            // 只赋值一次
            this[$setState] = (updater) => {
                if (typeof updater === 'function') {
                    setState(produce<State>(updater));
                } else {
                    setState((oldState) => Object.assign({}, oldState, updater));
                }
            }
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
}