import { isFunction } from "../utils/is-type";

const thunkMiddleware = ({ dispatch, getState }) => {
    return (next) => {
        return (action) => {
            return isFunction(action) ? action(dispatch, getState) : next(action);
        };
    };
}

export {
    thunkMiddleware
}