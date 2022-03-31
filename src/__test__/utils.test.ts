import { AlwayResolve, OutPromise } from "../utils/async";

describe('基础函数测试', () => {
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
})
