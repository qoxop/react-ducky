export const delay = <T = any>(ms: number, data: T = null, error: any = null) =>
  new Promise<T>((resolve, reject) => setTimeout(() => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  }, ms));

