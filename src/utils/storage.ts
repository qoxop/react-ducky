/* eslint-disable no-unused-vars */
export type StoreItem<T> = {
    get():T|null;
    set(t:T):void;
}

/**
 * 创建一个 localStorage 的存取原子
 * @param key 对应 localStorage 的 key 值
 * @param hash 用于校验原来存数据的数据结构是否与当前的一直，避免发生结构冲突
 */
const createPersistenceItem = <T>(storage: Storage, key: string, hash?: string):StoreItem<T> => {
  const atom = {
    get() {
      try {
        const str = storage.getItem(key);
        if (!str) return null;
        return JSON.parse(str).v;
      } catch (error) {
        return null;
      }
    },
    set(v: T) {
      storage.setItem(key, JSON.stringify({ v, h: hash }));
    },
  };
  try {
    const { h: oldHash } = JSON.parse(storage.getItem(key) || '{}');
    if (oldHash !== hash) {
      atom.set(null);
    }
  } catch (error) {
    atom.set(null);
  }
  return atom;
};

/**
 * 创建一个 sessionStorage 的存取原子
 * @param key 对应 sessionStorage 的 key 值
 */
const createSessionItem = <T>(key: string):StoreItem<T> => ({
  get() {
    try {
      const str = sessionStorage.getItem(key);
      if (!str) return null;
      return JSON.parse(str).v;
    } catch (error) {
      return null;
    }
  },
  set(v: T) {
    sessionStorage.setItem(key, JSON.stringify({ v }));
  },
});

export {
  createSessionItem,
  createPersistenceItem,
};
