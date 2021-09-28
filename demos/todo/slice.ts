import { AtomObject, createSlice, PayloadAction } from "rtk-like";
import { TodoItem, FilterType } from "../typings";


export interface InitialState {
    todos: { [k: string]: TodoItem },
    filter: FilterType,
    dddd: AtomObject<number>
}

const initialState:InitialState = { 
    todos: {},
    filter: 'all',
    dddd: {value: 0, status: 'fulfilled'},
}
const { actions, atomActions, reducer, useSelector } = createSlice({
    name: "todo",
    initialState,
    atomFetchers: {
        dddd: () => Promise.resolve(9)
    },
    reducers: {
        addTodo(state, action: PayloadAction<TodoItem>) {
            const { payload } = action;
            state.todos[payload.id] = payload;
        },
        toggleTodo(state, action: PayloadAction<string>) {
            const { payload } = action;
            const finished = state.todos[payload].finished;
            state.todos[payload].finished = !finished;
        },
        delTodo(state, action: PayloadAction<string>) {
            const { payload } = action;
            delete state.todos[payload];
        },
        setFilter(state, action: PayloadAction<FilterType>) {
            state.filter = action.payload;
        }
    },
    persistence: 'session',
});
export {
    actions,
    atomActions,
    
    reducer
}