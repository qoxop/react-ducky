export const getTypeString = (val: unknown): string => Object.prototype.toString.call(val);

export const isMap = (val: unknown): val is Map<any, any> => getTypeString(val) === '[object Map]';
export const isSet = (val: unknown): val is Set<any> => getTypeString(val) === '[object Set]';

export const isDate = (val: unknown): val is Date => val instanceof Date;
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';
export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';

export const isPromise = <T = any>(val: unknown): val is Promise<T> => (isObject(val) && isFunction(val.then) && isFunction(val.catch));