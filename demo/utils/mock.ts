import coolImages from 'cool-images';

export const fetchImgs = (size: number = 10) => {
  return Promise.resolve(coolImages.many(300, 500, size));
}
