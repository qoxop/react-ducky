import { isArray, isObject } from './is-type';

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
const setProperty = <T>(obj: T, key:symbol|string, value: unknown) => {
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
const removeProperty = <T>(obj: T, key:string|symbol) => {
  if (obj && key in obj) {
    delete obj[key];
  }
  return obj?.valueOf() ?? obj;
};

/**
 * 判断一个值是否为空：0、NaN、null、undefined、空字符串、空数组、空对象
 * @param value
 * @returns 
 */
const isEmpty = (value: unknown) => {
  if (!value) return true;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.getOwnPropertyNames(value).length === 0;
  return false;
}

export {
  isEmpty,
  ValueRef,
  setProperty,
  removeProperty,
};
