import produce from 'immer';
import { isFunction } from '../utils/is-type';
import { ACTION_TYPE_DUPLICATE_WARN } from '../utils/constants';
import {
  ReducerCase,
  ValidObj,
  AnyAction,
  FunctionLike,
} from '../typings';

/**
 * Reducer 构建器
 */
class Builder<S> {
  /**
   * 默认处理函数
   * @internal
   */
  default?: ReducerCase<S>;
  /**
   * 要求类型相等才执行的处理函数
   * @internal
   */
  equal: {
    [k: string]: ReducerCase<S> ;
  };
  /**
   * 要求类型匹配才执行的处理函数
   * @internal
   */
  match: Array<{
    matcher: FunctionLike<[AnyAction], boolean>;
    reducer: ReducerCase<S>;
  }>;

  constructor() {
    this.equal = {};
    this.match = [];
  }

  /**
   * 添加要求类型相等的处理函数
   * @param type string
   * @param reducer 处理函数
   * @returns Builder
   */
  addCase(type: string, reducer: ReducerCase<S>) {
    if (this.equal[type]) {
      console.warn(ACTION_TYPE_DUPLICATE_WARN);
    } else {
      this.equal[type] = reducer;
    }
    return this;
  }
  /**
   * 添加要求类型匹配的处理函数
   * @param type string
   * @param reducer 处理函数
   * @returns Builder
   */
  addMatcher(matcher: FunctionLike<[AnyAction], boolean>, reducer: ReducerCase < S >) {
    this.match.push({
      reducer,
      matcher,
    });
    return this;
  }
  /**
   * 设置默认处理函数
   * @param reducer
   * @returns Builder
   */
  addDefaultCase(reducer: ReducerCase<S>) {
    this.default = reducer;
    return this;
  }
}

function createReducerWithOpt<State>(
  initialState: State,
  options: {
    callback?: FunctionLike<[Builder<State>], void>,
    builder?: Builder<State>,
    enhanceState?: FunctionLike<[State], State>,
    onChange?: FunctionLike<[State], void>;
  } = {},
) {
  let { builder } = options;
  const { callback, enhanceState, onChange } = options;

  if (isFunction(enhanceState)) {
    initialState = enhanceState(initialState);
  }
  if (!builder) {
    builder = new Builder<State>();
  }
  if (isFunction(callback)) {
    callback(builder);
  }
  const reducer = (state:State, action: AnyAction) => {
    if (state === null || state === undefined) {
      state = initialState;
    }
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
    } else if (builder.match?.length) {
      const matches = builder.match.filter((m) => m.matcher(action));
      if (matches.length) {
        data = produce(data, (draft) => {
          let result = null;
          for (const match of matches) {
            result = match.reducer(result || draft, action);
          }
          if (result) {
            return result;
          }
        });
        hasChange = true;
      }
    } else if (isFunction(builder.default)) {
      data = produce(data, (draft) => {
        const result = builder.default(draft, action);
        if (result) {
          return result;
        }
      });
      hasChange = true;
    }
    if (isFunction(onChange) && hasChange) {
      onChange(data);
    }
    return data as State;
  };
  return reducer;
}

const createReducer = <State extends ValidObj>(
  initialState: State,
  callback: FunctionLike<[Builder<State>], void>,
) => createReducerWithOpt<State>(initialState, { callback });

export {
  Builder,
  createReducer,
  createReducerWithOpt,
};
