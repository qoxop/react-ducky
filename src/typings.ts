import { Draft } from "immer"
import { Builder } from "./createReducer";

export type AnyFunction<T = any> = (...args: any) => T;

export type ReturnPromiseType<F extends (...args: any) => Promise<any>> = F extends (...args: any) => Promise<infer T> ? T : any;

export interface Action {
  type: string
}

export interface AnyAction extends Action {
  [k: string]: any;
}

export type PayloadAction<P = any, M = never, E = never> = { payload: P, type: string } &
    ([M] extends [never] ? {} : { meta: M }) &
    ([E] extends [never] ? {} : { error: E });

// export type Actions = Record<string, AnyAction>

export type CaseReducer<S = any> = (
  state: Draft<S>,
  action?: PayloadAction|void
) => S | void | Draft<S>

export type PrepareAction<P = any> =
    | ((...args: any[]) => { payload: P })
    | ((...args: any[]) => { payload: P; meta: any })
    | ((...args: any[]) => { payload: P; error: any })
    | ((...args: any[]) => { payload: P; meta: any; error: any })

export type CaseReducerWithPrepare<State> = {
  reducer: CaseReducer<State>
  prepare: PrepareAction
}

export type SliceCaseReducers<State> = {
  [K: string]:
    | CaseReducer<State>
    | CaseReducerWithPrepare<State>
}

export type ActionCreator<P = void, M = any, E = any>  = P extends void ? {
  type: string;
  match: (action: AnyAction) => boolean;
  (p?: P, m?: M, e?: E): PayloadAction<P, M, E>
} : {
  type: string;
  match: (action: AnyAction) => boolean;
  (p: P, m?: M, e?: E): PayloadAction<void, M, E>
}

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
  [Type in keyof CRS]: CRS[Type] extends {prepare: any} ?
    ActionCreatorForCaseReducerWithPrepare<CRS[Type]['prepare']> :
    CRS[Type] extends AnyFunction ? ActionCreatorForCaseReducer<CRS[Type]> : void
}


export interface ICreateSliceOptions<
    State extends Object = Object,
    CRS extends SliceCaseReducers<State> = SliceCaseReducers<State>,
> {
    name: string;
    initialState: State;
    reducers: CRS;
    extraReducers?: Record<string, CaseReducer<State>> | ((builder: Builder<State>) => void)
    persistence?: 'session'|'local';
    persistenceKey?: string;
}

export interface ISlice<
    State,
    CRS extends SliceCaseReducers<State> = SliceCaseReducers<State>
> {
    name: string,
    reducer: any,
    actions: CaseReducerActions<CRS>,
    [k: string]: any
}


export interface AsyncThunk<T = any> {
  pending: string;
  fulfilled: string;
  rejected: string;
  (...args: any[]): (dispatch:any, getState: () => any) => Promise<T>
}