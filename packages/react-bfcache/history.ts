
import type {History } from 'history';
import { parse } from 'query-string';

let _history:History = null as any;

const getHistory = () => {
  if (!_history) throw 'enhanceHistory before use';
  return _history
}
const setHistory = (history: History) => {
  _history = history
};

const StacksManager = {
  stacks: [] as string[],
  push(key: string) {
    const { stacks } = this;
    const curRsKey = getCurRsKey();
    const position = stacks.indexOf(curRsKey);
    if (position > -1) {
      const deletedKeys = stacks.splice(position + 1, stacks.length - position - 1, key);
      clearCache(deletedKeys);
    }
    stacks.push(key);
    this.save();
  },
  replace(key: string) {
    const { stacks } = this;
    const curRsKey = getCurRsKey();
    const position = stacks.indexOf(curRsKey);
    if (position > -1) {
      // 更新栈信息
      stacks[position] = key;
      // 清除缓存
      clearCache([curRsKey]);
    }
    this.save();
  },
  save() {
    sessionStorage.setItem('$route_stacks', JSON.stringify(this.stacks));
  }
}

const getCurRsKey = () => {
  const { location } = getHistory();
  return parse(location.search)._rs_key_ as string || '';
}

const getRouteState = <D>(init: D | (() => D), _key?: string) => {
  const key = _key ? `${getCurRsKey()}${_key}` : getCurRsKey();
  const dataStr = sessionStorage.getItem(key);
  if (dataStr) {
    try {
      return JSON.parse(dataStr).v;
    } catch (error) {
      console.warn(error);
    }
  }
  return typeof init === 'function' ? (init as Function)() : init;
}

const setRouteState = <D>(data: D, _key: string) => {
  const key = _key ? `${getCurRsKey()}${_key}` : getCurRsKey();
  sessionStorage.setItem(key, JSON.stringify({ v: data }));
}

const clearCache = (deletedKeys: string[]) => {
  if (!deletedKeys || !deletedKeys.length) return;
  setTimeout(() => {
    let allKeys = Object.keys(sessionStorage);
    for (const deleteKey of deletedKeys) {
      const restKeys = [] as string[];
      for (const storageKey of allKeys) {
        if (storageKey.indexOf(deleteKey) === 0) {
          sessionStorage.removeItem(storageKey);
        } else {
          restKeys.push(storageKey);
        }
      }
      allKeys = restKeys;
    }
  }, 1000 / 60);
}

const getCurAction = () => {
  const { action } = getHistory();
  return action;
}

const uuid = ((count: number) => () => (`u_${count++}${Date.now().toString(36)}`))(0);

function enhanceHistory(history: History)  {
  const updateSearch = (search: string, key: string) => `${search}${(search || '').indexOf('?') > -1 ? '&' : '?'}_rs_key_=${key}`;
  const push = history.push.bind(history);
  const replace = history.replace.bind(history);
  history.push = function(location, state) {
    const rsKey = uuid();
    StacksManager.push(rsKey)
    if (typeof location === 'string') {
      return push(updateSearch(location, rsKey), state)
    }
    const { search, ...rest } = location;
    return push({ ...rest, search: updateSearch(search || '', rsKey)}, state)
  }

  history.replace = function(location, state) {
    const rsKey = uuid();
    StacksManager.replace(rsKey);
    if (typeof location === 'string') {
      return replace(updateSearch(location, rsKey), state);
    }
    const { search, ...rest} = location;
    return replace({ ...rest, search: updateSearch(search || '', rsKey)}, state);
  }
  setHistory(history);
  return history;
}


export {
  uuid,
  enhanceHistory,
  setRouteState,
  getRouteState,
  getCurAction,
}