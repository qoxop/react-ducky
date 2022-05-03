/**
 * 无效响应错误
 */
export const INVALID_RESPONSE_ERROR = 'invalid response ~';

/**
 * 无效请求错误
 */
export const INVALID_REQUEST_ERROR = 'invalid request ~';

/**
 * 异步函数类型错误
 */
export const FETCHER_TYPE_ERROR = 'typeError: fetcher need to return a promise ~';

/**
 * Action Type 重复错误
 */
export const ACTION_TYPE_DUPLICATE_WARN = 'action type duplicate ~';

export const STORE_UNINITIALIZED_ERROR = 'Store 未初始化';

export const POP_STATE = 'popstate';
export const PUSH_STATE = 'pushState';
export const REPLACE_STATE = 'replaceState';

export const REDUX_DEVTOOL = '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__';

export const dispatchEvent = window.dispatchEvent.bind(window);
export const addEventListener = window.addEventListener.bind(window);
export const JsonParse = JSON.parse;
export const JsonStringify = JSON.stringify;
export const {
  history,
  localStorage,
  sessionStorage,
} = window;
