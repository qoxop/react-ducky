import produce from "immer";
import {
    PayloadAction,
    CaseReducer
} from "../typings";

export class Builder<S> {
    default?: CaseReducer<S> ;
    equal: {
        [k: string]: CaseReducer<S> ;
    };
    match: Array<{
        matcher: (action: PayloadAction) => boolean;
        reducer: CaseReducer<S> ;
    }>;
    constructor() {
        this.equal = {};
        this.match = [];
    }
    addCase(type: string, reducer: CaseReducer<S> ) {
        if (this.equal[type]) {
            console.warn('builder.addCase -> add some type case~');
        } else {
            this.equal[type] = reducer;
        }
        return this;
    };
    addMatcher(matcher: (action: PayloadAction) => boolean, reducer: CaseReducer < S > ) {
        this.match.push({
            reducer,
            matcher
        });
        return this;
    };
    addDefaultCase(reducer: CaseReducer<S>) {
        this.default = reducer;
        return this;
    }
}

export function createReducerWithOpt<State>(
    initialState: State,
    options: {
        callback?: (builder: Builder<State>) => void,
        builder?: Builder<State>,
        enhanceState?: (state:State) => State,
        onChange?: (data: State) => void;
    }
) {
    let {
        callback,
        builder,
        enhanceState,
        onChange,
    } = options;
    if (enhanceState) {
        initialState = enhanceState(initialState)
    }
    if (!builder) {
        builder = new Builder<State>();
    }
    if (callback) {
        callback(builder);
    }
    const reducer = (state = initialState, action: PayloadAction) => {
        const handler = builder.equal[action.type];
        let data: any = state;
        let hasChange = false;
        if (handler) {
            data = produce(data, (draft) => {
                const result = handler(draft, action);
                if (result) {
                    return result;
                }
            });
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
        if (onChange && hasChange) {
            onChange(data);
        }
        return data as State;
    }
    return reducer;
}

export const createReducer = <State>(
    initialState: State,
    callback: (builder: Builder<State>) => void
) => createReducerWithOpt<State>(initialState, { callback });