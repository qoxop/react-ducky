import { Action } from "history";
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useReducer,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  enhanceHistory,
  getCurAction,
  getRouteState,
  setRouteState,
  uuid
} from "./history";

/**
 * 状态更新方法类型
 */
type SetRefState<S> = (
  /**
   * 待更新的值
   */
  state: S | ((s: S) => S),
  /**
   * 更新值的时候，阻止重新渲染
   */
  preventUpdate?: boolean
) => void;

const isFunction = (data: any): data is Function => typeof data === 'function';

/**
 * 卸载事件回调集合
 */
const beforeUnloadCallback:Record<string|symbol, Function> = {};

/**
 * 监听页面卸载事件，在页面卸载前缓存数据
 */
window.addEventListener('beforeunload', () => {
  Object.keys(beforeUnloadCallback).forEach((callbackKey) => {
    if (isFunction(beforeUnloadCallback[callbackKey])) {
      beforeUnloadCallback[callbackKey]();
    }
  });
});

/**
 * 使用前进后退缓存策略缓存组件状态数据
 * @param init 初始值，T | () => T
 * @param suffix 每个路由都有一个唯一的 ID，但是同一个路由下可以使用多份缓存，suffix 用于区分不同的缓存
 * @returns 返回一个元组，内容分别是 state 和 {@link SetRefState}
 */
function useBfCache<T>(init: T | (() => T), suffix = ''): [T, SetRefState<T>]  {
  const [, forceUpdate] = useReducer(s => s + 1, 0);
  const stateRef = useRef<T>(null as unknown as T);
  // 仅仅执行一次
  if (stateRef.current !== null) {
    stateRef.current = getRouteState<T>(init, suffix);
  }
  const setState = useCallback((data: T | ((t: T) => T), preventUpdate?: boolean) => {
    stateRef.current = isFunction(data) ? data(stateRef.current) : data;
    !preventUpdate && forceUpdate();
  }, []);
  const unloadEvent = useMemo(() => ({
    key: uuid(),
    callback: () => setRouteState(stateRef.current, suffix),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useEffect(() => {
    // 离开页面时存储状态数据
    beforeUnloadCallback[unloadEvent.key] = unloadEvent.callback;
    return () => {
      unloadEvent.callback();
      delete beforeUnloadCallback[unloadEvent.key]
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [stateRef.current, setState];
};

/**
 * 获取当前组件所在页面的路由动作
 * @param callback 回调事件
 * @returns "PUSH" | "POP" | "REPLACE"
 */
function useRouteAction(callback?: (action: Action) => void): Action {
  const action = getCurAction();
  const executed = useRef(false);
  if (!executed.current && callback) {
    executed.current = true;
    callback(action);
  }
  return action;
}

/**
 * 获取路由动作的高阶组件
 * @param Component 被包裹的组件
 * @param options 选项
 * @param options.callback 回调事件
 * @param options.fallback 回调事件返回前页面的填充物
 * @returns 
 */
function withRouteAction<T>(
  Component: T, 
  { callback, fallback = null } : {
    fallback?: any,
    callback: (action: Action) => any,
  }
): T {
  return ((props: any) => {
    const action = getCurAction();
    const [canRender, setRender] = useState(false);
    useLayoutEffect(() => {
      Promise.resolve(callback(action)).then(() => {
        setRender(true);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (!canRender) {
      return fallback;
    }
    // @ts-ignore
    return <Component {...props} routeAction={action} />
  }) as unknown as T;
}

export {
  useBfCache,
  useRouteAction,
  withRouteAction,
  enhanceHistory,
}