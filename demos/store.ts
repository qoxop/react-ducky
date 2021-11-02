import {
    compose,
    Reducer,
    createStore,
    combineReducers,
    applyMiddleware
} from 'redux';
import { thunkMiddleware } from 'react-ducky';

type ArrayItem<T> = T|Array<T>;

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const reducerObj = {}

export const store = createStore(
    state => state,
    composeEnhancers(applyMiddleware(thunkMiddleware))
);
export const injectReduce = (reducers: ArrayItem<{ key: string; reducer: Reducer; }>) => {
    reducers = reducers instanceof Array ? reducers: [reducers];
    let hasNew = false;
    reducers.forEach(({key, reducer}) => {
        if (!reducerObj[key]) {
            hasNew = true;
            reducerObj[key] = reducer;
        };
    });
    store.replaceReducer(combineReducers(reducerObj));
}
