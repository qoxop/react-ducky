import coolImages from 'cool-images';

export const fetchImgs = (size: number = 10) => {
  return Promise.resolve(coolImages.many(300, 500, size));
}

export const delay = <T = any>(ms: number, data: T = null, error: any = null) =>
  new Promise<T>((resolve, reject) => setTimeout(() => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  }, ms));
