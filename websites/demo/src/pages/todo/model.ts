import { 
  createModel, 
  PayloadAction
} from 'react-ducky';
import { updateReducer } from 'src/provider';

export type TodoItem = {
  id: string,
  title: string;
  expired: string;
  finished: boolean;
}

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
    add: (state, action: PayloadAction<TodoItem>) => {
      state.list.unshift({
        ...action.payload,
        id: Mock.Random.guid(),
      });
    },
    update: (state, action: PayloadAction<TodoItem>) => {
      const { payload: newTodo } = action;
      const index = state.list.findIndex(item => item.id === newTodo.id);
      if (index > -1) {
        state.list[index] = newTodo;
      } else {
        state.list.unshift(newTodo)
      }
    },
    del: (state, action:PayloadAction<string>) => {
      state.list = state.list.filter(item => item.id !== action.payload)
    },
    clear: (state) => {
      state.list = [];
    }
  },
  cacheKey: 'my-todo-model',
  cacheStorage: 'local',
  cacheVersion: 'v1',
});

export const todoActions = todoModel.actions;
export const useTodoModel = todoModel.useModel;
export const getTodoState = todoModel.getState;

// connect to redux
updateReducer({ todo: todoModel.reducer });