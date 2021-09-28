/** TS 类型体操 */
import { Draft } from "immer"
import { Dispatch, Reducer, Action, AnyAction } from 'redux'
import { Builder } from "./createReducer";

export type PayloadAction<P = any, M = never, E = never> = { payload: P, type: string } &
    ([M] extends [never] ? {} : { meta: M }) &
    ([E] extends [never] ? {} : { error: E });

/**
 * 设配任何函数
 */
export type AnyFunction<T = unknown, Args extends any[] = unknown[]> = (...args: Args) => T;

/**
 * Promise 函数定义
 */
type PromiseFn<T = unknown, Args extends any[] = unknown[]> = (...args: Args) => Promise<T>;

/**
 * 类型过滤器
 */
type KeysOf<S, TypeFilter = never> = [TypeFilter] extends [never] ? keyof S : {[K in keyof S]: S[K] extends TypeFilter ? K : never}[keyof S];


/**
 * 获取 Promise 的返回内容
 */
export type ReturnPromiseType<F extends (...args: any) => Promise<any>> = F extends (...args: any) => Promise<infer T> ? T : any;


/**
 * reducer 方法定义
 */
export interface CaseReducer<S = any, PAC extends Omit<PayloadAction, 'type'> = any> {
  (state: Draft<S>, action?: Action<string> & PAC): S | void | Draft<S>
}

export type PrepareAction<P = unknown> =
    | ((...args: unknown[]) => { payload: P })
    | ((...args: unknown[]) => { payload: P; meta: any })
    | ((...args: unknown[]) => { payload: P; error: any })
    | ((...args: unknown[]) => { payload: P; meta: any; error: any })

export type CaseReducerWithPrepare<State, Pa extends PrepareAction = PrepareAction> = {
  prepare: Pa;
  reducer: CaseReducer<State, ReturnType<Pa>>
}

export type SliceCaseReducers<State> = {
  [K: string]: CaseReducer<State> | CaseReducerWithPrepare<State>
}

export type ActionCreator<P = void>  = P extends void ? ({
  type: string;
  match: (action: AnyAction) => boolean;
  (): AnyAction
}) : ({
  type: string;
  match: (action: AnyAction) => boolean;
  (payload: P, ...args: unknown[]): PayloadAction<void>
})

/**
 * 计算 CaseReducerWithPrepare 对于的 ActionCreator 的类型
 */
export type ActionCreatorForCaseReducerWithPrepare<Prepare extends AnyFunction> = (...p: Parameters<Prepare>) => ReturnType<Prepare> & Action;

/**
 * 计算 CaseReducer 对于的 ActionCreator 的类型
 * 1. 如果 CaseReducer 的第二个参数不传，ActionCreator 不要去传递任何参数
 * 2. 如果 CaseReducer 的第二个参数继承了 PayloadAction<infer P>， ActionCreator 第一个参数要求为 P
 * 3. 若干 CaseReducer 的第二个参数如果没有继承 PayloadAction<infer P>，ActionCreator 不要去传递任何参数
 */
export type ActionCreatorForCaseReducer<CR extends AnyFunction> = 
  Parameters<CR>[1] extends undefined ?
    ActionCreator<void> : 
    (Parameters<CR>[1] extends PayloadAction<infer P> ? ActionCreator<P> : ActionCreator<void>)

/**
 * 计算所有 ActionCreator 的类型集合
 */
export type CaseReducerActions<CRS extends SliceCaseReducers<any>> = {
  [Type in keyof CRS]: CRS[Type] extends { prepare: any } ?
    ActionCreatorForCaseReducerWithPrepare<CRS[Type]['prepare']> :
    CRS[Type] extends AnyFunction ? ActionCreatorForCaseReducer<CRS[Type]> : void
}

/**
 * 异步的原子对象
 */
export type AtomObject<V = unknown, E = any> = {
  status: 'unactive'|'pending'|'fulfilled'|'rejected';
  value: V;
  error?: E;
  isPending?: boolean;
}

/**
 * 原子数据获取方法
 */
export type AtomFetchers<State> = { 
  // 继承了 AtomObject 类型的需要提供 Fetcher 函数
  [K in KeysOf<State, AtomObject>]: State[K] extends AtomObject ? (...args: unknown[]) => Promise<State[K]['value']> : void;
}

/**
 * 原子数据异步动作
 */
export type AtomActions<AFS> = {
  [K in keyof AFS]: AFS[K] extends PromiseFn 
    ? (...args: Parameters<AFS[K]>) => ((dispatch:Dispatch) => ReturnType<AFS[K]>) :
    void;
}

/**
 * Slice 配置项完全版
 */
type TotalCreateSliceOptions<
  STATE extends Object = Object,
  SCR extends SliceCaseReducers<STATE> = {},
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>
> = {
  name: string;
  initialState: STATE;
  reducers: SCR;
  atomFetchers: AFS;
  extraReducers?: Record<string, CaseReducer<STATE>> | ((builder: Builder<STATE>) => void),
  persistence?: 'session'|'local';
  persistenceKey?: string;
}

/**
 * Slice 配置项
 */
export type ICreateSliceOptions<
  STATE extends Object = Object,
  SCR extends SliceCaseReducers<STATE> = SliceCaseReducers<STATE>,
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>
> = KeysOf<STATE, AtomObject> extends never ? // 是否存在 AtomObject 的字段
  (Omit<TotalCreateSliceOptions<STATE, SCR, AFS>, 'atomFetchers'>) :
  TotalCreateSliceOptions<STATE, SCR, AFS>

/**
 * Slice 对象数据结构
 */
export type ISlice<
  STATE extends Object = Object,
  SCR extends SliceCaseReducers<STATE> = SliceCaseReducers<STATE>,
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>,
  OPT extends ICreateSliceOptions = ICreateSliceOptions
> = {
    name: string;
    reducer: Reducer<STATE>;
    actions: CaseReducerActions<SCR>;
    useSelector: <T>(selector: Selector<STATE, T>, config?: { isPending?: IsPendingFn<T, STATE>, isEqual?: EqualityFn<T>}) => T;
    getState: () => STATE;
} & (OPT extends {atomFetchers: any} ? { atomActions: AtomActions<AFS> } : {});

/**
 * 异步chunk
 */
export interface AsyncThunk<T = any, Ags extends Array<any> = any[]> {
  pending: string;
  fulfilled: string;
  rejected: string;
  (...args: Ags): (dispatch:Dispatch) => Promise<T>
}

export type Selector<S = unknown, P = unknown> = (state: S) => P;
export type EqualityFn<P = any> = (last: P, current: P) => boolean;
export type IsPendingFn<T, S> = (t: T, s: S) => boolean;