export const getTypeString = (val: unknown): string => Object.prototype.toString.call(val);

/**
 * 是否为 Map 类型
 * @param val
 * @returns 
 */
export const isMap = (val: unknown): val is Map<unknown, unknown> => getTypeString(val) === '[object Map]';

/**
 * 是否为 Set 类型
 * @param val
 * @returns 
 */
export const isSet = (val: unknown): val is Set<unknown> => getTypeString(val) === '[object Set]';

/**
 * 是否为数组类型
 * @param val 
 * @returns 
 */
export const isArray = (val: unknown): val is Array<unknown> => (Array.isArray ? Array.isArray(val) : getTypeString(val) === '[object Array]');

/**
 * 是否为日期类型
 * @param val
 * @returns 
 */
export const isDate = (val: unknown): val is Date => val instanceof Date;

/**
 * 是否为函数类型
 * @param val
 * @returns 
 */
export const isFunction = (val: unknown): val is Function => typeof val === 'function';

/**
 * 是否为字符串类型
 * @param val
 * @returns 
 */
export const isString = (val: unknown): val is string => typeof val === 'string';

/**
 * 是否为 Symbol 类型
 * @param val
 * @returns 
 */
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';

/**
 * 是否为对象类型
 * @param val
 * @returns 
 */
export const isObject = (val: unknown): val is Record<keyof any, unknown> => val !== null && typeof val === 'object';

/**
 * 是否为 Promise 类型
 * @param val
 * @returns 
 */
export const isPromise = <T = unknown>(val: unknown): val is Promise<T> => (
  isObject(val) && isFunction(val.then) && isFunction(val.catch)
);
