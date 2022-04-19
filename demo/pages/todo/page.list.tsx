import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { withPageHook, isPending } from 'react-ducky';
import { getTodoState, todoActions, todoReducer, useTodoModel } from './model'
import { TodoItem } from './model.type';
import { updateReducer } from '../../provider';

const ListItem: React.FC<{
  data: TodoItem,
  onToggle: (todo: TodoItem) => void,
  onClickEdit: (todo: TodoItem) => void
}> = ({ data, onToggle, onClickEdit }) => (
  <div>
    <div>
      <input
        type="checkbox"
        checked={data.finished}
        onChange={() => onToggle(data)}
      />
    </div>
    <div>{data.title}</div>
    <div>{data.expired}</div>
    <div onClick={() => onClickEdit(data)}>edit</div>
  </div>
)

const TodoList= () => {
  const todoList = useTodoModel((state) => state.list);
  const navigate = useNavigate();
  const toggle = useCallback((todo: TodoItem) => todoActions.toggle(todo.id), []);
  const gotoEdit = useCallback((todo?: TodoItem) => navigate('/todo/edit', {state: todo }), [navigate]);

  if (isPending(todoList)) {
    return <div>is pending</div>
  }
  return (
    <div>
      <h3>My Todo List</h3>
      <section>
        {todoList.map(item => (
            <ListItem
              key={item.id}
              data={item}
              onToggle={toggle}
              onClickEdit={gotoEdit}
            />
          )
        )}
      </section>
      <div onClick={() => gotoEdit()}>
        add Todo
      </div>
    </div>
  )
}

export const TodoListPage = withPageHook(TodoList, {
  /** 除非是通过后退的方式进入到该页面，否则重新请求列表 */
  onEnter(action) {
    updateReducer({ todo: todoReducer });
    if (action === 'push' || getTodoState().list.length === 0) {
      todoActions.fetchList();
    }
    
  },
  /** 通过后退的方式离开页面时：清空缓存 */
  onLeave(action) {
    if (action === 'goBack') {
      todoActions.clear();
    }
  }
})