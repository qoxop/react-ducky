import { isFunction } from '../utils/is-type';
import { enhanceHistory, EventName } from '../utils/history';

/**
 * thunkMiddleware 处理 ActionCreator 函数
 */
function thunkMiddleware({ getState }) {
  return (next) => (action) => (
    isFunction(action) ? action(next, getState) : next(action)
  );
}

/**
 * 路由动作
 */
const RouteActionType = 'ROUTE-CHANGED';

/**
 * redux 路由中间件，用于发起自定义的路由事件和更新路由信息
 */
function historyMiddleware({ dispatch }) {
  enhanceHistory();
  window.addEventListener(EventName, (event) => {
    const { search, pathname, hash } = window.location;
    const { state } = window.history;
    dispatch({type: RouteActionType, payload: {
      hash,
      state,
      search,
      pathname,
      method: event[`_${EventName}`],
    }});
  });
  return (next) => next;
}

export {
  thunkMiddleware,
  historyMiddleware,
  RouteActionType,
};
