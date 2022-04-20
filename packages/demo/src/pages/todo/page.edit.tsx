import React from 'react';
import { usePageState } from 'react-ducky';
import { TodoItem } from './model.type';

const getInitTodo = () => ({
  id: '',
  title: '',
  description: '',
  expired: '',
  finished: false,
});

export const TodoEdit = () => {
  const [ todo ] = usePageState<TodoItem>(getInitTodo);
  return <div>
    {JSON.stringify(todo, null, '\t')}
    <div>
      <button>save</button>
    </div>
  </div>
}