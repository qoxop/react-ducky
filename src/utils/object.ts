import { isArray } from "./is-type";

/**
 * 重写 valueOf、toString
 * @param data 
 * @param key 
 * @param value 
 */
export function ValueRef(data: any, key: string|symbol, value:any) {
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
export const setProperty = <T>(obj: T, key:symbol|string, value: any) => {
  if (!obj || typeof obj !== 'object') {
    return new ValueRef(obj, key, value );
  }
  return Object.assign(isArray(obj) ? [] : {}, obj, { [key]: value } );
}

export const removeProperty = <T>(obj: T, key:string|symbol) => {
  if (obj && key in obj) {
		delete obj[key];
	}
	return obj.valueOf();
}