import { Reducer } from 'redux';
import { ActionCreator, ICreateSliceOptions, ISlice, SliceCaseReducers, AtomStates, AtomActions } from './typings';
import { Builder, createReducerWithOpt } from "./createReducer";
import { createAction } from './createAction';
import { createPromiseChunk } from './createAsyncThunk';

const nameSet = new Set();

export function createSlice<
    State,
    CR extends SliceCaseReducers<State>,
    ASS extends AtomStates<State>,
>(options: ICreateSliceOptions<State, CR, ASS>): ISlice<State, CR, ASS> {
    const {
        name,
        reducers,
        extraReducers,
        persistence,
        persistenceKey,
        atomStates
    } = options;
    const storage = window[`${persistence}Storage`] || window.sessionStorage;
    const storageKey = persistenceKey || `REDUX-PERSISTENCE-${name}`;

    let actions: Record<string, ActionCreator<any>> = {};
    let reducer: Reducer<State>;
    let atomActions:AtomActions<ASS>;

    // 防止重复 key 值
    if (nameSet.has(name)) {
        throw new Error('createSlice name 参数重复～');
    }

    const rKeys = Object.keys(reducers);
    const builder = new Builder<State>();

    rKeys.forEach((rKey) => {
        const reduceCase = reducers[rKey];
        const actionType = `${name}/${rKey}`;
        if (typeof reduceCase === 'function') {
            builder.addCase(actionType, reduceCase);
            actions[rKey] = createAction(actionType, (payload: any, meta?: any, error?: any) => ({ 
                type: actionType,
                payload,
                ...(meta ? { meta } : {}),
                ...(error ? { error }: {})
            }));
        } else {
            builder.addCase(actionType, reduceCase.reducer);
            actions[rKey] = createAction(actionType, (...args:unknown[]) => ({
                ...reduceCase.prepare(...args),
                type: actionType,
            }));
        }
    });

    if (extraReducers) {
        if (typeof extraReducers === 'function') {
            extraReducers(builder)
        } else {
            Object.keys(extraReducers).forEach(eKey => {
                builder.addCase(eKey, extraReducers[eKey]);
            });
        }
    }

    if (atomStates) {
        atomActions = Object.keys(atomStates).reduce((pre, aKey) => {
            const actionType = `${name}/fetch_${aKey}`;
            pre[aKey] = createPromiseChunk(actionType, atomStates[aKey]);
            builder.addCase(actionType, (state, action: any) => {
                const { payload, meta: { isRejected } } = action;
                if (isRejected) {
                    state[aKey] = options.initialState[aKey];
                } else {
                    state[aKey] = payload;
                }
            });
            return pre;
        }, {} as any);
    }

    reducer = createReducerWithOpt(options.initialState, {
        builder,
        enhanceState: (state) => {
            if (persistence) {
                const stateJson = storage.getItem(storageKey);
                if (stateJson) {
                    state = JSON.parse(stateJson)
                }
            }
            return state;
        },
        onChange: (data) => {
            if (persistence) {
                storage.setItem(storageKey, JSON.stringify(data));
            }
        },
    })

    return {
        name,
        reducer,
        actions: actions as any,
        atomActions,
    }
}
