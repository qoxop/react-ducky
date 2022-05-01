import { T_OrReturnT } from "..";
import { isFunction } from "./is-type";

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
 * 计算 T_OrReturnT 类型
 * @param init T_OrReturnT<T>
 * @returns T
 */
const getInit = <T>(init: T_OrReturnT<T>) => isFunction(init) ? init() : init;

export {
  shallowEqual,
  getInit
}