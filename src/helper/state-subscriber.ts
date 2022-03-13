import { Store, Unsubscribe } from 'redux';
import { Selector } from '../typings';

type Handler = {
    callback: (state: any) => boolean | void,
    once?: boolean
}

export class Subscriber<S = unknown> {
    private listeners: Map<Symbol, Handler> = new Map();
    public emit(state: S) {
        this.listeners.forEach((handler, key, map) => {
            const handled = handler.callback(state);
            if (handler.once && handled) {
                map.delete(key);
            }
        });
    }
    public add<O extends boolean|void>(key: Symbol, handler: (state: any) => O, once?: O) {
        this.listeners.set(key, {
            callback: handler,
            once: !!once,
        });
    }
    public remove(key: Symbol) {
        this.listeners.delete(key);
    }
    public has(key: Symbol) {
        return this.listeners.has(key);
    }
    public clear() {
        this.listeners.clear();
    }
}

export class ReduxSubscriber extends Subscriber<any> {
    store: Store;
    unsubscribe: Unsubscribe;
    constructor(store: Store) {
        super();
        this.store = store;
        this.unsubscribe = this.store.subscribe(() => {
            this.emit(this.store.getState());
        });
    }
    public destroy() {
        this.clear();
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
    public getState<S = any, P = any>(selector?: Selector<S, P>): P {
        if (selector) {
            return selector(this.store.getState())
        }
        return this.store.getState();
    }
}