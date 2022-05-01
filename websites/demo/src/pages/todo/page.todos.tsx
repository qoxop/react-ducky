import React, { useCallback, useMemo } from 'react';
import { usePageState } from 'react-ducky';

import { Todo } from './components/todo-item';
import { TodoEditor } from './components/todo-editor';
import { TodoItem, todoActions, useTodoModel } from './model';
import { RadioGroup } from '@components';

const FilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Unfinished', value: 'unfinished' },
  { label: 'Finished', value: 'finished'},
];

export const TodoListPage= () => {
  const [filterStatus, setFilterStatus] = usePageState<'all'|'unfinished'|'finished'>('all', 'filter-status');
  const todoList = useTodoModel((state) => state.list);
  const toggle = useCallback((todo: TodoItem) => todoActions.toggle(todo.id), []);

  const todoListWithFilter = useMemo(() => {
    switch (filterStatus) {
      case 'unfinished':
        return todoList.filter(todo => !todo.finished);
      case 'finished':
        return todoList.filter(todo => todo.finished);
      default:
        return todoList;
    }
  }, [filterStatus, todoList]);

  return (
    <div>
      <h3 className='text-lg p-4 '>My Todo</h3>
      <div className='m-4 rounded text-center leading-tight'>
        <TodoEditor update={todoActions.add} />
      </div>
      <div className='mx-4 '>
        <RadioGroup
          options={FilterOptions}
          value={filterStatus}
          onChange={(value: any) => setFilterStatus(value)}
        />
      </div>
      <section className='pb-2'>
        {todoListWithFilter.map(item => (
            <Todo
              key={item.id}
              data={item}
              onToggle={toggle}
              onUpdate={todoActions.update}
              onDelete={todoActions.del}
            />
          )
        )}
      </section>
    </div>
  )
}
