/** TS 类型体操 */
import { Action, AnyAction } from 'redux';
import { Draft, WritableDraft } from 'immer/dist/internal';

export type ValidObj = { [k:string]: any };
export type EmptyObj = { [k in any]: never };
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

export type { AnyAction };

export type FunctionLike<Args extends unknown[] = [], RET = void> = (...args: Args) => RET

export type PayloadAction<P = any> = {
  type: string;
  payload: P;
}

export type ExtendAction<Ext extends { payload?: never; [k:string]: any; }> = Ext & {
  type: string;
}

export type ActionCreator<Arg = never> = [Arg] extends [never] ?
  () => Action :
  (arg: Arg) => AnyAction;

export type CaseReducerWithOtherAction<STATE, Ext = ValidObj> = {
  (state: WritableDraft<STATE>, action: ExtendAction<Ext>): STATE | void | Draft<STATE>;
}
export type CaseReducerWithPayloadAction<STATE, P = any> = {
  (state: WritableDraft<STATE>, action: PayloadAction<P>): STATE | void | Draft<STATE>;
}
export type CaseReducerWithoutAction<STATE> = {
  (state: WritableDraft<STATE>): STATE | void | Draft<STATE>;
}

/**
 * reducer case 方法
 */
export type CaseReducer<STATE> = (state: STATE, action?: AnyAction) => STATE | void;

/**
 * 类定义
 */
export type Klass<Args extends unknown[] = unknown[], I = any> = (new (...args: Args) => I);

/**
 * Promise 函数定义
 */
export type PromiseFn<Resp = unknown, Args extends any[] = unknown[]> =
  (...args: Args) => Promise<Resp>;

/**
 * 类型过滤器
 */
export type KeysOf<S, TypeFilter = never> = [TypeFilter] extends [never] ?
  keyof S :
  { [K in keyof S]: S[K] extends TypeFilter ? K : never }[keyof S];

/**
 * 类型剪切
 */
export type TypeClip<S, OptionalKeys extends keyof S, DelKeys extends keyof S = never> = {
  [K in OptionalKeys]?:S[K]
} & {
  [K in Exclude<keyof S, DelKeys|OptionalKeys>]: S[K];
};

export type Selector<S = unknown, P = unknown> = (state: S) => P;
export type IsEqual<P = any> = (last: P, current: P) => boolean;
export type IsPending<T> = (t: T) => boolean;

export interface DefaultRootState {
  [key: string]: any;
}
