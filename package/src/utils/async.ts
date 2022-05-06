import {
  FETCHER_TYPE_ERROR,
  INVALID_REQUEST_ERROR,
  INVALID_RESPONSE_ERROR
} from "./constants";
import {
  setProperty,
  removeProperty,
} from "./object";
import { isPromise } from "./is-type";
import { PromiseFn } from "../typings";

enum FetchStatus {
  'LOADING' = 1,
  'UNACTIVE' = 2
}

/**
 * 创建一个 Promise，将 resolve 和 reject 提取到作用域外
 * @param void
 * @returns { promise: Promise<T>; resolve: (data?: T) => void; reject: (error?: T) => void;}
 */
const outPromise = <T = any|void>() => {
  const data: {
    promise: Promise<T>;
    resolve: (data?: T) => void;
    reject: (error?: T) => void;
  } = { resolve: null, reject: null, promise: null }
  data.promise = new Promise((resolve, reject) => {
    data.resolve = resolve;
    data.reject = reject;
  });
  return data;
}

/**
 * 将一个 promise 转化成一个永不报错的新 promise，把错误信息包装在返回结果中
 * @param ps
 * @returns [response, error]
 */
const alwayResolve = async <D>(ps: Promise<D>): Promise<[(D|null), any]> => {
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
  after?: (result: [Resp, Args, any]) => void;
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
 * 创建一个请求处理函数，当段时间内发起多个请求时，指响应最后一个请求，前面的请求返回时进行抛异常处理
 * @returns 
 */
const createFetchHandler = <Args extends unknown[], Resp>({ fetcher, after, before, identifier }: FetchHandlerOptions<Args,Resp>) => {
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
 * 分页请求处理器配置参数
 */
type PaginationHandlerOptions<Args extends any[], Resp = any> = FetchHandlerOptions<Args, Resp> & {
  /**
   * 根据请求参数判断是否是重置请求(加载第一页的请求)
   */
  isReset: (...args: Args) => boolean;
}

/**
 * 创建一个分页请求处理函数，
 * 当段时间内发起多个重置请求时，指响应最后一个请求，前面的请求返回时进行抛异常处理，
 * 限制发起分页请求必须是非 loading 状态(上一个请求结束之后)
 */
const createPaginationHandler = <A extends unknown[], D>({ fetcher, after, before, isReset, identifier }: PaginationHandlerOptions<A,D>) => {
	let statusMap: Record<string, FetchStatus|undefined> = {}
	let fetchIndexMap:Record<string, number> = {};
	return async (...args: A) => {
		const key = identifier ? identifier(...args) : 'def';
		const irs = isReset(...args);
		let ps:Promise<D>|null = null;
		// 拦截请求
		if (irs || statusMap[key] === FetchStatus.UNACTIVE || !statusMap[key]) {
			statusMap[key] = FetchStatus.LOADING;
			fetchIndexMap[key] = (fetchIndexMap[key] || 0) + 1;
			ps = fetcher(...args);
		} else {
      throw new Error(INVALID_REQUEST_ERROR);
		}
		const closureFetchIndex = fetchIndexMap[key];
    before && before(...args);
    if (isPromise(ps)) {
      const [data, error] = await alwayResolve(ps);
      // 拦截响应
      if (closureFetchIndex === fetchIndexMap[key]) { // 闭包内与闭包外相同
        statusMap[key] = FetchStatus.UNACTIVE;
        after && after([data, args, error]);
        if (error) throw error;
        return data;
      } else {
        throw new Error(INVALID_RESPONSE_ERROR);
      }
    }
    throw new Error(FETCHER_TYPE_ERROR);    
  }
}

const PENDING_KEY = Symbol('PENDING_KEY');

/**
 *  判断是否存在加载中标识 
 * @param obj
 * @returns 
 */
const isPending = <T = any>(obj:T) => !!(obj && obj[PENDING_KEY] === true);

/**
 * 设置加载中标识
 * @param obj 
 * @param pending 
 * @returns 
 */
const setPending = <T>(obj:T, pending: boolean) => {
	if (pending) {
    return setProperty(obj, PENDING_KEY, true);
	}
	return removeProperty(obj, PENDING_KEY);
};

export {
	isPending,
	setPending,
	outPromise,
	alwayResolve,
	createFetchHandler,
	createPaginationHandler,
}

export type {
  FetchHandlerOptions,
  PaginationHandlerOptions
}