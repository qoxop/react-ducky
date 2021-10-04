import { Dispatch } from "redux";
import { AsyncThunk, PromiseFn } from "./typings";

export function createAsyncThunk<T = any, Args extends Array<unknown> = unknown[]>(
  type: string,
  asyncTask: PromiseFn<T, Args>
): AsyncThunk<T, Args> {
    const pending = `${type}/pending`;
    const fulfilled = `${type}/fulfilled`;
    const rejected = `${type}/rejected`;
    function asyncThunk(...args: Args) {
      return async (dispatch: Dispatch) => {
        dispatch({ type: pending, meta: { isPending: true }});
        try {
          const result = await asyncTask(...args);
          const action = { type: fulfilled, payload: result, meta: { isPending: false } }
          dispatch(action);
          return result;
        } catch (error) {
          const action = { type: rejected, meta: { isPending: false, error } }
          dispatch(action);
          throw error
        }
      }
  }
  asyncThunk.pending = pending;
  asyncThunk.fulfilled = fulfilled;
  asyncThunk.rejected = rejected;
  return asyncThunk as AsyncThunk<T, Args>;
}

export function createAtomChunk<T = any, Ags extends Array<unknown> = unknown[]>(
  type: string,
  fetcher: PromiseFn<T, Ags>
) {
  let count = 0;
  return function atomChunk(...args: Ags) {
    return (dispatch: Dispatch) => {
      const promise = fetcher(...args);
      const innerCount = count = (count + 1);
      dispatch({ type, payload: { status: 'pending', isPending: true, error: null }});
      promise.then((response) => {
        if (innerCount === count) {
          dispatch({ type, payload: {
            status: 'fulfilled',
            value: response,
            error: null,
            isPending: false,
          }});
        }
      }).catch(error => {
        if (innerCount === count) {
          dispatch({ type, payload: {
            status: 'rejected',
            error,
            isPending: false,
          }});
        }
      });
      return promise;
    }
  }
}