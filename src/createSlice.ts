import produce from 'immer';
import { ActionCreator, CaseReducer, ICreateSliceOptions, ISlice, PayloadAction, SliceCaseReducers } from './typings';
import { Builder } from "./createReducer";
import { createAction } from './createAction';

const nameSet = new Set();

export function createSlice<
    State,
    CR extends SliceCaseReducers<State>,
>(options: ICreateSliceOptions<State, CR>): ISlice<State, CR> {
    const { reducers, name, extraReducers, persistence, persistenceKey } = options;

    // 防止重复 key 值
    if (nameSet.has(name)) {
        throw new Error('createSlice name 参数重复～');
    }

    // 初始值，用于持久化数据的恢复
    let initState = options.initialState;
    let sKey = '';
    let storage: (typeof window.localStorage) = null;
    if (persistence) { // 进行持久化
        storage = persistence === 'local' ? window.localStorage : window.sessionStorage;
        sKey = persistenceKey;
        if (!sKey) {
            sKey = `REDUX-PERSISTENCE-${name}`;
        }
        const stateJson = storage.getItem(sKey);
        if (stateJson) {
            initState = JSON.parse(stateJson)
        }
    }
    const rKeys = Object.keys(reducers);
    const builder = extraReducers ? new Builder<State>(rKeys) : null;
    if (builder) {
        if (typeof extraReducers === 'function') {
            extraReducers(builder)
        } else {
            Object.keys(extraReducers).forEach(eKey => {
                builder.addCase(eKey, extraReducers[eKey]);
            })
        }
    }

    /** 动作处理 */
    const reduceCaseRecord:Record<string, CaseReducer<State>> = rKeys.reduce((pre, rKey) => {
        const reduceCase = reducers[rKey];
        const actionType = `${name}-${rKey}`
        if (typeof reduceCase === 'function') {
            pre[actionType] = reduceCase
        } else {
            pre[actionType] = reduceCase.reducer;
        }
        return pre;
    }, {} as any);

    /** 生成 actions */
    const actions: Record<string, ActionCreator<any>> = rKeys.reduce((pre, rKey) => {
        const reduceCase = reducers[rKey];
        const actionType = `${name}-${rKey}`
        if (typeof reduceCase === 'function') {
            pre[rKey] = createAction(actionType, (payload: any, meta?: any, error?: any) => ({ 
                type: actionType,
                payload,
                ...(meta ? { meta } : {}),
                ...(error ? { error }: {})
            }));
        } else {
            pre[rKey] = createAction(actionType, (...args:any[]) => ({
                ...reduceCase.prepare(...args),
                type: actionType,
            }));
        }
        return pre;
    }, {} as any);
    
    /** 生成 reducer函数 */
    const reducer = (state = initState, action: PayloadAction) => {
        const handler = reduceCaseRecord[action.type] || builder.equal[action.type];
        let data:any = state;
        let hasChange = false;
        if (handler) {
            data = produce(data, (draft) => {
                const result = handler(draft, action);
                if (result) {
                    return result;
                }
            })
            hasChange = true;
        } else if (builder.match.length) {
            data = produce(data, (draft) => {
                for (let m = 0; m < builder.match.length; m++) {
                    const mt = builder.match[m];
                    if (mt.matcher(action)) {
                        const result = mt.reducer(draft, action);
                        if (result) {
                            return result;
                        }
                    }
                }
            });
            hasChange = true;
        } else if (builder.default) {
            data = produce(data, (draft) => {
                const result = builder.default(draft, action);
                if (result) {
                    return result;
                }
            });
            hasChange = true;
        }
        // 判断是否需要进行持久化存储
        if (hasChange && sKey && storage && data) {
            storage.setItem(sKey, JSON.stringify(data))
        }
        return data as State;
    }

    return {
        name,
        reducer,
        actions: actions as any
    }
}
