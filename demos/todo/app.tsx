import React, { useMemo } from 'react';
import { useSelector, useActions } from 'rtk-like';
import { TodoItem } from '../typings';
import { actions, InitialState } from './slice';
import  { Todo, AddTodo, Filter } from '../components';

export function TodoApp() {
    const { filter, todos } = useSelector((state) => state.todo) as InitialState;
    const { bindActions } = useActions({ actions });
    const todoArr = useMemo(() => {
        const data: TodoItem[] = []
        Object.keys(todos).forEach(key => {
            const todo = todos[key];
            if ((filter === 'unfinished' && !todo.finished) || (filter === 'finished' && todo.finished) || (filter === 'all')) {
                data.push(todo);
            }
        });
        return data;
    }, [todos, filter]);
    return (
        <div className="todo-module">
            <AddTodo onSave={bindActions.addTodo} />
            <Filter type={filter} onChange={bindActions.setFilter} />
            <div>
                {todoArr.map(item => (<Todo
                    key={item.id}
                    todo={item}
                    onToggle={bindActions.toggleTodo}
                    onDelete={bindActions.delTodo}
                />))}
            </div>
        </div>
    )
}