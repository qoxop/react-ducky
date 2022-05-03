import {
  POP_STATE,
  PUSH_STATE,
  REPLACE_STATE,
  history,
  dispatchEvent,
  sessionStorage,
  addEventListener,
  JsonParse,
  JsonStringify,
} from './constants';
import { uuid } from './helper';
import { isFunction } from './is-type';
import { PageAction } from '../typings';
import { createSessionItem } from './storage';

let executed = false;
let currentPageAction:PageAction = 'replace';

const initPageKey = uuid();
const EventName = 'pageAction';

/**
 * 获取当前页面的路由动作
 * @returns
 */
const getCurrentPageAction = () => currentPageAction;

/**
 * 获取页面唯一ID
 * @returns
 */
const getPageId = ():string => history.state?._key_ || initPageKey;

/**
 * 获取页面状态数据
 * @param init 初始值
 * @param pageId 页面ID，可选
 */
const getPageState = <D>(init: D | (() => D), pageId?: string): D => {
  const key = pageId || getPageId();
  const dataStr = sessionStorage.getItem(key);
  if (dataStr) {
    try {
      return JsonParse(dataStr).v;
    } catch (error) {
      console.warn(error);
    }
  }
  return isFunction(init) ? init() : init;
};

/**
 * 设置页面状态数据
 * @param data 数据
 * @param pageId 页面ID
 */
const setPageState = <D>(data: D, pageId?: string) => {
  const key = pageId || getPageId();
  // @ts-ignore from history lib
  if (data.idx && data.key) {
    // @ts-ignore
    if (data.usr) sessionStorage.setItem(key, JsonStringify({ v: data.usr }));
    return;
  }
  sessionStorage.setItem(key, JsonStringify({ v: data }));
};

/**
 * 创建页面ID
 * @param state 
 */
const createPageId = (state: any):string => (state && state.idx && state.key) ? state.key : uuid();

/**
 * 判断是否使用旧的页面ID，用于页面路径不发生变化，但是路由栈修改的情况下
 * @param state
 * @param url 
 */
const isUseOldPageId = (state: any, url?: string | URL): boolean => (!url || state?._key_ === -1 || state?.usr?._key_ === -1);

/**
 * 向 state 注入_key_字段
 * @param state
 * @param url 
 */
const injectKeyToState = (state: any, url?: string | URL) => ({
  ...state,
  _key_: isUseOldPageId(state, url) ? getPageId() : createPageId(state),
});


/**
 * 增强 history 能力，使其能监听判断浏览器的前进后退
 * @returns
 */
const enhanceHistory = () => {
  if (executed) return;

  const PageStackStorage = createSessionItem<string[]>('$route_stack');
  const PageStack = PageStackStorage.get() || [getPageId()];

  const updateActions = {
    pushState: (key: string) => {
      const lastKey = getPageId();
      // 获取路由栈指针位置
      const position = PageStack.findIndex((stackKey) => stackKey === lastKey);
      if (position > -1) {
        // 将指针指后的 key 值取出
        const deletedKeys = PageStack.splice(position + 1, PageStack.length - position - 1, key);
        // 稍后清空
        setTimeout(() => {
          let allKeys = Object.keys(sessionStorage);
          for (const deleteKey of deletedKeys) {
            const restKeys = [];
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
      } else {
        PageStack.push(key);
      }
      PageStackStorage.set(PageStack);
    },
    replaceState: (key: string) => {
      const lastKey = getPageId();
      const position = PageStack.findIndex((stackKey) => stackKey === lastKey);
      PageStack[position] = key;
      PageStackStorage.set(PageStack);
    },
  };
  

  let lastPageKey = getPageId();
  const routeChangeCallback = (eventType: 'popstate'|'pushState'|'replaceState') => {
    const currentPageKey = getPageId();
    switch (eventType) {
      case PUSH_STATE:
        currentPageAction = 'push';
        break;
      case REPLACE_STATE:
        currentPageAction = 'replace';
        break;
      default:
        const lastIndex = PageStack.findIndex((key) => key === lastPageKey);
        const currentIndex = PageStack.findIndex((key) => key === currentPageKey);
        if (lastIndex > currentIndex) {
          currentPageAction = 'goBack';
        } else {
          currentPageAction = 'forward';
        }
    }
    const event = new Event(EventName);
    event[`_${EventName}`] = currentPageAction;
    dispatchEvent(event);
    lastPageKey = currentPageKey;
  };
  function enhanceHistoryMethod(methodName:'pushState'|'replaceState') {
    const method = history[methodName];
    return function (data: unknown, unused?: string, url?: string | URL) {

      const dataWithKey = injectKeyToState(data, url);

      if (data) setPageState(data, dataWithKey._key_);
      
      if (url !== undefined && url !== null) {
        updateActions[methodName](dataWithKey._key_);
        method.call(this, dataWithKey, unused || '', url);
      } else {
        method.call(this, dataWithKey, unused || '', url);
      }
      // 提前执行
      routeChangeCallback(methodName);
    };
  }
  history.pushState = enhanceHistoryMethod(PUSH_STATE);
  history.replaceState = enhanceHistoryMethod(REPLACE_STATE);
  addEventListener(POP_STATE, () => routeChangeCallback(POP_STATE));
  executed = true;
};

export {
  EventName,
  getPageId as getPageKey,
  getPageState,
  setPageState,
  enhanceHistory,
  getCurrentPageAction,
};

export type {
  PageAction,
};
