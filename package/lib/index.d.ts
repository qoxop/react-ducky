/**
 * React-Ducky 是一个专门为 React 应用编写的状态和缓存管理工具库。
 * 它对 Redux 进行了封装，通过切片的方式简化了 Redux 状态的管理和使用，同时还提供了与浏览器路由栈行为一致的页面缓存控制。
 *
 * React-Ducky 核心目的在于通过提供便捷的状态和缓存管理方法。让使用者能够有更多的精力去关注业务逻辑本身，从而提升效率，同时让代码更加简洁。
 * @packageDocumentation
 */

import { Action } from 'redux';
import { AnyAction } from 'redux';
import { Context } from 'react';
import { Dispatch } from 'redux';
import { FunctionComponent } from 'react';
import { default as React_2 } from 'react';
import { Reducer } from 'redux';
import { Store } from 'redux';

/**
 * Action类型创建器
 */
export declare type ActionCreator<Arg = never> = [Arg] extends [never] ? () => Action : (arg: Arg) => AnyAction;

/**
 * 将一个 Promise 实例 转化成一个永不报错的新 Promise 实例，把错误信息包装在返回结果中
 * @param ps Promise 实例
 * @returns `[data, null] | [null, error]`
 */
export declare function alwayResolve<D>(ps: Promise<D>): Promise<[(D | null), any]>;

export { AnyAction }

/**
 * Reducer 构建器
 */
export declare class Builder<S> {
    /**
     * 默认处理函数
     * @internal
     */
    default?: ReducerCase<S>;
    /**
     * 要求类型相等才执行的处理函数
     * @internal
     */
    equal: {
        [k: string]: ReducerCase<S>;
    };
    /**
     * 要求类型匹配才执行的处理函数
     * @internal
     */
    match: Array<{
        matcher: FunctionLike<[AnyAction], boolean>;
        reducer: ReducerCase<S>;
    }>;
    constructor();
    /**
     * 添加要求类型相等的处理函数
     * @param type string
     * @param reducer 处理函数
     * @returns Builder
     */
    addCase(type: string, reducer: ReducerCase<S>): this;
    /**
     * 添加要求类型匹配的处理函数
     * @param type string
     * @param reducer 处理函数
     * @returns Builder
     */
    addMatcher(matcher: FunctionLike<[AnyAction], boolean>, reducer: ReducerCase<S>): this;
    /**
     * 设置默认处理函数
     * @param reducer
     * @returns Builder
     */
    addDefaultCase(reducer: ReducerCase<S>): this;
}

/**
 * 控制器 - 模拟 class 组件行为
 */
export declare class Controller<State = any, Props = any> {
    /**
     * 存放实例对象的 Context
     */
    static Context: Context<any>;
    /**
     * 提供实例对象的 Provider
     */
    static Provider: FunctionComponent<{
        controller: unknown;
        children: unknown;
    }>;
    /**
     * 模拟 class 组件的 state
     * @readonly
     */
    state: State;
    /**
     * 组件的 props 引用
     * @readonly
     */
    props: Props;
    /**
     * 模拟 class 组件的 setState
     * @readonly
     */
    readonly setState: (updater: Partial<State> | FunctionLike<[State], void>) => any;
    /**
     * 强制更新组件
     * @readonly
     */
    readonly forceUpdate: () => any;
    /**
     * hooks 回调函数，需要被使用者重写
     * @override
     */
    useHooks(): any;
    constructor(props?: Props);
}

/**
 * 创建一个请求处理函数，当段时间内发起多个请求时，只响应最后一个请求，前面的请求返回时进行抛异常处理
 * @param options 配置对象 {@link FetchHandlerOptions}
 * @returns
 */
export declare function createFetchHandler<Args extends unknown[], Resp>(options: FetchHandlerOptions<Args, Resp>): (...args: Args) => Promise<Resp>;

/**
 * 创建一个基于 Redux 的状态模型
 * @param options 配置对象 {@link CreateModelOptions}
 * @param getStore 获取 `redux store` 的方法，多 redux 实例时使用
 * @returns 返回状态模型 {@link Model}
 */
export declare function createModel<STATE extends Record<string, any>, MCRA extends ModelCaseReducerActions<STATE>, SIF extends InferModelFetch<STATE> = {}>(options: CreateModelOptions<STATE, MCRA, SIF>, getStore?: () => Store): Model<STATE, MCRA, SIF>;

/**
 * Model 配置项
 */
export declare type CreateModelOptions<STATE extends Record<string, any>, MCRA extends ModelCaseReducerActions<STATE>, SIF extends InferModelFetch<STATE> = InferModelFetch<STATE>> = XOR<ModelBaseOptions<STATE, MCRA, SIF>, ModelBaseOptions<STATE, MCRA, SIF> & ModelCacheOptions>;

