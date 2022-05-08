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

/**
 * useSelector 的配置对象
 * @remarks
 * 类型说明:
 * ```ts
 * type UseSelectorOptions = {
 *  // 是否同步订阅(redux 值一更新就马上执行组件的 update 操作)，默认为 false
 *  sync?: boolean;
 *  // 对比方法
 *  eq?: IsEqual<P>;
 *  // 是否与 React.Suspense 配合使用
 *  withSuspense?: boolean | FunctionLike<[P], boolean>;
 * }
 * ```
 */
type UseSelectorOptions<P> = {
  /**
   * 同步订阅，redux 值一更新就马上执行组件的 update 操作，默认为 false
   */
  sync?: boolean;
  /**
   * 对比方法
   */
  eq?: IsEqual<P>;
  /**
   * 是否与 React.Suspense 配合使用
   */
  withSuspense?: boolean | FunctionLike<[P], boolean>;
}

/**
 * {@link useStateRef} 的第二个返回值，用于更新状态
 */
type SetRefState<S> = (
  /**
   * 待更新的值
   */
  state: T_OrReturnT<S>,
  /**
   * 更新值的时候，阻止重新渲染
   */
  preventUpdate?: boolean
) => void;

/**
 * 获取 Redux 的 Dispatch 方法
 * @returns
 */
const useDispatch = () => (useContext(ReduxContext).store.dispatch);

/**
 * 订阅 Redux 的状态变化
 * @param selector 数据选择器函数 {@link Selector}
 * @param options 配置选项 {@link UseSelectorOptions}
 */
function useSelector <S = DefaultRootState, P = any>(selector: Selector<S, P>, options: UseSelectorOptions<P> = {}): P {
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
 * 在组件内使用一个 Controller 子类
 * @param CtrlClass {@link Controller} 的子类
 * @param props 组件的 `props`
 * @returns 返回一个元组，内容分别是 {@link Controller} 实例，以及实例内 {@link Controller.useHooks} 的返回值
 */
function useController <C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
};

/**
 * 在组件内使用一个 ReduxController 子类
 * @param CtrlClass {@link ReduxController} 的子类
 * @param props 组件的 `props`
 * @returns 返回一个元组，内容分别是 {@link ReduxController} 实例，以及实例内 {@link Controller.useHooks} 方法的返回值
 */
function useReduxController<C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] {
  const { store } = useContext(ReduxContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
};

/**
 * 通过 context 获取父级组件的 Controller 实例
 * @param CtrlClass - 父级组件使用的 Controller 类
 * @returns - 返回 {@link Controller} 实例
 */
function useCtrlContext <C extends Klass & { Context: any } = any>(CtrlClass: C):InstanceType<C> {
  return useContext<InstanceType<C>>(CtrlClass.Context)
}

/**
 * 使用 useRef 保留对最新 props 的引用
 * @param prop - 可以是任意组件闭包内的任何变量
 * @returns `React.MutableRefObject<P>`
 */
function usePropRef <P>(prop: P): React.MutableRefObject<P> {
  const propRef = useRef(prop);
  if (propRef.current !== prop) {
    propRef.current = prop;
  }
  return propRef;
};

/**
 * 用 ref 实现的 useState，用于保留对最新 state 的引用
 * @param { T_OrReturnT<T> } init - 初始值
 * @returns 返回一个元组，内容分别是 state, {@link SetRefState} 和 `React.MutableRefObject<T>`
 */
function useStateRef <T>(init: T_OrReturnT<T>): [T, SetRefState<T>, React.MutableRefObject<T>] {
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
 * 路由事件钩子，用于识别组件的建立与销毁与路由动作 {@link PageAction} 的关系
 * @remarks
 * 类型说明:
 * ```typescript
 * type options = {
 *  // 进入组件时执行的回调方法(接收 PageAction 参数)，表示当前是通过何种路由方式进入到该组件的
 *  onEntry: FunctionLike<[PageAction], void>;
 *  // 进入组件时执行的回调方法(接收 PageAction 参数)，表示该组件是由于何种路由方式销毁的 * 
 *  onLeave?: FunctionLike<[PageAction], void>;
 *  // 同 onEnter，区别是调用时机不同(onEnterEffect是在组件渲染之后执行) *
 *  onEnterEffect?: FunctionLike<[PageAction], void>;
 * }
 * ```
 * @param options 回调事件配置
 */
function usePageEffect(options: {
  onEnter?: FunctionLike<[PageAction], void>;
  onLeave?: FunctionLike<[PageAction], void>;
  onEnterEffect?: FunctionLike<[PageAction], void>;
}):void {
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
 * @param init 初始值
 * @param suffix 每个路由都有一个唯一的 ID，但是同一个路由下可以使用多份缓存，suffix 用于区分不同的缓存
 * @returns 返回一个元组，内容分别是 state 和 {@link SetRefState}
 */
function usePageState<T>(init: T | (() => T), suffix = ''): [T, SetRefState<T>]  {
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
  SetRefState,
  UseSelectorOptions,
};
