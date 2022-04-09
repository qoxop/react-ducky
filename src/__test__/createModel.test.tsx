import React from 'react'
import { delay, repeat, repeatAsync } from './helper'
import { isPending } from '../utils/async'
import createModel from '../redux/create-model'
import { initReduxStore } from '../redux/store'
import { ExtendAction, PayloadAction } from '../typings'
import { renderHook } from '@testing-library/react-hooks/dom'
import { ReduxProvider } from '../hooks/redux-hooks'

let redux: any = null;
beforeAll(() => {
  redux = initReduxStore<any>({}, {});
});
describe('createModel 的基本用法', () => {
  const model = createModel({
    initialState: {
      count: 0,
    },
    statePaths: ['count'],
    reducers: {
      add(state, action: PayloadAction<number>) {
        state.count += action.payload;
      },
      minus(state, action: ExtendAction<{ count: number }>) {
        state.count -= action.count;
      },
      reset: (state) => {
        state.count = 0;
      }
    }
  });

  beforeEach(() => {
    redux.updateReducer({ count: model.reducer }, true);
    model.actions.reset();
  });

  test('生成 reducer 函数', () => {
    expect(typeof model.reducer).toBe('function');
  });

  test('生成 actions 对象 ', () => {
    model.actions.add(1);
    expect(redux.store.getState().count.count).toBe(1);
    model.actions.minus({count: 10});
    expect(redux.store.getState().count.count).toBe(-9);
    model.actions.reset();
    expect(redux.store.getState().count.count).toBe(0);
  });

  test('生成 getState 方法', () => {
    expect(model.getState()).toBe(redux.store.getState().count)
  });

  test('生成 useModel 方法', async () => {
    const getStoreCount = () => model.getState().count;
    const wrapper = ({ children }) => (<ReduxProvider store={redux.store}>{children}</ReduxProvider>)
    const { result, waitForNextUpdate } = renderHook(() => model.useModel((state) => state.count), { wrapper })
    // 多次同步更新，只会触发一次渲染
    expect(result.current).toBe(0);
    repeat(5, times => {
      model.actions.add(1)
      expect(getStoreCount()).toBe(times)
      expect(result.current).toBe(0);
    });
    await waitForNextUpdate();
    expect(result.current).toBe(5);
  });
});

describe('createModel 的异步用法', () => {
  const nArray = (n: number)=> 'n'.repeat(n).split('');
  const model = createModel({
    initialState: {
      list: [] as string[],
      map: { v: 0 },
    },
    fetch: {
      list: (n: number) => delay(1, nArray(n)),
      map: (v: number) => delay(1, {v}),
    },
    reducers: {
      reset(state) {
        state.list = [];
        state.map = { v: 0 };
      }
    },
    statePaths: ['todo'],
  });
  beforeEach(() => {
    redux.updateReducer({ todo: model.reducer }, true);
    model.actions.reset();
  });
  test('fetch list', async () => {
    repeatAsync(5, async (n) => {
      const waitFordone =  model.fetch.list(n);
      expect(isPending(model.getState().list)).toBe(true);
      expect(model.getState().list.length).toBe(n - 1);
      expect(model.getState().list.every(n => n === 'n')).toBe(true);
      expect(model.getState().list.map(n => n)).toEqual(nArray(n - 1));
      expect(model.getState().list.slice()).toEqual(nArray(n - 1));
      await waitFordone;
      expect(isPending(model.getState().list)).toBe(false);
      expect(model.getState().list.length).toBe(n);
      expect(model.getState().list).toEqual(nArray(n));
    })
  });
  test('fetch map', async () => {
    repeatAsync(5, async (v) => {
      const waitFordone =  model.fetch.map(v);
      expect(isPending(model.getState().map)).toBe(true);
      expect(model.getState().map.v).toBe(v - 1);
      await waitFordone;
      expect(isPending(model.getState().map)).toBe(false);
      expect(model.getState().map.v).toBe(v);
    });
  });
})