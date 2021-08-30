import { ActionCreator, AnyAction, AnyFunction } from './typings';

interface _ActionCreator<P = any> {
  type: string;
  match: (action: AnyAction) => boolean;
  (...args: any[]):ReturnType<ActionCreator<P>>
} 

export function createAction<P = any>(type: string, prepareAction?: AnyFunction): _ActionCreator<P> {
  function actionCreator(...args: any[]) {
    if (prepareAction) {
      let prepared = prepareAction(...args)
      if (!prepared) {
        throw new Error('prepareAction did not return an object')
      }

      return {
        type,
        payload: prepared.payload,
        ...('meta' in prepared && { meta: prepared.meta }),
        ...('error' in prepared && { error: prepared.error }),
      }
    }
    return {
      type,
      payload: args[0],
      ...(args[1] ? {meta: args[1]} : {}),
      ...(args[2] ? {error: args[2]} : {}),
    }
  }

  actionCreator.toString = () => `${type}`;

  actionCreator.type = `${type}`;

  actionCreator.match = (action: AnyAction) => (action.type === type);

  return actionCreator as unknown as _ActionCreator<P>
}