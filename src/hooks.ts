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

function createUseGetAsync(
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
function useActions<AC extends BParams0, AAC extends BParams0>(slice: { actions: AC, atomActions?: AAC, [k: string]: any }) {
  const { store } = useContext(ReduxContext);
  return useMemo(() => {
    const bindActions = bindActionCreators(slice.actions || {} as AC, store.dispatch);
    const fetchAtoms = bindActionCreators(slice.atomActions || {} as AAC, store.dispatch);
    const actions = [bindActions, fetchAtoms] as UseActionsReturn<typeof bindActions, typeof fetchAtoms>;
    actions.bindActions = bindActions;
    actions.fetchAtoms = fetchAtoms;
    return actions;
  }, [])
}

const useSelector = createUseSelector();
const useGetAsync = createUseGetAsync();


function useController<C extends Controler>(CtrlClass: Klass<[], C>):[C, ReturnType<C['useInit']>] {
  const ctrl = useMemo(() => (new CtrlClass()), []);
  ctrl[$classHooks]();
  const data = ctrl.useInit();
  return [ctrl, data];
}

function useReduxController<C extends ReduxControler>(CtrlClass: Klass<[Store], C>): [C, ReturnType<C['useInit']>] {
  const { store } = useContext(ReduxContext)
  const ctrl = useMemo(() => (new CtrlClass(store)), []);
  ctrl[$classHooks]();
  const data = ctrl.useInit();
  return [ctrl, data];
}

function uesCtrlContext<C extends typeof Controler>(CtrlClass: C) {
  return useContext<InstanceType<C>>(CtrlClass.Context);
}

const Creators = {
  createUseSelector,
  createUseAsyncGetter: createUseGetAsync,
};

export {
  useStore,
  useActions,
  useDispatch,
  useSelector,
  useGetAsync,
  ReduxProvider,
  useController,
  useReduxController,
  uesCtrlContext,
  Creators,
}