/**
 * 创建一个分页请求处理函数。<br />
 * - 当段时间内发起多个重置请求时，只响应最后一个请求，前面的请求返回时进行抛异常处理 <br />
 * - 限制发起分页请求必须是非 loading 状态(上一个请求结束之后)
 * @param options 配置对象 {@link PaginationHandlerOptions}
 */
export declare function createPaginationHandler<A extends unknown[], D>(options: PaginationHandlerOptions<A, D>): (...args: A) => Promise<D>;

/**
 * Controller 装饰器
 * @param options 配置对象
 * @remarks
 * 类型说明:
 * ```ts
 * type OptionsType = {
 *  // 提供 React Provider 、Context 等属性
 *  useCtx?: boolean;
 *  // 自动给方法绑定 this 对象
 *  bindThis?: boolean;
 * }
 * ```
 */
export declare function ctrlEnhance(options?: {
    useCtx?: boolean;
    bindThis?: boolean;
}): (target: any) => any;

/**
 * 默认的 Redux 根状态类型
 * 可以通过 TS 的类型覆盖，实现 useSelector 的类型推导
 */
export declare interface DefaultRootState {
    /**
     * 当前路由信息
     */
    _CURRENT_ROUTE?: {
        hash: string;
        state: any;
        search: string;
        pathname: string;
        method: PageAction;
    };
    /**
     * 其他字段
     */
    [key: string]: any;
}

/**
 * DuckyProvider
 */
export declare const DuckyProvider: React_2.FC<{
    children: any;
    store: Store;
}>;

/**
 * 增强 history 能力，使其能监听判断浏览器的前进后退
 * @returns
 */
declare const enhanceHistory: () => void;

/**
 * 自定义的路由事件名
 */
declare const EventName = "pageAction";

/**
 * 展开的 Action 类型
 */
export declare type ExtendAction<Ext extends {
    payload?: never;
    [k: string]: any;
}> = Ext & {
    type: string;
};

/**
 * 异步请求处理器配置参数
 */
export declare type FetchHandlerOptions<Args extends any[], Resp = any> = {
    fetcher: PromiseFn<Resp, Args>;
    /**
     * 请求结束后的回调方法
     */
    after?: (result: [Resp, Args, any]) => void;
    /**
     * 请求前的回调方法
     */
    before?: (...args: Args) => void;
    /**
     * 用于一个请求处理多份数据的情况，避免错误拦截
     */
    identifier?: (...args: Args) => string;
};

/**
 * Function
 */
export declare type FunctionLike<Args extends unknown[] = [], RET = void> = (...args: Args) => RET;

/**
 * 获取当前页面的路由动作
 * @returns
 */
declare const getCurrentPageAction: () => PageAction;

/**
 * 获取页面唯一ID
 * @returns
 */
declare const getPageId: () => string;

/**
 * 获取页面状态数据
 * @param init 初始值
 * @param pageId 页面ID，可选
 */
declare const getPageState: <D>(init: D | (() => D), pageId?: string) => D;

/**
 * 获取 store
 * @returns
 */
export declare const getStore: () => Store<any, AnyAction>;

declare namespace historyHelper {
    export {
        EventName,
        getPageId,
        getPageState,
        setPageState,
        enhanceHistory,
        getCurrentPageAction,
        PageAction
    }
}
export { historyHelper }

/**
 * redux 路由中间件，用于发起自定义的路由事件和更新路由信息
 */
export declare function historyMiddleware({ dispatch }: {
    dispatch: any;
}): (next: any) => any;

/**
 * 推导 model.actions 对象类型
 */
export declare type InferModelActions<MCRA> = {
    [key in keyof MCRA]: MCRA[key] extends (state: any) => any ? ActionCreator : MCRA[key] extends (state: any, action: PayloadAction<infer P>) => any ? ActionCreator<P> : MCRA[key] extends (state: any, action: ExtendAction<infer O>) => any ? ActionCreator<O> : never;
};

/**
 * 推导 model.fetch 对象类型
 */
export declare type InferModelFetch<STATE = any> = {
    [key in keyof STATE]?: PromiseFn<STATE[key]>;
};

/**
 * 初始化 redux store
 * @param options {@link InitStoreOption}
 * @returns
 */
export declare function initStore<STATE = any>(options: InitStoreOption): {
    updateReducer: (reducers: ReducerRecord, force?: boolean) => void;
    store: Store<STATE, AnyAction>;
};

/**
 * 初始化 Store 的配置项
 */
