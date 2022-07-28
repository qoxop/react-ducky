import {
  isMap,
  isSet,
  isArray,
  isDate,
  isFunction,
  isString,
  isSymbol,
  isObject,
  isPromise,
} from '../src/utils/is-type';

import {
  alwayResolve,
  outPromise,
  isPending,
  setPending,
  createPersistenceItem,
  createSessionItem,
  createFetchHandler,
  shallowEqual,
  uuid,
  isEmpty,
  getInit,
  setProperty,
  removeProperty,
} from "../src/utils";
import { INVALID_RESPONSE_ERROR } from '../src/utils/constants';


const delay = <T = any>(
  ms: number,
  data: T = null as any,
  error: any = null
) => (
  new Promise<T>((resolve, reject) => setTimeout(() => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  }, ms))
);
describe('工具方法',() => {
  test('shallowEqual', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual(0, 0)).toBe(true);
    expect(shallowEqual(true, true)).toBe(true);
    expect(shallowEqual(false, false)).toBe(true);
    expect(shallowEqual(false, undefined)).toBe(false);
    expect(shallowEqual(1, 0)).toBe(false);
    expect(shallowEqual(1, null)).toBe(false);
    expect(shallowEqual(1, '')).toBe(false);
    expect(shallowEqual(false, '')).toBe(false);
    expect(shallowEqual(true, false)).toBe(false);
    expect(shallowEqual({}, {})).toBe(true);
    expect(shallowEqual({}, [])).toBe(false);
    expect(shallowEqual({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
    expect(shallowEqual({a: 1.0, b: 2}, {b: 2, a: 1})).toBe(true);
    expect(shallowEqual({a: 1.0001, b: 2}, {b: 2, a: 1})).toBe(false);
    expect(shallowEqual({a: 1, b: 2}, {a: 1, b: 2, c: 3})).toBe(false);
  });
  test('uuid',() => {
    const idSet = new Set();
    for (let index = 0; index < 5000; index++) {
      const id = uuid();
      expect(idSet.has(id)).toBe(false);
      idSet.add(id);
    }
  });
  test('isEmpty', () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty(0)).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(false)).toBe(true);
    expect(isEmpty('')).toBe(true);
    expect(isEmpty(1)).toBe(false);
    expect(isEmpty('1')).toBe(false);
    expect(isEmpty({a: 1})).toBe(false);
    expect(isEmpty([1])).toBe(false);
  });
  test('getInit', () => {
    expect(getInit(9)).toBe(9);
    expect(getInit(() => 9)).toBe(9);
  });
  test('setProperty and removeProperty', () => {
    const Null = setProperty(null, 'value', 1);
    expect(Null.valueOf()).toBe(null);
    expect(Null.value).toBe(1);
    expect(removeProperty(Null, 'value')).toBe(null);
    // string
    const String = setProperty('str-', 'value', 1);
    expect(String.valueOf()).toBe('str-');
    expect(String + 'test').toBe('str-test');
    expect(String.value).toBe(1);
    expect(removeProperty(String, 'value')).toBe('str-');
    // number
    const Bool = setProperty(false, 'value', 1);
    expect(Bool.valueOf()).toBe(false);
    expect(Bool.value).toBe(1);
    expect(removeProperty(Bool, 'value')).toBe(false);
  });
  test('setPending', () => {
    const pValue = setPending(null, true);
    expect(isPending(pValue)).toBe(true);
    expect(isPending(setPending(pValue, false))).toBe(false);
  })
})

test('类型判断函数函数',() => {
  expect(isMap(new Map())).toBe(true);
  expect(isSet(new Set())).toBe(true);
  expect(isArray([])).toBe(true);
  expect(isArray({ length: 2 })).toBe(false);
  expect(isDate(new Date())).toBe(true);
  expect(isFunction(() => void 0)).toBe(true);
  expect(isString('')).toBe(true);
  expect(isSymbol(Symbol('symbol'))).toBe(true);
  expect(isObject({})).toBe(true);
  expect(isPromise(Promise.resolve())).toBe(true);
});

describe('基础异步函数', () => {
  test('outPromise', async () => {
    const dataResolve = outPromise();
    expect(dataResolve.promise).toBeInstanceOf(Promise);
    expect(dataResolve.resolve).toBeInstanceOf(Function);
    expect(dataResolve.reject).toBeInstanceOf(Function);
    setTimeout(() => dataResolve.resolve('success'), 1);
    setTimeout(() => dataResolve.reject('fail'), 3);
    await expect(dataResolve.promise).resolves.toBe('success');
    const dataReject = outPromise();
    setTimeout(() => dataReject.reject('fail'), 1);
    setTimeout(() => dataReject.resolve('success'), 3);
    await expect(dataReject.promise).rejects.toBe('fail');
  });
  test('alwayResolve', async () => {
    const data = alwayResolve(Promise.resolve('success'));
    await expect(data).resolves.toEqual(['success', null]);
    const data2 = alwayResolve(Promise.reject('fail'));
    await expect(data2).resolves.toEqual([null, 'fail']);
  });
  test('pending object', () => {
    expect(isPending(0)).toBe(false);
    expect(isPending({})).toBe(false);
    expect(isPending([])).toBe(false);
    expect(isPending('')).toBe(false);
    expect(isPending(null)).toBe(false);

    expect(isPending(setPending(0, true))).toBe(true);
    expect(isPending(setPending({}, true))).toBe(true);
    expect(isPending(setPending([], true))).toBe(true);
    expect(isPending(setPending('', true))).toBe(true);
    expect(isPending(setPending(null, true))).toBe(true);
  })
});

