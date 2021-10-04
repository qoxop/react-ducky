import { Dispatch, Store } from "redux";
import { Context, FunctionComponent, createContext, useState, useCallback, useReducer, createElement } from 'react';
import { Draft, produce } from "immer";

const $classHooks = Symbol ? Symbol('$classHooks') : '$__controller_$class_hooks';

export function withContext(target: any) {
    let CtrlContext: Context<any> = null;
    let CtrlProvider: FunctionComponent<{ controller: any, children: any }> = null;
    const lazyInit = () => {
        if (!CtrlContext) {
            CtrlContext = createContext(null);
            CtrlProvider = function Provider(props: { controller: unknown, children: unknown }) {
                return createElement(CtrlContext.Provider, { value: props.controller }, props.children);
            }
        }
    }
    Object.defineProperties(target, {
        'Provider': {
            get() {
                lazyInit();
                return CtrlProvider;
            }
        },
        'Context': {
            get() {
                lazyInit();
                return CtrlContext;
            }
        }
    })
}

/**
 * 模拟 class 组件行为
 */
export class Controler<S = {}> {
    static Context: Context<any> = createContext(null);
    static Provider: FunctionComponent<{ controller: unknown, children: unknown }>;
    protected state: S;
    private _setState: (updater: Partial<S> | ((s: Draft<S>) => void)) => void;
    protected get setState() {
        return this._setState;
    }
    protected set setState(val) {
        if (!this._setState) {
            this._setState = val;
        }
    }
    private _forceUpdate: () => void;
    protected get forceUpdate() {
        return this._forceUpdate;
    };
    protected set forceUpdate(val) {
        if (!this._forceUpdate) {
            this._forceUpdate = val;
        }
    };
    public useInit() {};
    // 模拟 class组件的 setState、forceUpdate 方法
    [$classHooks]() {
        const [state, setState] = useState(this.state);
        this.state = state;
        this.setState = useCallback((updater) => {
            if (typeof updater === 'function') {
                setState(produce(updater));
            } else {
                setState((oldState) => Object.assign(oldState, updater));
            }
        }, []);
        this.forceUpdate = useReducer(a => (a + 1), 0)[1];
    }
}

export class ReduxControler<S = {}> extends Controler<S> {
    protected readonly dispatch: Dispatch;
    protected readonly store: Store;
    constructor(store: Store) {
        super();
        this.store = store;
        this.dispatch = store.dispatch;
    }
}