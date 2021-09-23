import { isFunction } from "../utils/is-type";

export  function thunkMiddleware({ dispatch, getState }) {
    return (next) => {
        return (action) => {
            return isFunction(action) ? action(dispatch, getState) : next(action);
        };
    };
}