export declare type InitStoreOption = {
    /**
     * 是否开发模式
     */
    isDev?: boolean;
    /**
     * 初始值
     */
    initState?: any;
    /**
     * 中间件列表
     */
    middleware?: any[];
    /**
     * 切片 reducer
     */
    reducerRecord?: ReducerRecord;
    /**
     * 根 reducer
     */
    rootReducers?: ReducerRecord;
};

/**
 * 判断一个值是否为空：0、NaN、null、undefined、空字符串、空数组、空对象
 * @param value
 * @returns
 */
export declare const isEmpty: (value: unknown) => boolean;

/**
 * 判断是否相等的函数类型
 */
export declare type IsEqual<P = any> = (last: P, current: P) => boolean;

/**
 *  判断是否存在加载中标识
 * @param obj
 * @returns
 */
export declare const isPending: <T = any>(obj: T) => boolean;

/**
 * class 类型定义
 */
export declare type Klass<Args extends unknown[] = unknown[], I = any> = (new (...args: Args) => I);

/**
 * Model 对象数据结构
 */
export declare type Model<STATE extends ValidObj, MCRA extends ModelCaseReducerActions<STATE>, SIF extends InferModelFetch<STATE>> = {
    name?: string;
    reducer: Reducer<STATE>;
    actions: InferModelActions<MCRA>;
    getState: () => STATE;
    useModel: <T = STATE>(selector?: Selector<STATE, T>, config?: {
        withSuspense?: boolean | ((subState: any) => boolean);
        eq?: IsEqual<T>;
    }) => T;
    fetch: SIF;
};

/**
 * model 基础配置
 */
export declare type ModelBaseOptions<STATE extends Record<string, any>, MCRA extends ModelCaseReducerActions<STATE>, SIF extends InferModelFetch<STATE> = InferModelFetch<STATE>> = {
    name?: string;
    statePaths: string[];
    initialState: STATE;
    reducers: MCRA;
    fetch?: SIF;
    extraReducers?: Record<string, ReducerCase<STATE>> | FunctionLike<[Builder<STATE>], void>;
};

/**
 * 缓存配置
 */
export declare type ModelCacheOptions = {
    cacheKey: string;
    cacheStorage: 'session' | 'local' | Storage;
    cacheVersion?: string;
};

/**
 * reducer case 方法集合对象
 */
export declare type ModelCaseReducerActions<STATE> = Record<string, FunctionLike<[STATE, any?], any | void>>;

/**
 * 创建一个 Promise，将 resolve 和 reject 提取到作用域外
 */
export declare function outPromise<T = any | void>(): {
    promise: Promise<T>;
    resolve: (data?: T) => void;
    reject: (error?: T) => void;
};

/**
 * 页面动作
 */
export declare type PageAction = 'push' | 'replace' | 'forward' | 'goBack';

/**
 * 分页请求处理器配置参数
 */
export declare type PaginationHandlerOptions<Args extends any[], Resp = any> = FetchHandlerOptions<Args, Resp> & {
    /**
     * 根据请求参数判断是否是重置请求(加载第一页的请求)
     */
    isReset: (...args: Args) => boolean;
};

/**
 * 带 payload 字段的 Action 类型
 */
export declare type PayloadAction<P = any> = {
    type: string;
    payload: P;
};

/**
 * 返回 Promise 实例的方法类型
 */
export declare type PromiseFn<Resp = unknown, Args extends any[] = unknown[]> = (...args: Args) => Promise<Resp>;

/**
 * Reducer 函数内的一个 case 分支
 */
export declare type ReducerCase<STATE> = (state: STATE, action?: AnyAction) => STATE | void;

/**
 * reducer 配置对象
 */
export declare type ReducerRecord = Record<string, Reducer>;

/**
 * ReduxContext
 */
export declare const ReduxContext: any;

/**
 * ReduxController 结合 Redux 使用的控制器，继承自 {@link Controller}
 */
export declare class ReduxController<S = any, P = any> extends Controller<S, P> {
    /**
     * redux dispatch 方法
     */
    protected readonly dispatch: Dispatch;
    /**
     * redux store 对象
     */
    protected readonly store: Store;
    constructor(store: Store, props?: P);
}

/**
 * ReduxProvider
 */
export declare const ReduxProvider: React_2.FC<{
    store: Store;
    children: any;
    setDefault?: boolean;
}>;

/**
 * 筛选器的函数类型
 */
export declare type Selector<S = unknown, P = unknown> = (state: S) => P;

/**
 * 设置页面状态数据
 * @param data 数据
 * @param pageId 页面ID
 */
