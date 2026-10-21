import { promisify } from './promisify';

let storageObj: Storage;

if (typeof localStorage !== 'undefined') {
  storageObj = localStorage;
} else {
  // test 会调用这个文件(test 环境下不存在 localStorage, 会报错)
  storageObj = {
    getItem(key: string) {
      return null;
    },
    setItem(key: string, val: string) {
      // pass
    },
    length: 0,
    clear() {
      // pass
    },
    key(index: number) {
      return null;
    },
    removeItem(key: string) {
      // pass
    },
  };
}

export function getStorageTemplate<T extends { [name: string]: any }>(
  baseKey: string,
  defaultValue: T,
) {
  function getStorage() {
    try {
      const data = storageObj.getItem(baseKey);
      if (!data) {
        return;
      }
      return JSON.parse(data) as T;
    } catch (e) {
      return void 0;
    }
  }

  if (!getStorage() && typeof window !== 'undefined') {
    storageObj.setItem(baseKey, JSON.stringify(defaultValue));
  }

  return {
    get: <K extends keyof T>(key: K) => {
      const data = getStorage();
      if (data && typeof data[key] !== 'undefined') {
        return data[key];
      }
      return defaultValue[key];
    },
    put: <K extends keyof T>(key: K, value: T[K]) => {
      const data = getStorage() || Object.assign({}, defaultValue);
      data[key] = value;
      storageObj.setItem(baseKey, JSON.stringify(data));
    },
    clear: () => {
      storageObj.setItem(baseKey, JSON.stringify(defaultValue));
    },
  };
}

/**
 * Estimate the storage using
 * Includes: localStorage, IndexDB, CacheStorage
 * @returns StorageEstimate
 */
export async function estimateStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      return await navigator.storage.estimate();
    } catch {
      // Usage is optional and may be unavailable on HTTP/private browsing.
    }
  }
  return {} as StorageEstimate;
}

export async function clearIndexDB() {
  if (!indexedDB) {
    return;
  }
  const dbs = await (<any>indexedDB).databases();
  for (let i = 0; i < dbs.length; i++) {
    const dbInfo = dbs[i];
    const db = await promisify(indexedDB.open(dbInfo.name, dbInfo.version));
    const names = db.objectStoreNames;
    const promises: Promise<any>[] = [];
    for (let j = 0; j < names.length; j++) {
      const storeName = names[i];
      if (!storeName) {
        continue;
      }

      const store = db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName);
      store.clear();
      promises.push(promisify(store.transaction));
    }
    await Promise.all(promises);
  }
}

export async function clearCacheStorage() {
  await Promise.all(
    (
      await caches.keys()
    ).map(async (key) => {
      if (key.indexOf('pinned-') > 0) {
        return;
      }
      await caches.delete(key);
    }),
  );
}
