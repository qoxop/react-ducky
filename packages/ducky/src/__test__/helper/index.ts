export const delay = <T = any>(ms: number, data: T = null, error: any = null) =>
  new Promise<T>((resolve, reject) => setTimeout(() => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  }, ms));

export const identity = <T>(data: T) => data;

/**
 * 重复执行一个任务
 */
export const repeat = (times: number, task: (_times: number) => void) => {
  for (let i = 1; i <= times; i++) {
    task(i)
  }
}

/**
 * 重复执行一个异步任务
 */
export const repeatAsync = async (times: number, task: (_times: number) => Promise<any>) => {
  for (let i = 1; i <= times; i++) {
    await task(i);
  }
}