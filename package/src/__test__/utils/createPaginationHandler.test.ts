import { createPaginationHandler, alwayResolve } from "../../utils/async";
import { delay } from "../helper";

const loadData = async ({ pageIndex, pageSize, mValue, delay: d = 10 }: { pageIndex: number, pageSize: number, mValue: string, delay?: number }) => {
  await delay(d)
  return { list: (`${mValue}`).repeat(pageSize).split(''), total: 100, }
};

describe('测试分页函数 - createPaginationHandler', () => {
  let DATA: {
    list: any[],
    total: number,
    page_index: number,
    loading_page: false|number,
  };
  let finallyFetch: typeof loadData;
  const afterFn = jest.fn();
  const beforeFn = jest.fn();
  
  beforeEach(() => {
    DATA = {
      list: [],
      total: 0,
      page_index: 0,
      loading_page: false as false|number,
    }
    finallyFetch = createPaginationHandler({
      fetcher: loadData,
      isReset: ({ pageIndex }) => pageIndex === 1,
      after: ([data, [{ pageIndex }]]) => {
        if (pageIndex === 1) {
          DATA.list = data.list;
          DATA.total = data.total;
        } else {
          DATA.list = DATA.list.concat(data.list);
        }
        DATA.page_index = pageIndex;
        DATA.loading_page = false;
        afterFn();
      },
      before: ([{ pageIndex }]) => {
        DATA.loading_page = pageIndex;
        beforeFn();
      }
    });
    afterFn.mockClear();
    beforeFn.mockClear();
  });

  test('多个 reset 同时发起, 无论响应快慢, 保证最后一个生效', async () => {
    // 延后返回 = a
    const show_result = alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'a', delay: 20 }));
    await delay(2);
    // 提前返回 = b
    const fast_result = alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'b', delay: 3 }));
    await Promise.all([show_result, fast_result]);
    // last result = b
    expect(DATA.list).toEqual('b'.repeat(5).split(''));
  });

  test('reset 过程中不允许执行 load more 操作', async () => {
    const reset_result = alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'a' }));
    expect(DATA.loading_page).toBe(1);
    const load_more_result = alwayResolve(finallyFetch({ pageIndex: 2, pageSize: 5, mValue: 'a' }));
    // load_more_result fail
    expect(DATA.loading_page).toBe(1);
    const [{ list }, reset_err] = await reset_result;
    // reset_result success
    expect(reset_err).toBe(null);
    expect(list).toEqual('a'.repeat(5).split(''));

    // load more fail
    const [result, load_err] = await load_more_result;
    expect(result).toBe(null);
    expect(load_err).toEqual(new Error('invalid request ~'));
  });

  test('第一个操作只能是 reset', async () => {
    // load more request
    const [data, err] = await alwayResolve(finallyFetch({ pageIndex: 2, pageSize: 5, mValue: 'a' }));
    expect(err).toEqual(new Error('invalid request ~'));
    expect(data).toBe(null);
  });

  test('load more 操作可以被 reset 取消', async () => {
    // reset request
    await alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'a' }));
    // load more request
    const loadMorePs = alwayResolve(finallyFetch({ pageIndex: 2, pageSize: 5, mValue: 'a' }));
    // reset request
    const resetPs = alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'b' }));
    const [load_more_res, load_err] = await loadMorePs;
    const [{ list }, reset_err] = await resetPs;
    expect(load_err).not.toBe(null);
    expect(reset_err).toBe(null);
    expect(load_more_res).toBe(null);
    expect(list).toEqual('b'.repeat(5).split(''));
    expect(DATA.list).toEqual('b'.repeat(5).split(''));
  });

  test('load more 操作不可以重复发起', async () => {
    await alwayResolve(finallyFetch({ pageIndex: 1, pageSize: 5, mValue: 'a' }));
    const page_2_result = alwayResolve(finallyFetch({ pageIndex: 2, pageSize: 5, mValue: 'a' }));
    const page_3_result = alwayResolve(finallyFetch({ pageIndex: 3, pageSize: 5, mValue: 'b' }));
    // response for page 2
    expect(DATA.loading_page).toBe(2);
    await Promise.all([page_2_result, page_3_result]);
    // loaded two pages
    expect(DATA.page_index).toBe(2);
    expect(DATA.list.length).toBe(10);
  });
  test('传入错误的fetcher', async () => {
    const fn = createPaginationHandler({
      fetcher: (index: number) => void 0,
      isReset: (index) => index === 1,
    });
    const [ data, error ] = await alwayResolve(fn(1));
    expect(data).toBe(null);
    expect(error).toEqual(new Error('invalid action ~'))
  });
  test('fetcher 请求失败', async () => {
    const fn = createPaginationHandler({
      fetcher: (index: number) => Promise.reject(new Error('response error')),
      isReset: (index) => index === 1,
    });
    const [ data, error ] = await alwayResolve(fn(1));
    expect(data).toBe(null);
    expect(error).toEqual(new Error('response error'))
  });
})