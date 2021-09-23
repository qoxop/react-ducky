import { useRef, useMemo, useLayoutEffect, useContext, useReducer } from 'react';
import { bindActionCreators } from 'redux';
import { ReduxContext, ReduxContextType, createProvider} from './Provider';
import { EqualityFn, Selector } from '../typings';
import { isPromise } from '../utils/is-type';
import { OutPromise } from '../utils/async'

function createUseStore(context: ReduxContextType) {
  const Context = context === ReduxContext ? ReduxContext : context;
  return function useStore () {
    const { store } = useContext(Context);
    return store;
  }
}

function createUseDispatch(context: ReduxContextType) {
  const Context = context === ReduxContext ? ReduxContext : context;
  return function useStore () {
    const { store } = useContext(Context);
    return store.dispatch;
  }
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
  context: ReduxContextType,
) {
  const { subscriber, store } = useContext(context);
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
    subscriber.addListener(symbolKey, (appState) => {
      const newSubState = selector(appState);
      if (!isEqual(newSubState, subStateRef.current)) {
        forceRender();
        subStateRef.current = newSubState;
      }
    });
    return () => subscriber.removeListener(symbolKey);
  }, [store, selector, isEqual]);

  return { subState, store, subscriber };
}

function createUseSelector(
  context: ReduxContextType,
  config: { defaultIsEqual: EqualityFn, } = { defaultIsEqual: _defaultIsEqual }
) {
  const Context = context === ReduxContext ? ReduxContext : context;
  const { defaultIsEqual } = config;
  return function useSelector<S = any, P = any> (
    selector: Selector<S, P>,
    isEqual: EqualityFn<P> = defaultIsEqual,
  ) {
    const { subState } = _useSelector(selector, isEqual, Context);
    return subState;
  }
}

function createUseAsyncGetter(
  context: ReduxContextType,
  config: { 
    defaultIsEqual: EqualityFn,
    defaultIsPending: any
  } = { defaultIsEqual: _defaultIsEqual, defaultIsPending: _defaultIsPending }
) {
  const Context = context === ReduxContext ? ReduxContext : context;
  const { defaultIsEqual, defaultIsPending } = config;
  return function useAsyncGetter<S = any, P = any>(
    selector: Selector<S, P>,
    options: {
      isEqual?: EqualityFn<P>,
      isPending?: (subState: P, state?: S) => boolean;
    } = {}
  ) {
    const { isPending = defaultIsPending, isEqual = defaultIsEqual } = options;
    const { subState, subscriber } = _useSelector(selector, isEqual, Context)

    if (isPromise(subState)) {
      throw subState;
    }
    if (isPending(subState)) {
      const { promise, resolve } = OutPromise<P>();
      const symbolKey = Symbol();
      subscriber.addListener(symbolKey, (appState) => {
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
function createUseActions(context: ReduxContextType) {
  const Context = context === ReduxContext ? ReduxContext : context;
  return  function useActions<AC extends BParams0, AAC extends BParams0>(slice: { actions: AC, atomActions?: AAC, [k: string]: any }) {
    const { store } = useContext(Context);
    return useMemo(() => {
      const bindActions = bindActionCreators(slice.actions || {} as AC, store.dispatch);
      const fetchAtoms = bindActionCreators(slice.atomActions || {} as AAC, store.dispatch);
      const actions = [bindActions, fetchAtoms] as UseActionsReturn<typeof bindActions, typeof fetchAtoms>;
      actions.bindActions = bindActions;
      actions.fetchAtoms = fetchAtoms;
      return actions;
    }, [])
  }
}

const useActions = createUseActions(ReduxContext)
const useStore = createUseStore(ReduxContext);
const useDispatch = createUseDispatch(ReduxContext);
const useSelector = createUseSelector(ReduxContext);
const useAsyncGetter = createUseAsyncGetter(ReduxContext);
const Provider = createProvider(ReduxContext);

const Creators = {
  createUseStore,
  createUseDispatch,
  createUseSelector,
  createUseAsyncGetter,
  createUseActions,
  createProvider,
};

export {
  useStore,
  useActions,
  useDispatch,
  useSelector,
  useAsyncGetter,
  Provider,
  Creators,
}
