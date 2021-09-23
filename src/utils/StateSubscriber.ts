import { Store, Unsubscribe } from 'redux';
import { Selector } from '../typings'

type Handler = {
    callback: (state: any) => boolean | void,
    once?: boolean
}

export class StateSubscriber {
    store: Store;
    unsubscribe: Unsubscribe;
    private handlerMap: Map<Symbol, Handler> = new Map();
    constructor(store: Store) {
        this.store = store;
        this.unsubscribe = this.store.subscribe(() => {
            this.onStateChange(this.store.getState());
        });
    }
    public destroy() {
        if (this.unsubscribe) {
            this.handlerMap = new Map();
            this.unsubscribe();
        }
        
    }
    public getState<S = any, P = any>(selector?: Selector<S, P>): P {
        if (selector) {
            return selector(this.store.getState())
        }
        return this.store.getState();
    }
    public addListener<O extends boolean|void>(sKey: Symbol, handler: (state: any) => O, once?: O) {
        this.handlerMap.set(sKey, {
            callback: handler,
            once: !!once,
        });
    }
    public removeListener(sKey: Symbol) {
        this.handlerMap.delete(sKey);
    }
    public hasListener(sKey: Symbol) {
        return this.handlerMap.has(sKey);
    }
    private onStateChange(state: any) {
        this.handlerMap.forEach((handler, key, map) => {
            const handled = handler.callback(state);
            if (handler.once && handled) {
                map.delete(key);
            }
        })
    }
}