import type { Store } from "redux";
import {
  Context,
  useContext,
  useMemo,
} from "react";

import {
  $classHooks,
  Controller,
  ReduxController,
  ctrlEnhance
} from "./controller";

/**
 * class 类型定义
 */
type Klass<Args extends unknown[] = unknown[], I = any> = (new (...args: Args) => I);

/**
 * 在组件内使用一个 Controller 子类
 * @param CtrlClass {@link Controller} 的子类
 * @param props 组件的 `props`
 * @returns 返回一个元组，内容分别是 {@link Controller} 实例，以及实例内 {@link Controller.useHooks} 的返回值
 */
function useController<C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P):[C, ReturnType<C['useHooks']>] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ctrl = useMemo(() => (new CtrlClass(props)), []);
  ctrl[$classHooks](props);
  const data = ctrl.useHooks();
  return [ctrl, data];
};

/**
 * 创建 useReduxController 方法
 * @param ReduxContext
 * @returns 
 */
function createUseReduxController(ReduxContext: Context<{store: any, [k: string]: any}>) {
  /**
   * 在组件内使用一个 ReduxController 子类
   * @param CtrlClass {@link ReduxController} 的子类
   * @param props 组件的 `props`
   * @returns 返回一个元组，内容分别是 {@link ReduxController} 实例，以及实例内 {@link Controller.useHooks} 方法的返回值
   */
  return function useReduxController<C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>] {
    const { store } = useContext(ReduxContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const ctrl = useMemo(() => (new CtrlClass(store, props)), []);
    ctrl[$classHooks](props);
    const data = ctrl.useHooks();
    return [ctrl, data];
  };
}
/**
 * 通过 context 获取父级组件的 Controller 实例
 * @param CtrlClass - 父级组件使用的 Controller 类
 * @returns - 返回 {@link Controller} 实例
 */
function useCtrlContext <C extends Klass & { Context: any } = any>(CtrlClass: C):InstanceType<C> {
  return useContext<InstanceType<C>>(CtrlClass.Context)
}

export {
  Controller,
  ReduxController,
  useController,
  useCtrlContext,
  createUseReduxController,
  ctrlEnhance
}