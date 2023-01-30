import { INVALID_RESPONSE_ERROR } from "./constants";
import { PromiseFn, T_OrReturnT } from "../../typings";
import { isArray, isObject, isFunction } from './is-type';
import { Dispatch } from "redux";

const PENDING_KEY = Symbol('PENDING_KEY');

/**
 * 浅对比
 * @param last
 * @param cur
 * @returns boolean
 */
function shallowEqual(last: any, cur: any) {
  if (last === cur) return true;
  if (
    cur
    && last
    && typeof cur === 'object'
    && typeof last === 'object'
    && cur.constructor === last.constructor
  ) {
    const curKeys = Object.keys(cur);
    return (
      curKeys.length === Object.keys(last).length &&
      curKeys.every((k) => cur[k] === last[k]) &&
      cur[PENDING_KEY] === last[PENDING_KEY]
    );
  }
  return false;
};

/**
 * 创建一个唯一ID
 */
const uuid = ((count: number) => () => (`u_${count++}${Date.now().toString(36)}`))(0);

/**
 * 计算 T_OrReturnT 类型
 * @param init T_OrReturnT<T>
 * @returns T
 */
function getInit<T>(init: T_OrReturnT<T>) {
  return isFunction(init) ? init() : init;
}


// #region 对象赋值
/**
 * 重写 valueOf、toString
 * @param data
 * @param key
 * @param value
 */
function ValueRef(data: unknown, key: string|symbol, value:unknown) {
  this.valueOf = () => data;
  if (typeof data === 'string') {
    this.toString = () => data;
  }
  this[key] = value;
}

/**
 * 给任意值安全的地设置属性值
 * @returns
 */
function setProperty<T>(obj: T, key:symbol|string, value: unknown) {
  if (!obj || typeof obj !== 'object') {
    return new ValueRef(obj, key, value);
  }
  return Object.assign(isArray(obj) ? [] : {}, obj, { [key]: value });
};

/**
 * 从任意值上安全地移除某个属性
 * @param obj
 * @param key
 * @returns
 */
function removeProperty<T>(obj: T, key:string|symbol) {
  if (obj && key in obj) {
    delete obj[key];
  }
  // @ts-ignore
  return obj?.valueOf ? obj.valueOf() : obj;
};

/**
 * 判断一个值是否为空：0、NaN、null、undefined、空字符串、空数组、空对象
 * @param value
 * @returns
 */
function isEmpty(value: unknown) {
  // @ts-ignore
  if (!value || !value?.valueOf()) return true;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.getOwnPropertyNames(value).length === 0;
  return false;
}
// #endregion

// #region async-function-tools

/**
 * 创建一个 Promise，将 resolve 和 reject 提取到作用域外
 */
function outPromise <T = any|void>() {
  type Result = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (error?: T) => void;
  }
  const data: Result = { resolve: null, reject: null, promise: null } as any
  data.promise = new Promise((resolve, reject) => {
    data.resolve = resolve;
    data.reject = reject;
  });
  return data;
}

/**
 * 将一个 Promise 实例 转化成一个永不报错的新 Promise 实例，把错误信息包装在返回结果中
 * @param ps Promise 实例
 * @returns `[data, null] | [null, error]`
 */
async function alwayResolve <D>(ps: Promise<D>): Promise<[(D|null), any]> {
  try {
    const data = await ps;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}

/**
 * 异步请求处理器配置参数
 */
type FetchHandlerOptions<Args extends any[], Resp = any> = {
  fetcher: PromiseFn<Resp, Args>;
  /**
   * 请求结束后的回调方法
   */
  after?: (result: [Resp|null, Args, any]) => void;
  /**
   * 请求前的回调方法
   */
  before?: (...args: Args) => void;
  /**
   * 用于一个请求处理多份数据的情况，避免错误拦截
   */
  identifier?: (...args: Args) => string;
}

/**
 * 创建一个请求处理函数，当段时间内发起多个请求时，只响应最后一个请求，前面的请求返回时进行抛异常处理
 * @param options 配置对象 {@link FetchHandlerOptions}
 * @returns
 */
function createFetchHandler<Args extends unknown[], Resp>(options: FetchHandlerOptions<Args,Resp>) {
  const { fetcher, after, before, identifier } = options;
  let fetchIndexMap:Record<string, number> = {};
  return async (...args: Args) => {
    const key = identifier ? identifier(...args) : 'def';
    const ps:Promise<Resp>  = fetcher(...args);
    before && before(...args);
    fetchIndexMap[key] = (fetchIndexMap[key] || 0) + 1;
    const closureFetchIndex = fetchIndexMap[key];
    // 拦截响应
    const [data, error] = await alwayResolve(ps);
    if (closureFetchIndex === fetchIndexMap[key]) { // 闭包内与闭包外相同
      after && after([data, args, error]);
      if (error) throw error;
      return data;
    } else {
      throw new Error(INVALID_RESPONSE_ERROR);
    }
  }
}

/**
 *  判断对象是否存在加载中标识
 * @param obj
 * @returns
 */
function isPending<T = any>(obj:T) {
  return !!(obj && obj[PENDING_KEY] === true);
}

/**
 * 设置加载中标识
 * @param obj
 * @param pending
 * @returns
 */
function setPending <T>(obj:T, pending: boolean) {
	if (pending) {
    return setProperty(obj, PENDING_KEY, true);
	}
	return removeProperty(obj, PENDING_KEY);
};
// #endregion

/**
 * @deprecated
 *
 * @param type
 * @param fetcher
 * @returns
 */
function createAtomChunk<T = any, Ags extends Array<unknown> = unknown[]>(
  type: string,
  fetcher: PromiseFn<T, Ags>
) {
  let count = 0;
  return function atomChunk(...args: Ags) {
    return (dispatch: Dispatch) => {
      const promise = fetcher(...args);
      const innerCount = count = (count + 1);
      dispatch({ type, payload: { status: 'pending', isPending: true, error: null }});
      promise.then((response) => {
        if (innerCount === count) {
          dispatch({ type, payload: {
            status: 'fulfilled',
            value: response,
            error: null,
            isPending: false,
          }});
        }
      }).catch(error => {
        if (innerCount === count) {
          dispatch({ type, payload: {
            status: 'rejected',
            error,
            isPending: false,
          }});
        }
      });
      return promise;
    }
  }
}

export {
  uuid,
  getInit,
  isEmpty,

  // #region
  shallowEqual,
  ValueRef,
  setProperty,
  removeProperty,
  // #endregion

  // #region
  outPromise,
  alwayResolve,
  createFetchHandler,
  isPending,
  setPending,
  // #endregion
  createAtomChunk,
};
export * from './is-type';
export * from './storage';
export type { FetchHandlerOptions }
