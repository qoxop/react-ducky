import { Action, AnyAction } from 'redux';

/**
 * Without
 */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * 互斥类型
 */
export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

export type {
  AnyAction
};

/**
 * 有效对象
 */
export type ValidObj = { [k:string]: any };

/**
 * Function
 */
export type FunctionLike<Args extends unknown[] = [], RET = void> = (...args: Args) => RET;

/**
 * 带 payload 字段的 Action 类型
 */
export type PayloadAction<P = any> = {
  type: string;
  payload: P;
}

/**
 * 展开的 Action 类型
 */
export type ExtendAction<Ext extends { payload?: never; [k:string]: any; }> = Ext & {
  type: string;
}

/**
 * Action类型创建器
 */
export type ActionCreator<Arg = never> = [Arg] extends [never] ? () => Action : (arg: Arg) => AnyAction;

/**
 * Reducer 函数内的一个 case 分支
 */
export type ReducerCase<STATE> = (state: STATE, action: any) => STATE | void;

/**
 * 返回 Promise 实例的方法类型
 */
export type PromiseFn<Resp = unknown, Args extends any[] = unknown[]> = (...args: Args) => Promise<Resp>;

/**
 * 筛选器的函数类型
 */
export type Selector<S = unknown, P = unknown> = (state: S) => P;

/**
 * 判断是否相等的函数类型
 */
export type IsEqual<P = any> = (last: P, current: P) => boolean;

/**
 * 类型为 T 或者是返回 T 的函数
 */
export type T_OrReturnT<T> = T|((data?:T) => T);


/**
 * 默认的 Redux 根状态类型
 * 可以通过 TS 的类型覆盖，实现 useSelector 的类型推导
 */
export interface DefaultRootState {[k: string]: any}
