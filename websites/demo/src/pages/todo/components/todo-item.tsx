import React, { useCallback, useState } from 'react';
import { Checkbox } from "@components"
import { TodoItem } from '../model';
import { TodoEditor } from './todo-editor';



export const Todo: React.FC<{
  data: TodoItem;
  onToggle: (todo: TodoItem) => void;
  onUpdate: (todo: TodoItem) => void;
  onDelete: (todoId: string) => void;
}> = React.memo(({ data, onToggle, onUpdate, onDelete }) => {
  const [updateMode, setUpdateMode] = useState(false);
  const onUpdateCallback = useCallback((todo: TodoItem) => {
    setUpdateMode(false);
    onUpdate(todo);
  }, [setUpdateMode, onUpdate])
  if (updateMode) {
    return (
      <div className='m-4 p-4 border-2 flex rounded '>
        <TodoEditor data={data} update={onUpdateCallback} onCancel={() => setUpdateMode(false)} />
      </div>
    )
  }
  return (
    <div className='m-4 p-4 border-2 flex rounded '>
      <Checkbox checked={data.finished} onChange={() => onToggle(data)} />
      <div className='flex flex-1 items-center'>
        <div className='flex-1 pl-3'>
          <span className={data.finished ? 'line-through' : ''}>
            {data.title}
          </span>
          <br />
          <span className='text-xs text-gray-400'>
            {data.expired}
          </span>
        </div>
        <button className='px-1 mx-1 rounded hover:bg-slate-100' onClick={() => setUpdateMode(true)}>edit</button>
        <button className='px-1 mx-1 rounded text-rose-600 hover:bg-slate-100'  onClick={() => onDelete(data.id)}>del</button>
      </div>
    </div>
  )
})
