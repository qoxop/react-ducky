import { PageAction } from '../typings';
import { isFunction } from './is-type';
import { createSessionItem } from './storage';

let executed = false;
let currentPageAction:PageAction = 'replace';

const EventName = 'pageAction';

/**
 * 获取当前页面的路由动作
 * @returns
 */
const getCurrentPageAction = () => currentPageAction;

const getPageKey = () => {
  const hrefFragment = window.location.href.split('?');
  const search = hrefFragment[hrefFragment.length - 1] || '';
  const keyFragment = search.split('_rt_key=')[1];
  if (keyFragment) {
    return keyFragment.split('&')[0] || 'init_page_key';
  }
  return 'init_page_key';
};

const getPageState = <D>(init: D | (() => D), pageKey?: string): D => {
  const key = pageKey || getPageKey();
  const dataStr = sessionStorage.getItem(key);
  if (dataStr) {
    try {
      return JSON.parse(dataStr).v;
    } catch (error) {
      console.warn(error);
    }
  }
  return isFunction(init) ? init() : init;
};

const setPageState = <D>(data: D, pageKey?: string) => {
  const key = pageKey || getPageKey();
  sessionStorage.setItem(key, JSON.stringify({ v: data }));
};

// eslint-disable-next-line dot-notation
const createKey = () => (`rk_${createKey['_called_times'] = (createKey['_called_times'] || 0) + 1}${Date.now().toString(36)}`);

/**
 * 更新 路由 key 值
 * @param PageKey
 * @param url
 * @returns
 */
const setPageKeyToUrl = (PageKey: string, url?: string | URL) => {
  if (url !== undefined && url !== null) {
    if (typeof url === 'string') {
      const path = /#/.test(url) ? url.split('#')[1] : url;
      url = /\?/.test(path) ? `${url}&${PageKey}` : `${url}?${PageKey}`;
    } else if (url.hash) {
      url.hash += (/\?/.test(url.hash) ? `&${PageKey}` : `?${PageKey}`);
    } else {
      url.search += (/\?/.test(url.search) ? `&${PageKey}` : `?${PageKey}`);
    }
  }
  return url;
};
/**
 * 增强 window.history 能力，使其能监听判断浏览器的前进后退
 * @returns
 */
const enhanceHistory = () => {
  if (executed) return;

  const PageStackStorage = createSessionItem<string[]>('$route_stack');
  const PageStack = PageStackStorage.get() || [getPageKey()];

  const updateActions = {
    pushState: (key: string) => {
      const lastKey = getPageKey();
      const position = PageStack.findIndex((stackKey) => stackKey === lastKey);
      if (position > -1) {
        const deletedKeys = PageStack.splice(position + 1, PageStack.length - position - 1, key);
        // remove items that never use
        setTimeout(() => {
          let allKeys = Object.keys(sessionStorage);
          deletedKeys.forEach((deleteKey: string) => {
            const restKeys = [];
            for (const storageKey of allKeys) {
              if (storageKey.indexOf(deleteKey) === 0) {
                sessionStorage.removeItem(storageKey);
              } else {
                restKeys.push(storageKey);
              }
            }
            allKeys = restKeys;
          });
        }, 17);
      } else {
        PageStack.push(key);
      }
      PageStackStorage.set(PageStack);
    },
    replaceState: (key: string) => {
      const lastKey = getPageKey();
      const position = PageStack.findIndex((stackKey) => stackKey === lastKey);
      PageStack[position] = key;
      PageStackStorage.set(PageStack);
    },
  };
  function enhanceHistoryMethod(methodName:'pushState'|'replaceState') {
    const method = window.history[methodName];
    // eslint-disable-next-line func-names
    return function (data: unknown, unused?: string, url?: string | URL) {
      const PageKey = createKey();
      if (data !== null && data !== undefined) {
        // save data to sessionStorage
        setPageState(data, PageKey);
      }
      if (url !== undefined && url !== null) {
        updateActions[methodName](PageKey);
        method.call(this, data, unused || '', setPageKeyToUrl(`_rt_key=${PageKey}`, url));
      } else {
        method.call(this, data, unused || '', url);
      }
      window.dispatchEvent(new Event(methodName));
    };
  }

  let lastPageKey = getPageKey();
  const handle = (eventType: 'popstate'|'pushState'|'replaceState') => {
    const currentPageKey = getPageKey();
    
    switch (eventType) {
      case 'pushState':
        currentPageAction = 'push';
        break;
      case 'replaceState':
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
    window.dispatchEvent(event);
    lastPageKey = currentPageKey;
  };
  window.history.pushState = enhanceHistoryMethod('pushState');
  window.history.replaceState = enhanceHistoryMethod('replaceState');
  window.addEventListener('popstate', () => handle('popstate'));
  window.addEventListener('pushState', () => handle('pushState'));
  window.addEventListener('replaceState', () => handle('replaceState'));
  executed = true;
};

export {
  EventName,
  getPageKey,
  getPageState,
  setPageState,
  enhanceHistory,
  getCurrentPageAction,
};

export type {
  PageAction,
};
