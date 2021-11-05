import { AnyAction, PayloadAction } from './typings';



interface ActionCreator<P = any, Args extends any[]  = any[]> {
  type: string;
  match: (action: AnyAction) => boolean;
  (...args: Args): PayloadAction<P>
} 
type PrepareAction<P, Args extends any[]> = (...args: Args) => Omit<PayloadAction<P>, 'type'>

export function createAction<P = unknown, Args extends any[] = any[], Prepare extends PrepareAction<P, Args> = any>(
  type: string,
  prepareAction?: Prepare
) {
  function actionCreator(...args: Args) {
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
  type PayloadType = [typeof prepareAction] extends [undefined] ? P : ReturnType<typeof prepareAction>['payload'];
  type Params = [typeof prepareAction] extends [undefined] ? unknown[] : Parameters<typeof prepareAction>;
  return actionCreator as unknown as ActionCreator<PayloadType, Params>
}