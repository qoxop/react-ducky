import { isFunction } from '../utils/is-type';
import { enhanceHistory, EventName } from '../utils/history';

const thunkMiddleware = ({ getState }) => (next) => (action) => (
  isFunction(action) ? action(next, getState) : next(action)
);

const RouteActionType = 'ROUTE-CHANGED';

const historyMiddleware = ({ dispatch }) => {
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
