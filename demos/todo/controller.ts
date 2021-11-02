import { useMemo } from 'react';
import { bindActionCreators, Store } from 'redux'
import { ReduxControler } from 'react-ducky';
import { actions, useModel as useTodoModel, TodoList } from './model';

export class TodoController extends ReduxControler {
    actions: typeof actions;
    constructor(store:Store) {
        super(store);
        this.actions = bindActionCreators(actions, this.dispatch);
    }
    useHooks() {
        const { filter, todos } = useTodoModel();
        const todoArr = useMemo(() => this.filterTodos(todos, filter), [todos, filter]);
        return { filter, todos: todoArr }
    }
    filterTodos = (todos: TodoList.TodoItem[], filter: TodoList.FilterType) => {
        switch(filter) {
            case 'finished': return todos.filter(todo => todo.finished);
            case 'unfinished': return todos.filter(todo => !todo.finished);
            default: return todos;
        }
    }
}