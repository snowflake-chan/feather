import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';

import { CachingContentServer } from '@box/content-server/caching-content-server';
import {
  getDefaultContentCache,
  LruContentCache,
  setDefaultContentCache,
} from '@box/content-server/content-cache';
import type { ContentServer } from '@box/content-server/index';
import {
  createSharedArenaSpec,
  installSharedContentArena,
  SharedArenaContentCache,
} from '@box/content-server/shared-arena-cache';

const ARENA_MODULE = require.resolve('@box/content-server/shared-arena-cache');

const HASH_A = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
const HASH_B = 'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o';

function textBytes(text: string) {
  return Buffer.from(text, 'utf8');
}

/** 在独立 worker 里跑一段代码；用来验证跨 isolate 行为 */
function runInWorker(
  workerData: unknown,
  body: string,
): Promise<{ got: string | null; stats: any }> {
  const code = `
    const { parentPort, workerData } = require('node:worker_threads');
    const { SharedArenaContentCache } = require(${JSON.stringify(ARENA_MODULE)});
    const cache = new SharedArenaContentCache(workerData.spec);
    ${body}
    parentPort.postMessage({ got, stats: cache.stats() });
  `;
  return new Promise((resolve, reject) => {
    const worker = new Worker(code, { eval: true, workerData });
    worker.once('message', (message) => resolve(message as any));
    worker.once('error', reject);
  });
}

async function main() {
  // 1) 同一个 cache 里重复 put 只占一个条目
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 128 });
    const cache = new SharedArenaContentCache(spec);
    cache.putCache(HASH_A, textBytes('alpha'));
    cache.putCache(HASH_A, textBytes('alpha'));
    assert.equal(cache.stats().entries, 1, 'duplicate put must not allocate a second slot');
    assert.equal(cache.stats().localEntries, 1);
  }

  // 2) getCache 返回的是 SAB 视图，不是拷贝
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 128 });
    const cache = new SharedArenaContentCache(spec);
    cache.putCache(HASH_A, textBytes('alpha'));
    const view = cache.getCache(HASH_A)!;
    assert.ok(Buffer.isBuffer(view), 'server-side cache must hand out a Buffer');
    assert.equal((view as Buffer).buffer, spec.data, 'view must alias the shared arena');
    assert.equal(Buffer.from(view).toString('utf8'), 'alpha');
    // 视图可写是已知风险：这里只确认它确实指向共享区
    (view as Buffer)[0] = 'A'.charCodeAt(0);
    assert.equal(Buffer.from(new Uint8Array(spec.data, 0, 5)).toString('utf8'), 'Alpha');
  }

  // 3) 跨 isolate：一个 worker 写，另一个 worker 读得到（共享索引生效）
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 128 });
    const writer = await runInWorker(
      { spec, put: { hash: HASH_A, text: 'from-worker-a' } },
      `const got = null; if (workerData.put) cache.putCache(workerData.put.hash, Buffer.from(workerData.put.text, 'utf8'));`,
    );
    assert.equal(writer.stats.entries, 1);

    const reader = await runInWorker(
      { spec, read: HASH_A },
      `const v = cache.getCache(workerData.read); const got = v ? Buffer.from(v).toString('utf8') : null;`,
    );
    assert.equal(reader.got, 'from-worker-a', 'second isolate must see the first isolate blob');
    assert.equal(reader.stats.entries, 1, 'reading must not add an entry');
  }

  // 4) 跨 isolate 去重：两个 worker 写同一个 hash，只应有一个条目
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 128 });
    const body = `cache.putCache(workerData.hash, Buffer.from(workerData.text, 'utf8')); const got = null;`;
    await runInWorker({ spec, hash: HASH_A, text: 'same-bytes' }, body);
    const second = await runInWorker({ spec, hash: HASH_A, text: 'same-bytes' }, body);
    assert.equal(second.stats.entries, 1, 'two isolates storing the same hash must share one slot');
    assert.equal(second.stats.localEntries, 1);
  }

  // 5) 空间不足：拒绝缓存但不出错，读回落空
  {
    const spec = createSharedArenaSpec({ dataBytes: 64, entries: 8 });
    const cache = new SharedArenaContentCache(spec);
    cache.putCache(HASH_A, Buffer.alloc(128, 7));
    assert.equal(cache.getCache(HASH_A), undefined, 'oversized blob must not be cached');
    assert.equal(cache.stats().rejected, 1);
    assert.equal(cache.stats().usedBytes, 0, 'rejected allocation must not advance the bump pointer');
  }

  // 6) 非 ASCII hash 直接跳过（否则截断后可能误命中）
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 8 });
    const cache = new SharedArenaContentCache(spec);
    cache.putCache('哈希', textBytes('x'));
    assert.equal(cache.stats().entries, 0);
    assert.equal(cache.getCache('哈希'), undefined);
  }

  // 7) installSharedContentArena 会把默认缓存换掉
  {
    const spec = createSharedArenaSpec({ dataBytes: 1 << 20, entries: 128 });
    const cache = installSharedContentArena(spec);
    assert.equal(getDefaultContentCache(), cache, 'install must replace the process default cache');
  }

  // 8) CachingContentServer 通过默认缓存落到共享 arena
  {
    let baseReads = 0;
    const base: ContentServer = {
      async init() {},
      async store() {
        throw new Error('store is not used in this check');
      },
      async retrieve(hash: string) {
        baseReads += 1;
        return textBytes(`base:${hash}`);
      },
    } as ContentServer;
    const logger = { info() {}, warn() {}, error() {}, debug() {} } as any;
    const server = new CachingContentServer(logger, base);

    const first = await server.retrieve(HASH_B);
    assert.equal(Buffer.from(first!).toString('utf8'), `base:${HASH_B}`);
    assert.equal(baseReads, 1);

    const second = await server.retrieve(HASH_B);
    assert.equal(Buffer.from(second!).toString('utf8'), `base:${HASH_B}`);
    assert.equal(baseReads, 1, 'second retrieve must be served from the shared arena');

    const cache = getDefaultContentCache() as SharedArenaContentCache;
    assert.ok(cache instanceof SharedArenaContentCache);
    assert.equal(cache.stats().entries, 1);
  }

  // 9) 关掉时行为不变（回到 LRU）
  {
    setDefaultContentCache(new LruContentCache(8));
    assert.ok(getDefaultContentCache() instanceof LruContentCache);
  }

  console.log('content arena: 9 组断言通过');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
