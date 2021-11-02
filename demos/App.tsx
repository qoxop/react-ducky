import { TodoApp } from './todo/app';
import { reducer, name } from './todo/model';
import { injectReduce } from './store';
import "./App.less";

injectReduce({ key: name, reducer });

export default TodoApp
