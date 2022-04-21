import { alwayResolve, outPromise, isPending, setPending } from "../../utils/async";
import { createPersistenceItem, createSessionItem } from '../../utils/storage';
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
} from '../../utils/is-type'

describe('类型判断函数函数',() => {
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
})
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
})
