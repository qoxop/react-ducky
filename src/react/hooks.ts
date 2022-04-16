import React from 'react';
import { Store} from 'redux';

import { isFunction } from '../utils/is-type';
import { isPending, outPromise } from '../utils/async';
import { ReduxContext, PageActionContext } from './context';
import { DefaultRootState, IsEqual, Klass, Selector } from '../typings';
import { $classHooks, Controller, ReduxController } from '../helper/controller';
import {
  PageAction,
  getCurrentPageAction,
  getPageKey,
  getPageState,
  setPageState 
} from '../utils/history';

const {
  useRef,
  useMemo,
  useEffect,
  useState,
  useContext,
  useReducer,
  useLayoutEffect,
} = React;


type UseSelectorOptions<P> = {
  eq?: IsEqual<P>,
  useThrow?: boolean | ((subState: P) => boolean);
}

// TODO： 移动到 utils 中
/**
 *  浅对比
 * @param last
 * @param cur 
 * @returns
 */
const defEq = <T>(last: T, cur: T) => {
  if (last === cur) return true;
  if (cur && last && typeof cur === 'object' && typeof last === 'object') {
    const curKeys = Object.keys(cur);
    return curKeys.every(k => cur[k] === last[k]) && curKeys.length === Object.keys(last).length;
  }
  return false;
}

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
      const { promise, resolve } = outPromise<P>();
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

/**
 * 使用一个 Controller 类
 * @param CtrlClass
 * @param props 
 * @returns
 */
const useController = <C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] => {
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

/**
 * 使用一个 ReduxController 类
 * @param CtrlClass
 * @param props
 * @returns
 */
const useReduxController = <C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] => {
  const { store } = useContext(ReduxContext)
  const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
}

const useCtrlContext = <C  extends Klass & { Context: any } = any>(CtrlClass: C) => {
  return useContext<InstanceType<C>>(CtrlClass.Context);
}

const usePropRef = <P>(prop: P) => {
  const propRef = useRef(prop);
  if (propRef.current !== prop) {
    propRef.current = prop;
  }
  return propRef;
}

const useStateRef = <T>(init: T|(() => T)) => {
  const [state, setState] = useState(init);
  const stateRef = usePropRef(state);
  return [state, setState, stateRef] as const
}

/**
 * 订阅页面钩子
 * @param options
 */
const usePageEffect = (options: {
  onEnter?: (ac: PageAction) => void;
  onLeave?: (ac: PageAction) => void;
  onEnterEffect?: (ac: PageAction) => void;
}) => {
  const curOptions = usePropRef(options);
  const executed = useRef(false);
  const action = useContext(PageActionContext);

  if (!executed.current) {
    executed.current = true;
    isFunction(curOptions.current.onEnter)
    && curOptions.current.onEnter(action);
  }
  
  useEffect(() => {
    isFunction(curOptions.current.onEnterEffect) && curOptions.current.onEnterEffect(action);
    return () => {
      if (isFunction(curOptions.current.onLeave))
      Promise.resolve().then(() => {
        curOptions.current.onLeave(getCurrentPageAction());
      });
    }
  }, []);
}

/**
 * 查询和设置页面状态数据
 * @param init
 * @returns
 */
const usePageState = <T>(init: T | (() => T), suffix: string = '') => {
  const pageKey = useMemo(() => `${getPageKey()}${suffix}`, []);
  const [state, setState, stateRef] = useStateRef(() => getPageState(init, pageKey));
  // 组件销毁时保存
  useEffect(() => () => setPageState(stateRef.current, pageKey), [stateRef]);
  return [state, setState];
}

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
}

export type {
  UseSelectorOptions
}