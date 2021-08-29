import { AsyncThunk } from "./typings";

export function createAsyncThunk<T = any>(
  type: string,
  asyncTask: (...args: any[]) => Promise<T>
): AsyncThunk<T> {
    const pending = `${type}/pending`;
    const fulfilled = `${type}/fulfilled`;
    const rejected = `${type}/rejected`;
    function asyncThunk(...args: any[]) {
      return async (dispatch, getState: () => any) => {
        dispatch({ type: pending, meta: { isPending: true }});
        try {
          const result = await asyncTask(...args, getState);
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
  return asyncThunk as AsyncThunk<T>;
}