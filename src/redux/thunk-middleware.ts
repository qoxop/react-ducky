import { isFunction } from '../utils/is-type';

const thunkMiddleware = ({ dispatch, getState }) => (next) => (action) => (
  isFunction(action) ? action(dispatch, getState) : next(action)
);

export {
  thunkMiddleware,
};