declare const setPageState: <D>(data: D, pageId?: string) => void;

/**
 * 设置加载中标识
 * @param obj
 * @param pending
 * @returns
 */
export declare const setPending: <T>(obj: T, pending: boolean) => any;

/**
 * {@link useStateRef} 的第二个返回值，用于更新状态
 */
export declare type SetRefState<S> = (
/**
 * 待更新的值
 */
state: T_OrReturnT<S>, 
/**
 * 更新值的时候，阻止重新渲染
 */
preventUpdate?: boolean) => void;

/**
 * 设置 store
 * @param _store
 * @returns
 */
export declare const setStore: (_store: Store) => Store<any, AnyAction>;

/**
 * 类型为 T 或者是返回 T 的函数
 */
export declare type T_OrReturnT<T> = T | ((data?: T) => T);

/**
 * thunkMiddleware 处理 ActionCreator 函数
 */
export declare function thunkMiddleware({ getState }: {
    getState: any;
}): (next: any) => (action: any) => any;

/**
 * 在组件内使用一个 Controller 子类
 * @param CtrlClass {@link Controller} 的子类
 * @param props 组件的 `props`
 * @returns 返回一个元组，内容分别是 {@link Controller} 实例，以及实例内 {@link Controller.useHooks} 的返回值
 */
export declare function useController<C extends Controller, P = any>(CtrlClass: Klass<[P?], C>, props?: P): [C, ReturnType<C['useHooks']>];

/**
 * 通过 context 获取父级组件的 Controller 实例
 * @param CtrlClass - 父级组件使用的 Controller 类
 * @returns - 返回 {@link Controller} 实例
 */
export declare function useCtrlContext<C extends Klass & {
    Context: any;
} = any>(CtrlClass: C): InstanceType<C>;

/**
 * 获取 Redux 的 Dispatch 方法
 * @returns
 */
export declare const useDispatch: () => any;

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
export declare function usePageEffect(options: {
    onEnter?: FunctionLike<[PageAction], void>;
    onLeave?: FunctionLike<[PageAction], void>;
    onEnterEffect?: FunctionLike<[PageAction], void>;
}): void;

/**
 * 查询和设置页面状态数据
 * @param init 初始值
 * @param suffix 每个路由都有一个唯一的 ID，但是同一个路由下可以使用多份缓存，suffix 用于区分不同的缓存
 * @returns 返回一个元组，内容分别是 state 和 {@link SetRefState}
 */
export declare function usePageState<T>(init: T | (() => T), suffix?: string): [T, SetRefState<T>];

/**
 * 使用 useRef 保留对最新 props 的引用
 * @param prop - 可以是任意组件闭包内的任何变量
 * @returns `React.MutableRefObject<P>`
 */
export declare function usePropRef<P>(prop: P): React_2.MutableRefObject<P>;

/**
 * 在组件内使用一个 ReduxController 子类
 * @param CtrlClass {@link ReduxController} 的子类
 * @param props 组件的 `props`
 * @returns 返回一个元组，内容分别是 {@link ReduxController} 实例，以及实例内 {@link Controller.useHooks} 方法的返回值
 */
export declare function useReduxController<C extends ReduxController, P = any>(CtrlClass: Klass<[Store, P?], C>, props?: P): [C, ReturnType<C['useHooks']>];

/**
 * 订阅 Redux 的状态数据
 * @param selector 数据选择器函数 {@link Selector}
 * @param options 配置选项 {@link UseSelectorOptions}
 */
export declare function useSelector<S = DefaultRootState, P = any>(selector: Selector<S, P>, options?: UseSelectorOptions<P>): P;

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
export declare type UseSelectorOptions<P> = {
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
};

/**
 * 用 ref 实现的 useState，用于保留对最新 state 的引用
 * @param { T_OrReturnT<T> } init - 初始值
 * @returns 返回一个元组，内容分别是 state, {@link SetRefState} 和 `React.MutableRefObject<T>`
 */
export declare function useStateRef<T>(init: T_OrReturnT<T>): [T, SetRefState<T>, React_2.MutableRefObject<T>];

/**
 * 有效对象
 */
export declare type ValidObj = {
    [k: string]: any;
};

/**
 * Without
 */
export declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * 增强路由组件，给页面级组件的路由事件回调提供切入点。
 * @param Component
 * @param opt
 * @returns
 */
export declare function withPageHook<T = FunctionLike<[any], any>>(Component: T, opt: {
    onEnter?: FunctionLike<[PageAction?], void>;
    onLeave?: FunctionLike<[PageAction?], void>;
}): T;

/**
 * 互斥类型
 */
export declare type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

export { }
