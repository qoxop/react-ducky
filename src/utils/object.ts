import { isArray } from './is-type';

/**
 * 重写 valueOf、toString
 * @param data
 * @param key
 * @param value
 */
export function ValueRef(data: unknown, key: string|symbol, value:unknown) {
  this.valueOf = () => data;
  if (typeof data === 'string') {
    this.toString = () => data;
  }
  this[key] = value;
}

/**
 * 给任意值设置属性值
 * @returns
 */
const setProperty = <T>(obj: T, key:symbol|string, value: unknown) => {
  if (!obj || typeof obj !== 'object') {
    return new ValueRef(obj, key, value);
  }
  return Object.assign(isArray(obj) ? [] : {}, obj, { [key]: value });
};

const removeProperty = <T>(obj: T, key:string|symbol) => {
  if (obj && key in obj) {
    delete obj[key];
  }
  return obj.valueOf();
};

export {
  setProperty,
  removeProperty,
};
