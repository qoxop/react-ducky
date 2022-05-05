import React from 'react';
import { Store } from 'redux';
import { isFunction } from '../utils/is-type';
import { isPending, outPromise } from '../utils/async';
import { getInit, shallowEqual } from '../utils/helper';
import { ReduxContext } from './context';
import {
  Klass,
  IsEqual,
  Selector,
  T_OrReturnT,
  FunctionLike,
  DefaultRootState,
} from '../typings';
import {
  PageAction,
  getCurrentPageAction,
  getPageId,
  getPageState,
  setPageState,
} from '../utils/history';
import {
  $classHooks,
  Controller,
  ReduxController,
} from '../helper/controller';

const {
  useRef,
  useMemo,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} = React;

type UseSelectorOptions<P> = {
  sync?: boolean;
  eq?: IsEqual<P>;
  withSuspense?: boolean | FunctionLike<[P], boolean>;
}
type SetState<S> = (state: T_OrReturnT<S>, preventUpdate?: boolean) => void;

/**
 * 获取 Redux 的 Dispatch 方法
 * @returns
 */
const useDispatch = () => (useContext(ReduxContext).store.dispatch);

/**
 * 订阅 Redux 的状态变化
 * @param selector
 * @param options
 * @returns
 */
const useSelector = <S = DefaultRootState, P = any>(
  selector: Selector<S, P>,
  options: UseSelectorOptions<P> = {},
) => {
  const { eq, withSuspense, sync } = useMemo(() => ({
    eq: options.eq || shallowEqual,
    sync: options.sync,
    withSuspense: options.withSuspense === true
      ? isPending
      : (isFunction(options.withSuspense) ? options.withSuspense : null),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  const { subscriber, store } = useContext(ReduxContext);
  const [forceTimes, forceRender] = useReducer((s) => s + 1, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const subState = useMemo(() => selector(store.getState()), [store, forceTimes]);
  const subStateRef = useRef<P>(subState);

  // 添加订阅
  useEffect(() => {
    const symbolKey = Symbol('use-selector');
    const _newSubState = selector(store.getState());
    if (!eq(_newSubState, subStateRef.current)) {
      Promise.resolve().then(forceRender);
      subStateRef.current = _newSubState;
      
    }
    subscriber.add(symbolKey, (appState) => {
      const newSubState = selector(appState);
      if (!eq(newSubState, subStateRef.current)) {
        subStateRef.current = newSubState;
        forceRender();
      }
    }, { sync });
    return () => subscriber.remove(symbolKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  if (withSuspense) {
    // 判断是否为 pending，如果是 pending 抛出一个 promise 的异常
    if (withSuspense(subState)) {
      const { promise, resolve } = outPromise<P>();
      const symbolKey = Symbol('with-suspense');
      subscriber.add(symbolKey, (appState) => {
        const newSubState = selector(appState);
        if (!withSuspense(newSubState)) {
          resolve(newSubState);
          return true;
        }
      }, { once: true });
      throw promise;
    }
  }
  return subState;
};

/**
 * 使用一个 Controller 类
 * @param CtrlClass
 * @param props
 * @returns
 */
const useController = <C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
};

/**
 * 使用一个 ReduxController 类
 * @param CtrlClass
 * @param props
 * @returns
 */
const useReduxController = <C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] => {
  const { store } = useContext(ReduxContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
};

const useCtrlContext = <C extends Klass & { Context: any } = any>(CtrlClass: C) => (
  useContext<InstanceType<C>>(CtrlClass.Context)
);

/**
 * 使用 useRef 保留对最新 props 的引用
 * @param prop
 * @returns
 */
const usePropRef = <P>(prop: P): React.MutableRefObject<P> => {
  const propRef = useRef(prop);
  if (propRef.current !== prop) {
    propRef.current = prop;
  }
  return propRef;
};


/**
 * 用 ref 实现的 useState，用于保留对最新 state 的引用
 * @param init 初始值
 * @returns [T, SetState<T>, React.MutableRefObject<T>]
 */
const useStateRef = <T>(init: T_OrReturnT<T>): [T, SetState<T>, React.MutableRefObject<T>] => {
  const [_, forceUpdate] = useReducer(s => s + 1, 0);
  const stateRef = useRef(getInit(init));
  const setState = useCallback((data: T_OrReturnT<T>, preventUpdate?: boolean) => {
    if (isFunction(data)) {
      stateRef.current = data(stateRef.current);
    } else {
      stateRef.current = data;
    }
    if (!preventUpdate) {
      forceUpdate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [stateRef.current, setState, stateRef];
};

/**
 * 订阅页面钩子
 * @param options
 */
const usePageEffect = (options: {
  onEnter?: FunctionLike<[PageAction], void>;
  onLeave?: FunctionLike<[PageAction], void>;
  onEnterEffect?: FunctionLike<[PageAction], void>;
}) => {
  const executed = useRef(false);
  const curOptions = usePropRef(options);

  if (!executed.current) {
    executed.current = true;
    if (isFunction(curOptions.current.onEnter)) {
      curOptions.current.onEnter(getCurrentPageAction());
    }
  }

  useEffect(() => {
    if (isFunction(curOptions.current.onEnterEffect)) {
      curOptions.current.onEnterEffect(getCurrentPageAction());
    }
    const { onLeave } = curOptions.current
    return () => {
      if (isFunction(onLeave)) {
        Promise.resolve().then(() => {
          try {
            onLeave(getCurrentPageAction());
          } catch (error) {
            console.warn(error)
          }
        });
      }
    };
  }, []);
};

/**
 * 查询和设置页面状态数据
 * @param init
 * @returns
 */
const usePageState = <T>(init: T | (() => T), suffix = ''): [T, SetState<T>] => {
  const pageId = useMemo(() => `${getPageId()}${suffix}`, []);
  const [state, setState, stateRef] = useStateRef(() => getPageState(init, pageId));
  const storeValue = useCallback(() => setPageState(stateRef.current, pageId), []);
  useEffect(() => {
    window.addEventListener('beforeunload', storeValue); // destroy by refresh
    return () => { // 组件销毁时保存状态
      storeValue();
      window.removeEventListener('beforeunload', storeValue);
    }
  }, []);
  return [state, setState];
};

export {
  usePropRef,
  useStateRef,
  useDispatch,
  useSelector,
  useController,
  useReduxController,
  useCtrlContext,
  usePageState,
  usePageEffect,
};

export type {
  SetState,
  UseSelectorOptions,
};
