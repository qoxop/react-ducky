
/**
 * 创建一个 Promise，将 resolve 和 reject 提取到作用域外
 * @param void
 * @returns { promise: Promise<T>; resolve: (data?: T) => void; reject: (error?: T) => void;}
 */
export function OutPromise<T = any|void>(){
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

type ToFinallyReturn<T> = Promise<[T|undefined, any|undefined]>;

/**
 * 将一个 promise 转化成一个永不报错的新 promise，
 * 把错误信息包装在返回结果中
 * @param ps
 * @returns [response, error]
 */
export const toFinally = <T>(ps: Promise<T>): ToFinallyReturn<T> => (new Promise((resolve) => {
    try {
        ps.then(response => resolve([response, undefined])).catch(error => resolve([undefined, error]));
    } catch (error) {
        resolve([undefined, error]);
    }
}))