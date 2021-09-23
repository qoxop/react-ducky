import { Dispatch } from "redux";
import { AsyncThunk } from "./typings";

export function createAsyncThunk<T = any, Ags extends Array<unknown> = unknown[]>(
  type: string,
  asyncTask: (...args: Ags) => Promise<T>
): AsyncThunk<T, Ags> {
    const pending = `${type}/pending`;
    const fulfilled = `${type}/fulfilled`;
    const rejected = `${type}/rejected`;
    function asyncThunk(...args: Ags) {
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
  return asyncThunk as AsyncThunk<T, Ags>;
}

export function createPromiseChunk<T = any, Ags extends Array<unknown> = unknown[]>(
  type: string,
  toPromise: (...args: Ags) => Promise<T>
) {
  let count = 0;
  function promiseChunk(...args: Ags) {
    return (dispatch: Dispatch) => {
      const promise = toPromise(...args);
      const innerCount = count = (count + 1);
      dispatch({ type, payload: promise, meta: { isPending: true }})
      promise.then((response) => {
        if (innerCount === count) {
          dispatch({ type, payload: response, meta: { isPending: false, isFulfilled: true }});
        }
      }).catch(error => {
        if (innerCount === count) {
          dispatch({ type, payload: error, meta: { isPending: false, isRejected: true }})
        }
      });
      return promise;
    }
  }
  promiseChunk.toString = () => type;
  return promiseChunk;
}