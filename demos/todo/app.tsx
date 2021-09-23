import React, { useMemo } from 'react';
import { useAsyncGetter, useSelector, useActions } from 'rtk-like';
import { FilterType, TodoItem } from '../typings';
import { actions, InitialState } from './slice';
import  { Todo, AddTodo, Filter } from '../components';

type TODOS = InitialState['todos'];

export function TodoApp() {
    const todos = useAsyncGetter((state) => state.todo?.todos) as TODOS;
    const filter = useSelector((state) => state.todo?.filter) as FilterType;
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