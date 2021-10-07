/** TS 类型体操 */
import { Draft } from "immer"
import { WritableDraft } from "immer/dist/internal";
import { Dispatch, Reducer, Action, AnyAction } from 'redux'
import { Builder } from "./createReducer";

export type { AnyAction }

export type PayloadAction<P = any> = { payload: P, type: string, [k: string]: any };

/**
 * 类定义
 */
export type Klass<Args extends unknown[] = unknown[], I = any> =  (new (...args: Args) => I);

/**
 * 设配任何函数
 */
export type AnyFunction<T = any, Args extends any[] = unknown[]> = (...args: Args) => T;

/**
 * Promise 函数定义
 */
export type PromiseFn<T = unknown, Args extends any[] = unknown[]> = (...args: Args) => Promise<T>;

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
export interface CaseReducer<S = any, AC extends PayloadAction = any> {
  (state: WritableDraft<S>, action?: AC): S | void | Draft<S>
}

export type PrepareAction<P = unknown> = (...args: unknown[]) => { payload: P }

export type CaseReducerWithPrepare<State> = {
  prepare: PrepareAction<any>;
  reducer: CaseReducer<State>
}

export type ModelCaseReducers<State> = {
  [K: string]: CaseReducer<State> | CaseReducerWithPrepare<State>
}

export type ActionCreator<P = never>  = [P] extends [never] ? ({
  type: string;
  match: (action: AnyAction) => boolean;
  (): AnyAction
}) : ({
  type: string;
  match: (action: AnyAction) => boolean;
  (payload: P): PayloadAction<void>
})

/**
 * 计算 CaseReducerWithPrepare 对于的 ActionCreator 的类型
 */
export type ActionCreatorForCaseReducerWithPrepare<Prepare extends AnyFunction> = (...p: Parameters<Prepare>) => ReturnType<Prepare> & Action;

/**
 * 计算所有 ActionCreator 的类型集合
 */
export type CaseReducerActions<CRS extends ModelCaseReducers<any>> = {
  [Type in keyof CRS]: CRS[Type] extends { prepare: any } ?
    ActionCreatorForCaseReducerWithPrepare<CRS[Type]['prepare']> :
    CRS[Type] extends CaseReducer<any, PayloadAction<infer P>> ? ActionCreator<P> : ActionCreator<never>
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
  [K in KeysOf<State, AtomObject>]: State[K] extends AtomObject ? PromiseFn<State[K]['value'], unknown[]> : void;
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
 * Model 配置项完全版
 */
type TotalCreateModelOptions<
  STATE extends Object = Object,
  SCR extends ModelCaseReducers<STATE> = {},
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>
> = {
  name: string;
  initialState: STATE;
  reducers: SCR;
  atomFetchers: AFS;
  selector?: <A = any>(appState: A) => STATE;
  extraReducers?: Record<string, CaseReducer<STATE>> | ((builder: Builder<STATE>) => void),
  persistence?: 'session'|'local';
  persistenceKey?: string;
}

/**
 * Model 配置项
 */
export type CreateModelOptions<
  STATE extends Object = Object,
  MCR extends ModelCaseReducers<STATE> = ModelCaseReducers<STATE>,
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>
> = KeysOf<STATE, AtomObject> extends never ? // 是否存在 AtomObject 的字段
  (Omit<TotalCreateModelOptions<STATE, MCR, AFS>, 'atomFetchers'>) :
  TotalCreateModelOptions<STATE, MCR, AFS>;

/**
 * Model 对象数据结构
 */
export type Model<
  STATE extends Object = Object,
  MCR extends ModelCaseReducers<STATE> = ModelCaseReducers<STATE>,
  AFS extends AtomFetchers<STATE> = AtomFetchers<STATE>,
  OPT = CreateModelOptions
> = {
    name: string;
    reducer: Reducer<STATE>;
    actions: CaseReducerActions<MCR>;
    getState: () => STATE;
    useModel: <T = STATE>(selector?: Selector<STATE, T>, config?: { isPending?: IsPendingFn<T, STATE>, isEqual?: EqualityFn<T>}) => T;
} & (OPT extends { atomFetchers: any } ? { atomActions: AtomActions<AFS> } : {});


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