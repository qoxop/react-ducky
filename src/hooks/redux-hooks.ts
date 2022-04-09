import {
  useRef,
  useMemo,
  useEffect,
  useContext,
  useReducer,
  createContext,
  createElement,
  useLayoutEffect,
} from 'react';
import { 
  Store,
  bindActionCreators,
} from 'redux';

import { DefaultRootState, IsEqual, Klass, Selector } from '../typings';
import { isPending, OutPromise } from '../utils/async';
import { ReduxSubscriber } from '../helper/state-subscriber';
import { $classHooks, Controller, ReduxController } from '../helper/controller';


const ReduxContext = createContext<{store?: Store, subscriber?: ReduxSubscriber }>({});

const ReduxProvider = ({ store, children }: { store: Store, children: any }) => {
    const contextValue = useMemo(() => ({ store, subscriber: new ReduxSubscriber(store) }), [store]);
    useEffect(() => contextValue.subscriber.destroy, [contextValue]);
    return createElement(ReduxContext.Provider, { value: contextValue }, children)
}

const useDispatch = () => (useContext(ReduxContext).store.dispatch);

const defEq = <T>(last: T, cur: T) => {
  if (last === cur) return true;
  if (cur && last && typeof cur === 'object' && typeof last === 'object') {
    const curKeys = Object.keys(cur);
    return curKeys.every(k => cur[k] === last[k]) && curKeys.length === Object.keys(last).length;
  }
  return false;
}

type UseSelectorOptions<P> = {
  eq?: IsEqual<P>,
  useThrow?: boolean | ((subState: P) => boolean);
}
const useSelector = <S = DefaultRootState, P = any>(selector: Selector<S, P>, options: UseSelectorOptions<P> = {}) => {
  const { eq, useThrow } = useMemo(() => ({
    eq: options.eq || defEq,
    useThrow: options.useThrow === true ? isPending : (typeof options.useThrow === 'function' ? options.useThrow : null)
  }), []);
  const { subscriber, store } = useContext(ReduxContext);
  const [ forceTimes, forceRender ] = useReducer((s) => s + 1, 0);
  const subState = useMemo(() => selector(store.getState()), [store, forceTimes])
  const subStateRef = useRef<P>(subState);

  // 添加订阅
  useLayoutEffect(() => {
    const symbolKey = Symbol();
    const _newSubState = selector(store.getState());
    if (!eq(_newSubState, subStateRef.current)) {
      Promise.resolve().then(forceRender);
      subStateRef.current = _newSubState;
    }
    subscriber.add(symbolKey, (appState) => {
      const newSubState = selector(appState);
      if (!eq(newSubState, subStateRef.current)) {
        forceRender();
        subStateRef.current = newSubState;
      }
    });
    return () => subscriber.remove(symbolKey);
  }, [store]);

  if (useThrow) {
      // 判断是否为 pending，如果是 pending 抛出一个 promise 的异常
    if (useThrow(subState)) {
      const { promise, resolve } = OutPromise<P>();
      const symbolKey = Symbol();
      subscriber.add(symbolKey, (appState) => {
        const newSubState = selector(appState);
        if (!useThrow(newSubState)) {
          resolve(newSubState);
          return true;
        }
      }, /* only once */ true);
      throw promise
    }
  }

  return subState;
}


type BParams0 = Parameters<typeof bindActionCreators>[0];
type UseActionsReturn<B, F> = [B, F] & { bindActions: B, fetchAtoms: F };
function useActions<AC extends BParams0, AAC extends BParams0>(model: { actions: AC, atomActions?: AAC, [k: string]: any }) {
  const { store } = useContext(ReduxContext);
  return useMemo(() => {
    const bindActions = bindActionCreators(model.actions || {} as AC, store.dispatch);
    const fetchAtoms = bindActionCreators(model.atomActions || {} as AAC, store.dispatch);
    const actions = [bindActions, fetchAtoms] as UseActionsReturn<typeof bindActions, typeof fetchAtoms>;
    actions.bindActions = bindActions;
    actions.fetchAtoms = fetchAtoms;
    return actions;
  }, [])
}


function useController<C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] {
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

function useReduxController<C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] {
  const { store } = useContext(ReduxContext)
  const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

function useCtrlContext<C  extends Klass & { Context: any } = any>(CtrlClass: C) {
  return useContext<InstanceType<C>>(CtrlClass.Context);
}


export {
  useActions,
  useDispatch,
  useSelector,
  ReduxProvider,
  useController,
  useReduxController,
  useCtrlContext,
  ReduxContext,
}
export type {
  UseSelectorOptions
}