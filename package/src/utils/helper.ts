import { isFunction } from "./is-type";
import { T_OrReturnT } from "../typings";

/**
 * 浅对比
 * @param last
 * @param cur
 * @returns boolean
 */
const shallowEqual = <T>(last: T, cur: T) => {
  if (last === cur) return true;
  if (cur && last && typeof cur === 'object' && typeof last === 'object') {
    const curKeys = Object.keys(cur);
    return curKeys.every((k) => cur[k] === last[k]) && curKeys.length === Object.keys(last).length;
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
const getInit = <T>(init: T_OrReturnT<T>) => isFunction(init) ? init() : init;

export {
  uuid,
  shallowEqual,
  getInit,
}