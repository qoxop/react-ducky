import { createAction } from '../createAction';

describe('actionCreator check', () => {
  test(`createAction('test-createAction'), type === 'test-createAction'`, () => {
    const actionCreator = createAction('test-createAction');
    expect(`${actionCreator}`).toBe('test-createAction');
  });
  test(`createAction('test-createAction'), match({ type: 'test-createAction' })) === true`, () => {
    const actionCreator = createAction('test-createAction');
    expect(actionCreator.match({ type: 'test-createAction' })).toBe(true);
  });
  test(`createAction('test-createAction') + '' === 'test-createAction'`, () => {
    const actionCreator = createAction('test-createAction');
    expect(`${actionCreator}`).toBe('test-createAction');
  });
});

describe('action check', () => {
  test(`witdout prepareAction`, () => {
    const actionCreator = createAction('test-createAction');
    expect(actionCreator({a: 1, b: 2}, {pending: true}, {msg: '666'})).toEqual({
      type: 'test-createAction',
      payload: {a: 1, b: 2},
      meta: {pending: true},
      error: {msg: '666'}
    });
    expect(actionCreator({a: 1, b: 2}, {pending: true})).toEqual({
      type: 'test-createAction',
      payload: {a: 1, b: 2},
      meta: {pending: true}
    });
    expect(actionCreator({a: 1, b: 2})).toEqual({
      type: 'test-createAction',
      payload: {a: 1, b: 2},
    });
  });
  test(`witd prepareAction`, () => {
    const actionCreator = createAction('test-createAction', (p: string, m: any) => {
      return {payload: 'name=' + p, meta: m}
    });
    expect(actionCreator('tom', {pending: true})).toEqual({
      type: 'test-createAction',
      payload: 'name=tom',
      meta: {pending: true}
    });
  });
})
