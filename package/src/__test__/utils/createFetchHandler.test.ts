import { createFetchHandler, alwayResolve as AR} from "../../utils/async";
import { INVALID_RESPONSE_ERROR } from "../../utils/constants";
import { delay } from "../helper";

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
      identifier: ({ identifier }) => identifier,
    });
    afterFn.mockClear();
    beforeFn.mockClear();
  });
  test('多个重复相同请求只响应最后一个', async () => {
    const result_1 = AR(finallyRequest({ mValue: 'A', delay: 30 }));
    await delay(1)
    const result_2 = AR(finallyRequest({ mValue: 'B', delay: 20 }));
    await delay(1)
    const result_3 = AR(finallyRequest({ mValue: 'C', delay: 10 }));
    await expect(result_1).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_2).resolves.toEqual([null, new Error(INVALID_RESPONSE_ERROR)]);
    await expect(result_3).resolves.toEqual(['C', null]);
    expect(DATA['def']).toBe('C')    
  });
  test('一个请求处理多分数据源', async () => {
    const result_x1 = AR(finallyRequest({ mValue: 'A', identifier: 'x', delay: 30 }));
    const result_y1 = AR(finallyRequest({ mValue: 'A', identifier: 'y',  delay: 30 }));
    await delay(1)
    const result_x2 = AR(finallyRequest({ mValue: 'B', identifier: 'x',  delay: 20 }));
    const result_y2 = AR(finallyRequest({ mValue: 'B', identifier: 'y',  delay: 20 }));
    await delay(1)
    const result_x3 = AR(finallyRequest({ mValue: 'C', identifier: 'x',  delay: 10 }));
    const result_y3 = AR(finallyRequest({ mValue: 'C', identifier: 'y',  delay: 10 }));

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
