import React, { useEffect, useMemo } from 'react';
import {bindActionCreators } from 'redux'
import { ReduxControler, useReduxController, ctrlEnhance} from 'rtk-like';
import { TodoItem } from '../typings';
import { actions, useModel as useTodoModel } from './slice';
import  { Todo, AddTodo, Filter } from '../components';

@ctrlEnhance({ bindThis: true })
class TodoController extends ReduxControler {
    actions: typeof actions;
    constructor(store) {
        super(store);
        this.actions = bindActionCreators(actions, this.dispatch);
    }
    useInit() {
        const { filter, todos } = useTodoModel();
        const todoArr = useMemo(() => {
            const data: TodoItem[] = [];
            Object.keys(todos).forEach(key => {
                const todo = todos[key];
                if ((filter === 'unfinished' && !todo.finished) || (filter === 'finished' && todo.finished) || (filter === 'all')) {
                    data.push(todo);
                }
            });
            return data;
        }, [todos, filter]);
        useEffect(() => {
            setTimeout(() => {
                this.setState(s => {
                    s.a += 1;
                });
            }, 1000);
        },[this.state.a]);
        return { filter, todos: todoArr }
    }
}
export function TodoApp() {
    const [ctrl, { todos, filter }] = useReduxController(TodoController);
    const bindActions = ctrl.actions;
    return (
        <TodoController.Provider controller={ctrl}>
            <div className="todo-module">
                <AddTodo onSave={ctrl.actions.addTodo} />
                <Filter type={filter} onChange={bindActions.setFilter} />
                <div>
                    {todos.map(item => (<Todo
                        key={item.id}
                        todo={item}
                        onToggle={bindActions.toggleTodo}
                        onDelete={bindActions.delTodo}
                    />))}
                </div>
            </div>
        </TodoController.Provider>
        
    )
}