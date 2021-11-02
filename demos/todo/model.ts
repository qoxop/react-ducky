import { createModel, PayloadAction } from "react-ducky";

export namespace TodoList {
    export type TodoItem = { id: string; finished: boolean; text: string; }
    export type FilterType = 'all'|'unfinished'|'finished';
    export interface State {
        todos: TodoItem[],
        filter: FilterType,
    }
}

const initialState:TodoList.State = { 
    todos: [],
    filter: 'all',
}

const { actions, reducer, getState, useModel, name } =  createModel({
    name: "todo",
    initialState,
    reducers: {
        /**
         * 添加一个待办
         */
        addTodo(state, action: PayloadAction<TodoList.TodoItem>) {
            const { payload } = action;
            state.todos.push(payload);
        },
        /**
         * 转换一个待办的完成状态
         */
        toggleTodo(state, action: PayloadAction<string>) {
            const { payload } = action;
            const curTode = state.todos.find((todo) => todo.id === payload);
            if (curTode) {
                curTode.finished = !curTode.finished;
            }
        },
        /**
         * 删除一个待办
         */
        delTodo(state, action: PayloadAction<string>) {
            const { payload } = action;
            state.todos = state.todos.filter(todo => todo.id !== payload);
        },
        /**
         * 修改代表列表的筛选条件
         */
        setFilter(state, action: PayloadAction<TodoList.FilterType>) {
            state.filter = action.payload;
        }
    },
    /**
     * 使用 localstrage 作数据缓存
     */
    persistence: 'local',
});

export {
    actions,
    reducer,
    getState,
    useModel,
    name
}