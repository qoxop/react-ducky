import { Dispatch, Store } from "redux";
import { Context, FunctionComponent, createContext, useState, useCallback, useReducer, createElement } from 'react';
import { produce } from "immer";

const $setState =  Symbol ? Symbol('$setState') : '$__controller_$_set_state';
const $forceUpdate =  Symbol ? Symbol('$forceUpdate') : '$__controller_$_force_update';

export const $classHooks = Symbol ? Symbol('$classHooks') : '$__controller_$_class_hooks';
export const $bindThis =  Symbol ? Symbol('$bindThis') : '$__controller_$_bind_this';

export function ctrlEnhance(options:{useCtx?: boolean, bindThis?: boolean} = {}) {
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
 * 模拟 class 组件行为
 */
export class Controller<State = any, Props = any> {
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
        this[$setState] = useCallback((updater) => {
            if (typeof updater === 'function') {
                setState(produce<State>(updater));
            } else {
                setState((oldState) => Object.assign({}, oldState, updater));
            }
        }, []);
        this[$forceUpdate] = useReducer(a => (a + 1), 0)[1];
        this.state = state;
        if (props) {
            this.props = props;
        }
    }
}

export class ReduxController<S = any, P = any> extends Controller<S, P> {
    protected readonly dispatch: Dispatch;
    protected readonly store: Store;
    constructor(store: Store, props?: P) {
        super(props);
        this.store = store;
        this.dispatch = store.dispatch;
    }
}