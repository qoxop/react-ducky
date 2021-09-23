import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunkMiddleware } from 'rtk-like';
import {reducer as TodoReducer} from './todo/slice';

// @ts-ignore
const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

export const store = createStore(
    combineReducers({
        todo: TodoReducer,
        
    }),
    composeEnhancers(applyMiddleware(thunkMiddleware))
);
