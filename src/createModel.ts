import { Reducer } from 'redux';
import { ActionCreator, CreateModelOptions, Model, ModelCaseReducers, AtomFetchers, AtomObject, PayloadAction, Selector } from './typings';
import { Builder, createReducerWithOpt } from "./createReducer";
import { createAction } from './createAction';
import { createAtomChunk } from './createAsyncThunk';
import { useGetAsyncState } from './hooks';

const nameSet = new Set();

export function createModel<
    State,
    MCR extends ModelCaseReducers<State>,
    AFS extends AtomFetchers<State>
>(options: CreateModelOptions<State, MCR, AFS>): Model<State, MCR, AFS, (typeof options)> {

    const {
        name,
        reducers,
        extraReducers,
        persistence,
        selector = (appState: any = {}) => appState[name],
        persistenceKey,
        initialState,
        // @ts-ignore
        atomFetchers
    } = options;

    // 防止重复 key 值
    if (nameSet.has(name)) {
        throw new Error('createSlice name 参数重复～');
    }

    const storage = window[`${persistence}Storage`] || window.sessionStorage;
    const storageKey = persistenceKey || `REDUX-PERSISTENCE-${name}`;

    let actions: Record<string, ActionCreator<any>> = {};
    let reducer: Reducer<State>;
    let atomActions: any;
    let subState = initialState;

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

    if (atomFetchers) {
        atomActions = Object.keys(atomFetchers).reduce((pre, aKey) => {
            const actionType = `${name}/fetch_${aKey}`;
            // action
            pre[aKey] = createAtomChunk(actionType, atomFetchers[aKey]);
            // reducer 
            builder.addCase(actionType, (state, action: PayloadAction<AtomObject>) => {
                const { payload } = action;
                state[aKey] = Object.assign({}, state[aKey], payload);
            });
            return pre;
        }, {});
    }

    reducer = createReducerWithOpt(initialState, {
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
            subState = data;
            if (persistence) {
                storage.setItem(storageKey, JSON.stringify(data));
            }
        },
    });
    function useModel<T = any>(
        subSelector: Selector<State, T> = (s => s as any),
        config: any = {}
    ) {
        if (!config.usePending) {
            config.isPending = () => false;
        }
        return useGetAsyncState((state) => subSelector(selector(state)), config)
    }
    return {
        name,
        reducer,
        actions,
        atomActions,
        useModel,
        getState: () => subState,
    } as unknown as Model<State, MCR, AFS, (typeof options)>;
}
