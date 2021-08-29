import { useState, useEffect, useRef } from 'react';

class StateSubscriber {
  store:any;
  private listener: Map<Symbol, (state:any) => void>;
  constructor(store) {
    this.store = store;
  }
  getState() {
    return this.store.getState();
  }
  addListener(sKey: Symbol, handler: (state:any) => void) {
    this.listener.set(sKey, handler);
  }
  removeListener(sKey: Symbol) {
    this.listener.delete(sKey);
  }
  afterDispatch(state) {
    this.listener.forEach((handler, key, map) => {
      try {
        handler(state);
      } catch (error) {
        console.error(error);
        map.delete(key);
      }
    })
  }
}

// 订阅者实例
let subscriber:StateSubscriber;

const hookMiddleware = (store) => {
  subscriber = new StateSubscriber(store);
  return (nextDispatch) => (action) => {
    // 执行动作
    nextDispatch(action);
    // 执行动作后的回调方法
    subscriber.afterDispatch(store.getState());
  }
}

type Selector<S = any, P = any> = (state: S) => P;
type EqualityFn<P = any> = (last: P, current: P) => boolean;
function useSelector<S = any, P = any>(
  selector: Selector<S, P>,
  equalityFn: EqualityFn<P> = (last, cur) => (last === cur),
) {
  const [state, setState] = useState<P>(selector(subscriber.getState()));
  const stateRef = useRef<P>(state);
  useEffect(() => {
    const symbolKey = Symbol();
    subscriber.addListener(symbolKey, (currentStates) => {
      const curState = selector(currentStates);
      if (!equalityFn(curState, stateRef.current)) {
        setState(curState);
        stateRef.current = curState;
      }
    });
    return () => subscriber.removeListener(symbolKey);
  }, []);
  return state;
}
function useStore() {
  return subscriber.store;
}
function useDispatch() {
  return subscriber.store.dispatch;
}

export {
  useStore,
  useDispatch,
  useSelector,
  hookMiddleware,
}
