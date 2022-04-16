export const getTypeString = (val: unknown): string => Object.prototype.toString.call(val);

export const isMap = (val: unknown): val is Map<unknown, unknown> => getTypeString(val) === '[object Map]';
export const isSet = (val: unknown): val is Set<unknown> => getTypeString(val) === '[object Set]';
export const isArray = (val: unknown): val is Array<unknown> => (Array.isArray ? Array.isArray(val) : getTypeString(val) === '[object Array]');

export const isDate = (val: unknown): val is Date => val instanceof Date;
/* eslint-disable @typescript-eslint/ban-types */
export const isFunction = (val: unknown): val is Function => typeof val === 'function';
export const isString = (val: unknown): val is string => typeof val === 'string';
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol';
export const isObject = (val: unknown): val is Record<keyof any, unknown> => val !== null && typeof val === 'object';

export const isPromise = <T = unknown>(val: unknown): val is Promise<T> => (
  isObject(val) && isFunction(val.then) && isFunction(val.catch)
);
