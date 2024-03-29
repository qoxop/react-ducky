import React from 'react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { initStore } from '../src/store';
import { ReduxProvider } from '../src/context';
import { createModel } from '../src/create-model';
import { ExtendAction, PayloadAction } from '../typings';
import {
  isPending,
  alwayResolve,
  createPersistenceItem
} from '../src/utils';


/**
 * 延迟函数
 * @param ms
 * @param data 
 * @param error 
 * @returns 
 */
const delay = <T = any>(
  ms: number,
  data: T = null as any,
  error: any = null
) => (
  new Promise<T>((resolve, reject) => setTimeout(() => {
    return error ? reject(error) : resolve(data);
  }, ms))
);
  
/**
 * 重复执行一个任务
 */
const repeat = (times: number, task: (_times: number) => void) => {
  for (let i = 1; i <= times; i++) {
    task(i)
  }
}

/**
 * 重复执行一个异步任务
 */
const repeatAsync = async (times: number, task: (_times: number) => Promise<any>) => {
  for (let i = 1; i <= times; i++) {
    await task(i);
  }
}


let redux: any = null;
beforeAll(() => {
  redux = initStore<any>({});
});

describe('createModel 基本用法', () => {
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
      reset: () => {
        return { count: 0 }
      }
    }
  });

  beforeEach(() => {
    redux.updateReducer({ count: model.reducer }, true);
    model.actions.reset();
  });

  test('测试 reducer 方法', () => {
    expect(typeof model.reducer).toBe('function');
    const actionPrefix = 'count'.toUpperCase();
    expect(model.reducer({ count: 1 }, { type: `${actionPrefix}/add`, payload: 1 })).toEqual({ count: 2 });
    expect(model.reducer({ count: 1 }, { type: `${actionPrefix}/minus`, count: 1 })).toEqual({ count: 0 });
    expect(model.reducer({ count: 1 }, { type: `${actionPrefix}/reset` })).toEqual({ count: 0 });
  });

  test('测试 actions 对象 ', () => {
    model.actions.add(1);
    expect(redux.store.getState().count.count).toBe(1);
    model.actions.minus({count: 10});
    expect(redux.store.getState().count.count).toBe(-9);
    model.actions.reset();
    expect(redux.store.getState().count.count).toBe(0);
  });

  test('测试 getState 方法', () => {
    expect(model.getState()).toBe(redux.store.getState().count)
  });

  test('测试 useModel 方法', async () => {
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

describe('createModel 异步用法', () => {
  const nArray = (n: number)=> 'n'.repeat(n).split('');
  const model = createModel({
    initialState: {
      list: [] as string[],
      map: { v: 0 },
      number: 0,
      string: 'bar',
      bool: false,
      error: null as any,
    },
    fetch: {
      list: (n: number) => delay(1, nArray(n)),
      map: (v: number) => delay(1, { v }),
      error: () => delay(1, null, new Error('error')),
      number: () => delay(1, 1),
      string: () => delay(1, 'foo'),
      bool: () => delay(1, true),
    },
    reducers: {
      reset(state) {
        state.list = [];
        state.map = { v: 0 };
        state.number = 0;
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
      // dispatch async action
      const waitForDone =  model.fetch.list(n);
      expect(isPending(model.getState().list)).toBe(true);
      expect(model.getState().list.length).toBe(n - 1);
      expect(model.getState().list.every(n => n === 'n')).toBe(true);
      expect(model.getState().list.map(n => n)).toEqual(nArray(n - 1));
      expect(model.getState().list.slice()).toEqual(nArray(n - 1));
      await waitForDone;
      expect(isPending(model.getState().list)).toBe(false);
      expect(model.getState().list.length).toBe(n);
      expect(model.getState().list).toEqual(nArray(n));
    })
  });
  test('fetch map', async () => {
    repeatAsync(5, async (v) => {
      // dispatch async action
      const waitForDone =  model.fetch.map(v);
      expect(isPending(model.getState().map)).toBe(true);
      expect(model.getState().map.v).toBe(v - 1);
      await waitForDone;
      expect(isPending(model.getState().map)).toBe(false);
      expect(model.getState().map.v).toBe(v);
    });
  });
  test('fetch boolean', async () => {
    const waitForDone = model.fetch.bool();
    /** check pending */
    expect(isPending(model.getState().bool)).toBe(true);
    /** ref value */
    expect(model.getState().bool.valueOf()).toBe(false);
    expect(+model.getState().bool).toBe(0);
  
    const [data, _] = await alwayResolve(waitForDone);
    /** check pending */
    expect(isPending(model.getState().bool)).toBe(false);
    /** simple value */
    expect(data).toBe(true);
    expect(model.getState().bool).toBe(data);
  });

  test('fetch number', async () => {
    const waitForDone = model.fetch.number();
    /** check pending */
    expect(isPending(model.getState().number)).toBe(true);
    /** ref value */
    expect(model.getState().number.valueOf()).toBe(0);
    expect(model.getState().number + 11).toBe(11);

    const [data, _] = await alwayResolve(waitForDone);
    /** check pending */
    expect(isPending(model.getState().number)).toBe(false);
    /** simple value */
    expect(data).toBe(1);
    expect(model.getState().number).toBe(data);
  });
  test('fetch string', async () => {
    const waitForDone = model.fetch.string();
    /** check pending */
    expect(isPending(model.getState().string)).toBe(true);
    /** ref value */
    expect(model.getState().string.valueOf()).toBe('bar');
    expect(`test-${model.getState().string}`).toBe('test-bar');

    const [data, _] = await alwayResolve(waitForDone);
    /** check pending */
    expect(isPending(model.getState().string)).toBe(false);
    /** simple value */
    expect(data).toBe('foo');
    expect(model.getState().string).toBe(data);
  });

  test('fetch error', async () => {
      // dispatch async action
      const waitForDone = model.fetch.error();
      /** check pending */
      expect(isPending(model.getState().error)).toBe(true);
      /** ref value */
      expect(model.getState().error.valueOf()).toBe(null);

      const [_, error] = await alwayResolve(waitForDone);
      /** check pending */
      expect(isPending(model.getState().error)).toBe(false);
      expect(error).toEqual(new Error('error'));
      /** ref value */
      expect(model.getState().error.error).toBe(error);
      expect(model.getState().error.valueOf()).toBe(null);
  });
});

describe('createModel 使用缓存数据', () => {
  const initModel = (initialState = { x: 0, y: 1 } as any, getStore = () => redux.store, cacheVersion?: string) => createModel({
    initialState,
    statePaths: ['persistence'],
    reducers: {
      update(state, action:PayloadAction<{x: number, y: number}>) {
        state.x = action.payload.x;
        state.y = action.payload.y;
      }
    },
    cacheKey: 'persistence-test',
    cacheStorage: 'local',
    cacheVersion
  }, getStore);
  const model = initModel({x: 0, y: 1});
  const storage = createPersistenceItem(localStorage, 'persistence-test');

  /** 首次使用 */
  test('update data', () => {
    redux.updateReducer({ persistence: model.reducer }, true);
    model.actions.update({ x: 2, y: 3 });
    expect(storage.get()).toEqual({ x: 2, y: 3 })
    expect(model.getState()).toEqual({ x: 2, y: 3 });
  });

  /** 二次使用 */
  test('use localStorage to init model state', () => {
    expect(storage.get()).toEqual({ x: 2, y: 3 })
    const newModel: ReturnType<typeof initModel> = initModel({x: 0, y: 1}, () => newRedux.store); 
    const newRedux = initStore<any>({reducerRecord: { persistence: newModel.reducer }});
    expect(newModel.getState()).toEqual({ x: 2, y: 3 })
  });

  /** 初始值结构发生变化，缓存不适用 */
  test('change initState\'s data struct', () => {
    expect(storage.get()).toEqual({ x: 2, y: 3 })
    const newModel: ReturnType<typeof initModel> = initModel({ x: 0, y: 1, z: 2 }, () => newRedux.store); 
    const newRedux = initStore<any>({ reducerRecord: { persistence: newModel.reducer } });
    expect(newModel.getState()).toEqual({ x: 0, y: 1, z: 2 })
    newModel.actions.update({ x: 2, y: 2 })
  });

  /** 初始值结构发生变化，缓存版本发生变化, 缓存不适用 */
  test('update cacheVersion', () => {
    expect(storage.get()).toEqual({ x: 2, y: 2, z: 2 });
    const newModel: ReturnType<typeof initModel> = initModel({ x: 0, y: 1, z: 2 }, () => newRedux.store, 'v2'); 
    const newRedux = initStore<any>({reducerRecord: { persistence: newModel.reducer }});
    expect(newModel.getState()).toEqual({ x: 0, y: 1, z: 2 })
  });
});
