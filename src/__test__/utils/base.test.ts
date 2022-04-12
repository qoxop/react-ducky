import { AlwayResolve, OutPromise, isPending, setPending } from "../../utils/async";
import { createPersistenceItem, createSessionItem } from '../../utils/storage';

describe('基础异步函数', () => {
  test('OutPromise', async () => {
    const dataResolve = OutPromise();
    expect(dataResolve.promise).toBeInstanceOf(Promise);
    expect(dataResolve.resolve).toBeInstanceOf(Function);
    expect(dataResolve.reject).toBeInstanceOf(Function);
    setTimeout(() => dataResolve.resolve('success'), 1);
    setTimeout(() => dataResolve.reject('fail'), 3);
    await expect(dataResolve.promise).resolves.toBe('success');
    const dataReject = OutPromise();
    setTimeout(() => dataReject.reject('fail'), 1);
    setTimeout(() => dataReject.resolve('success'), 3);
    await expect(dataReject.promise).rejects.toBe('fail');
  });
  test('AlwayResolve', async () => {
    const data = AlwayResolve(Promise.resolve('success'));
    await expect(data).resolves.toEqual(['success', null]);
    const data2 = AlwayResolve(Promise.reject('fail'));
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
})
