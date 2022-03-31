import { createFetchHandler, AlwayResolve } from "../utils/async";

describe('测试加载函数 - createFetchHandler', () => {
  test('多个重复相同请求只响应最后一个', async () => {
    
  });
  test('一个请求处理多分数据源', async () => {
    
  });
  // 处理单个数据
  test('createFetchHandler - handle single data', async () => {
    const fetchAfter = jest.fn();
    let times = 5;
    const finallyFetch = createFetchHandler({
      fetcher: (...args: any[]) => (new Promise((resolve) => {
        setTimeout(() => resolve(args[0]), (--times) * 2);
      })),
      after: fetchAfter
    });
    
    const dataArr = await Promise.all([
      AlwayResolve(finallyFetch(1)),
      AlwayResolve(finallyFetch(2)),
      AlwayResolve(finallyFetch(3)),
      AlwayResolve(finallyFetch(4)),
    ]);
    // fail case
    expect(dataArr[0][1]).toEqual(new Error('invalid response ~'));
    // success one 
    expect(dataArr[3][0]).toBe(4);
    expect(dataArr[3][1]).toBe(null);
    expect(fetchAfter.mock.calls.length).toBe(1);
    expect(fetchAfter.mock.calls[0][0][0]).toBe(4);
  });
  // 处理多个数据
  test('createFetchHandler - handle multi data', async () => {
    const fetchAfter = jest.fn();
    let times = 10;
    const finallyFetch = createFetchHandler({
      fetcher: (type: string, query: string) => (new Promise<string>((resolve) => {
        setTimeout(() => resolve(query), (--times) * 2);
      })),
      after: fetchAfter,
      identifier: (type: string) => type,
    });
    
    const dataArr = await Promise.all([
      AlwayResolve(finallyFetch('fetch-bar', '1')),
      AlwayResolve(finallyFetch('fetch-bar', '2')),
      AlwayResolve(finallyFetch('fetch-bar', '3')),
      AlwayResolve(finallyFetch('fetch-foo', '4')),
      AlwayResolve(finallyFetch('fetch-foo', '5')),
      AlwayResolve(finallyFetch('fetch-foo', '6')),
    ]);
    // fail case
    expect(dataArr[0][1]).toEqual(new Error('invalid response ~'));
    expect(dataArr[3][1]).toEqual(new Error('invalid response ~'));
    // success one 
    expect(dataArr[2][0]).toBe('3');
    expect(dataArr[2][1]).toBe(null);
    expect(dataArr[5][0]).toBe('6');
    expect(dataArr[5][1]).toBe(null);
    expect(fetchAfter.mock.calls.length).toBe(2);
  });
})
