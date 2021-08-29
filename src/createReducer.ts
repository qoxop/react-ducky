import produce from "immer";
import { PayloadAction, CaseReducer } from "./typings";

export class Builder<S> {
  private ownKeys: Set<string>;
  default?: CaseReducer<S>;
  equal: {
      [k: string]: CaseReducer<S>;
  };
  match: {
      matcher: (action: PayloadAction) => boolean;
      reducer: CaseReducer<S>;
  }[];
  constructor(ownKeys:string[] = []) {
      this.ownKeys = new Set(ownKeys)
  }
  addCase(type: string,  reducer: CaseReducer<S>) {
      if (!this.ownKeys.has(type)) {
          if (this.equal[type]) {
            console.warn('builder.addCase -> add some type case~')
          }
          this.equal[type] = reducer;
      }
      return this;
  };
  addMatcher(matcher: (action: PayloadAction) => boolean, reducer: CaseReducer<S>) {
      this.match.push({ reducer, matcher });
      return this;
  };
  addDefaultCase(reducer: CaseReducer<S>) {
      this.default = reducer;
      return this;
  }
}

export function createReducer<State>(initialState: State, callback: (builder: Builder<State>) => void) {
  const builder = new Builder<State>();
  callback(builder);
  const reducer = (state = initialState, action: PayloadAction) => {
    const handler = builder.equal[action.type];
    let data:any = state;
    if (handler) {
        data = produce(data, (draft) => {
            const result = handler(draft, action);
            if (result) {
                return result;
            }
        })
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
    } else if (builder.default) {
        data = produce(data, (draft) => {
            const result = builder.default(draft, action);
            if (result) {
                return result;
            }
        });
    }
    return data as State;
  }
  return reducer;
}