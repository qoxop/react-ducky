import { createModel, PayloadAction } from 'react-ducky';
import { fetchMyTodo, updateMyTodo } from './service';
import { TodoItem } from './model.type';

const todoModel = createModel({
  statePaths: ['todo'],
  initialState: {
    list: [] as TodoItem[],
  },
  reducers: {
    toggle: (state, action: PayloadAction<string>) => {
      const index = state.list.findIndex(item => item.id === action.payload);
      if (index > -1) {
        state.list[index].finished = !state.list[index].finished;
      }
    },
    update: (state, action: PayloadAction<TodoItem>) => {
      const { payload: newTodo } = action;
      const index = state.list.findIndex(item => item.id === newTodo.id);
      if (index > -1) {
        state.list[index] = newTodo;
      } else {
        state.list.push(newTodo)
      }
    },
    del: (state, action:PayloadAction<string>) => {
      state.list = state.list.filter(item => item.id !== action.payload)
    },
    clear: (state) => {
      state.list = [];
    }
  },
  fetch: {
    list: () => fetchMyTodo()
  },
  cacheKey: 'my-todo-model',
  cacheStorage: 'session',
});

// rewrite actions 
export const todoActions = {
  ...todoModel.actions,
  update: async (item: TodoItem) => {
    const newItem = await updateMyTodo(item);
    todoModel.actions.update(newItem);
  },
  del: (id: string) => {
    // TODO delete service
    todoModel.actions.del(id);
  },
  fetchList: todoModel.fetch.list,
}

export const todoReducer = todoModel.reducer;
export const useTodoModel = todoModel.useModel;
export const getTodoState = todoModel.getState;