describe('基础存储函数', () => {
  beforeAll(() => {
    localStorage.clear();
  })
  test('createPersistenceItem', () => {
    const atom = createPersistenceItem<any>(localStorage, 'test-local', 'v1');

    // 空值
    expect(atom.get()).toBe(null);
    atom.set(null);
    expect(atom.get()).toBe(null);
    atom.set(undefined);
    expect(atom.get()).toBe(undefined);

    // string 、number
    atom.set(0);
    expect(atom.get()).toBe(0);
    atom.set('');
    expect(atom.get()).toBe('');
    atom.set('1');
    expect(atom.get()).toBe('1');

    // object
    atom.set([]);
    expect(atom.get()).toEqual([]);
    atom.set({});
    expect(atom.get()).toEqual({});
    atom.set({ v: 1 });
    expect(atom.get()).toEqual({ v: 1 });
  });
  test('createPersistenceItem', () => {
    const atom = createPersistenceItem<any>(localStorage, 'test-local', 'v1');
    expect(atom.get()).toEqual({ v: 1 });
  })
  test('createPersistenceItem', () => {
    const atom = createPersistenceItem<any>(localStorage, 'test-local', 'v2');
    expect(atom.get()).toBe(null);
  })
  test('createPersistenceItem error', () => {
    localStorage.setItem('test-local', 'no json obj string');
    const atom = createPersistenceItem<any>(localStorage, 'test-local', 'v2');
    localStorage.setItem('test-local', '');
    expect(atom.get()).toBe(null);
    localStorage.setItem('test-local', 'no json obj string');
    expect(atom.get()).toBe(null);
  })
  test('createSessionItem', () => {
    const atom = createSessionItem<any>('test-session');

    // 空值
    expect(atom.get()).toBe(null);
    atom.set(null);
    expect(atom.get()).toBe(null);
    atom.set(undefined);
    expect(atom.get()).toBe(undefined);

    // string 、number
    atom.set(0);
    expect(atom.get()).toBe(0);
    atom.set('');
    expect(atom.get()).toBe('');
    atom.set('1');
    expect(atom.get()).toBe('1');

    // object
    atom.set([]);
    expect(atom.get()).toEqual([]);
    atom.set({});
    expect(atom.get()).toEqual({});
    atom.set({ v: 1 });
    expect(atom.get()).toEqual({ v: 1 });
  });
  test('createSessionItem',() => {
    sessionStorage.setItem('test-session', 'no json obj string');
    const atom = createSessionItem<any>('test-session');
    expect(atom.get()).toBe(null);
  })
});

const request = async ({  mValue, delay: d = 10 }: { mValue: any, identifier?: string, delay?: number }) => {
  await delay(d)
  return mValue
};

describe('测试加载函数 - createFetchHandler', () => {
  let DATA = {};
  let finallyRequest = request;
  const afterFn = jest.fn();
  const beforeFn = jest.fn();
  beforeEach(() => {
    DATA = {};
    finallyRequest = createFetchHandler({
      fetcher: request,
      after: ([data, [{identifier}], error]) => {
        if (!error) {
          DATA[identifier || 'def'] = data;
        }
      },
      identifier: ({ identifier }) => identifier as string,
    });
    afterFn.mockClear();
    beforeFn.mockClear();
  });
  test('多个重复相同请求只响应最后一个', async () => {
    const result_1 = alwayResolve(finallyRequest({ mValue: 'A', delay: 30 }));
    await delay(1)
    const result_2 = alwayResolve(finallyRequest({ mValue: 'B', delay: 20 }));
    await delay(1)
    const result_3 = alwayResolve(finallyRequest({ mValue: 'C', delay: 10 }));
    await expect(result_1).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_2).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_3).resolves.toEqual(['C', null]);
    expect(DATA['def']).toBe('C')    
  });
  test('一个请求处理多分数据源', async () => {
    const result_x1 = alwayResolve(finallyRequest({ mValue: 'A', identifier: 'x', delay: 30 }));
    const result_y1 = alwayResolve(finallyRequest({ mValue: 'A', identifier: 'y',  delay: 30 }));
    await delay(1)
    const result_x2 = alwayResolve(finallyRequest({ mValue: 'B', identifier: 'x',  delay: 20 }));
    const result_y2 = alwayResolve(finallyRequest({ mValue: 'B', identifier: 'y',  delay: 20 }));
    await delay(1)
    const result_x3 = alwayResolve(finallyRequest({ mValue: 'C', identifier: 'x',  delay: 10 }));
    const result_y3 = alwayResolve(finallyRequest({ mValue: 'C', identifier: 'y',  delay: 10 }));

    await expect(result_x1).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_x2).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_x3).resolves.toEqual(['C', null]);
    expect(DATA['x']).toBe('C') 
    await expect(result_y1).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_y2).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_y3).resolves.toEqual(['C', null]);
    expect(DATA['y']).toBe('C') 
  });
})
