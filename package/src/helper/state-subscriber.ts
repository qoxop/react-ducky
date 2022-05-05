import { Store, Unsubscribe } from 'redux';
import { DefaultRootState, FunctionLike, Selector } from '../typings';

type Handler = {
  callback: FunctionLike<[any], boolean | void>,
  once?: boolean,
  sync?: boolean,
}

class Subscriber<S = unknown> {
  private listeners: Map<symbol, Handler> = new Map();

  public emit(state: S, sync: boolean) {
    this.listeners.forEach((handler, key, map) => {
      if (!!handler.sync === sync) {
        const handled = handler.callback(state);
        if (handler.once && handled) {
          map.delete(key);
        }
      }
    });
  }

  public add(
    key: symbol,
    handler: FunctionLike<[any], void | boolean>,
    options?: {once?: boolean, sync?: boolean}
  ) {
    this.listeners.set(key, {
      callback: handler,
      ...options,
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
        this.emit(this.store.getState(), true);
        const execute = delayExecute = () => this.emit(this.store.getState(), false);
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
