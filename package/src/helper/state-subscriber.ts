import { Store, Unsubscribe } from 'redux';
import { DefaultRootState, FunctionLike, Selector } from '../typings';

type Handler = {
  callback: FunctionLike<[any], boolean | void>,
  once?: boolean
}

class Subscriber<S = unknown> {
  private listeners: Map<symbol, Handler> = new Map();

  public emit(state: S) {
    this.listeners.forEach((handler, key, map) => {
      const handled = handler.callback(state);
      if (handler.once && handled) {
        map.delete(key);
      }
    });
  }

  public add<O extends boolean|void>(key: symbol, handler: FunctionLike<[any], O>, once?: O) {
    this.listeners.set(key, {
      callback: handler,
      once: !!once,
    });
  }

  public remove(key: symbol) {
    this.listeners.delete(key);
  }

  public has(key: symbol) {
    return this.listeners.has(key);
  }

  public clear(){
    this.listeners.clear();
  }
}
class ReduxSubscriber<STATE = DefaultRootState> extends Subscriber<STATE> {
  store: Store;
  unsubscribe: Unsubscribe;

  constructor(store: Store) {
    super();
    this.store = store;
    this.startListen()
  }
  public startListen() {
    let delayExecute: () => void;
    if (!this.unsubscribe) {
      this.unsubscribe = this.store.subscribe(() => {
        const execute = delayExecute = () => this.emit(this.store.getState());
        Promise.resolve().then(() => {
          if (delayExecute === execute) {
            delayExecute();
          }
        });
      });
    }
  }

  public destroy() {
    this.clear();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.unsubscribe = null;
  }

  public getState = <S = any, P = any>(selector?: Selector<S, P>): P => {
    if (selector) {
      return selector(this.store.getState());
    }
    return this.store.getState();
  }
}

export {
  Subscriber,
  ReduxSubscriber,
};
