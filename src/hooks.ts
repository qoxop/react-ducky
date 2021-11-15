import { useRef, useMemo, useLayoutEffect, useContext, useReducer, createContext, useEffect, createElement } from 'react';
import { ReduxSubscriber } from './utils/StateSubscriber';
import { bindActionCreators, Store } from 'redux';
import { EqualityFn, Klass, Selector } from './typings';
import { isPromise } from './utils/is-type';
import { OutPromise } from './utils/async'
import { Controler, $classHooks, ReduxControler } from './controller';


export const ReduxContext = createContext<{store?: Store, subscriber?: ReduxSubscriber }>({});

function ReduxProvider({ store, children }: { store: Store, children: any }) {
    const contextValue = useMemo(() => ({
        store,
        subscriber: new ReduxSubscriber(store)
    }), [store]);
    useEffect(() => contextValue.subscriber.destroy, [contextValue]);
    return createElement(ReduxContext.Provider, {value: contextValue}, children)
}

function useStore() {
  const { store } = useContext(ReduxContext);
  return store;
}
function useDispatch() {
  const { store } = useContext(ReduxContext);
  return store.dispatch;
}


function _defaultIsEqual(last: any, cur: any) {
  return last === cur;
}
function _defaultIsPending(subState: any) {
  return subState?.isPending || subState === undefined || subState === null;
}
function _useSelector<S = any, P = any>(
  selector: Selector<S, P>,
  isEqual: EqualityFn<P> = (last, cur) => (last === cur),
) {
  const { subscriber, store } = useContext(ReduxContext);
  const [forceTimes, forceRender] = useReducer((s) => s + 1, 0);
  const subState = useMemo(() => selector(store.getState()), [store, selector, isEqual, forceTimes])
  const subStateRef = useRef<P>(subState);

  useLayoutEffect(() => {
    const symbolKey = Symbol();
    const _newSubState = selector(store.getState());
    if (!isEqual(_newSubState, subStateRef.current)) {
      forceRender();
      subStateRef.current = _newSubState;
    }
    subscriber.add(symbolKey, (appState) => {
      const newSubState = selector(appState);
      if (!isEqual(newSubState, subStateRef.current)) {
        forceRender();
        subStateRef.current = newSubState;
      }
    });
    return () => subscriber.remove(symbolKey);
  }, [store, selector, isEqual]);

  return { subState, store, subscriber };
}

function createUseSelector(
  defaultIsEqual: EqualityFn = _defaultIsEqual
) {
  return function useSelector<S = any, P = any> (
    selector: Selector<S, P>,
    isEqual: EqualityFn<P> = defaultIsEqual,
  ) {
    const { subState } = _useSelector(selector, isEqual);
    return subState;
  }
}

function createUseGetAsyncState(
  config: { 
    defaultIsEqual: EqualityFn,
    defaultIsPending: any
  } = { defaultIsEqual: _defaultIsEqual, defaultIsPending: _defaultIsPending }
) {
  const { defaultIsEqual, defaultIsPending } = config;
  return function useGetAsync<S = any, P = any>(
    selector: Selector<S, P>,
    options: {
      isEqual?: EqualityFn<P>,
      isPending?: (subState: P, state?: S) => boolean;
    } = {}
  ) {
    const { isPending = defaultIsPending, isEqual = defaultIsEqual } = options;
    const { subState, subscriber } = _useSelector(selector, isEqual)

    if (isPromise(subState)) {
      throw subState;
    }
    if (isPending(subState)) {
      const { promise, resolve } = OutPromise<P>();
      const symbolKey = Symbol();
      subscriber.add(symbolKey, (appState) => {
        const newSubState = selector(appState);
        if (!isPending(newSubState)) {
          resolve(newSubState);
          return true;
        }
      }, /* only once */ true);
      throw promise
    }
    return subState;
  }
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

const useSelector = createUseSelector();
const useGetAsyncState = createUseGetAsyncState();


function useController<C extends Controler, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] {
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

function useReduxController<C extends ReduxControler, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] {
  const { store } = useContext(ReduxContext)
  const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

function uesCtrlContext<C  extends Klass & { Context: any } = any>(CtrlClass: C) {
  return useContext<InstanceType<C>>(CtrlClass.Context);
}

const Creators = {
  createUseSelector,
  createUseAsyncGetter: createUseGetAsyncState,
};

export {
  useStore,
  useActions,
  useDispatch,
  useSelector,
  useGetAsyncState,
  ReduxProvider,
  useController,
  useReduxController,
  uesCtrlContext,
  Creators,
}
