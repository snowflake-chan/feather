import { ContentCache, setDefaultContentCache } from './content-cache';

/**
 * 跨 isolate 共享的内容缓存。
 *
 * 为什么需要：`DEFAULT_CONTENT_CACHE` 是模块级单例，但模块图是 per-isolate 的，
 * 所以每个 shard 各有一份。同一个 workspace 的 blob 会被复制「shard 数」份。
 * 这里把 payload 放进 SharedArrayBuffer，所有 shard 读同一份字节。
 *
 * 为什么不需要锁：内容按 hash 寻址、永不改变。写入是 append-only：
 * 先用一次 CAS 从共享 bump 指针取号，把字节写进去，再用 CAS 领一个索引槽，
 * 最后用 `Atomics.store(state, READY)` 发布。读者只在 state === READY 时读字段，
 * 所以不会读到半成品。SeqCst 的 store/load 提供了所需的 happens-before。
 *
 * 边界与代价：
 * - 只在同一进程的 worker_threads 之间有效（SharedArrayBuffer 不跨进程）。
 * - 不回收。arena 满了就拒绝新条目，调用方自然回落到磁盘读，不会出错只会变慢。
 * - 索引是线性扫描。每个 isolate 对每个没见过的 hash 扫一次 `entries` 条，
 *   所以一个 shard 首次加载是 O(n²)。n=1000 时约 200ms，且只在 shard 内第一次
 *   见到该 hash 时付一次（本地 Map 会记住），之后都是 O(1)。真要优化就换共享哈希表。
 * - `getCache` 返回的是 SAB 视图，**调用方不得原地改写**，否则污染所有图。
 *   注意原来的 LRU 也是 `putCache(needCopy=false)` 直接存引用、`getCache` 返回同一对象，
 *   所以「调用方共享可变 buffer」这件事本身不是新增的，新增的只是它跨了 isolate。
 * - 不计入 V8 堆（`heapUsed` / `arrayBuffers` 都看不到），所以也不占
 *   `maxOldGenerationSizeMb`；观测要看 `stats()`。
 */

/** 控制区（Int32Array）槽位 */
const CTRL_BUMP = 0;
const CTRL_COUNT = 1;
const CTRL_REJECTED = 2;
const CTRL_CAPACITY = 3;
const CTRL_WORDS = 8;

/** 索引槽内部布局（字节） */
const SLOT_STATE = 0;
const SLOT_OFFSET = 4;
const SLOT_LENGTH = 8;
const SLOT_HASH_LENGTH = 12;
const SLOT_HASH = 16;

const SLOT_STATE_EMPTY = 0;
const SLOT_STATE_READY = 2;

/** 一个 hash 最多存多少字节。base58 multihash 是 46 字符，base64url 是 43。 */
const HASH_MAX_BYTES = 56;
const SLOT_BYTES = SLOT_HASH + HASH_MAX_BYTES;
const SLOT_WORDS = SLOT_BYTES / 4;

export const DEFAULT_ARENA_DATA_BYTES = 64 * 1024 * 1024;
export const DEFAULT_ARENA_ENTRIES = 16384;

export interface SharedArenaSpec {
  /** payload 区 */
  data: SharedArrayBuffer;
  /** 定长索引表 */
  index: SharedArrayBuffer;
  /** bump 指针 / 条目数 / 拒绝计数 / 条目容量 */
  control: SharedArrayBuffer;
}

export interface SharedArenaUsage {
  usedBytes: number;
  capacityBytes: number;
  entries: number;
  entryCapacity: number;
  /** 因为空间或槽位不足而被拒绝缓存的次数 */
  rejected: number;
}

export interface SharedArenaStats extends SharedArenaUsage {
  /** 本 isolate 自己的 hash 索引条数 */
  localEntries: number;
}

function createSharedArrayBuffer(bytes: number): SharedArrayBuffer {
  return new SharedArrayBuffer(bytes);
}

export function createSharedArenaSpec(
  options: { dataBytes?: number; entries?: number } = {},
): SharedArenaSpec {
  const dataBytes = Math.max(1, Math.floor(options.dataBytes ?? DEFAULT_ARENA_DATA_BYTES));
  const entries = Math.max(1, Math.floor(options.entries ?? DEFAULT_ARENA_ENTRIES));
  const control = createSharedArrayBuffer(CTRL_WORDS * 4);
  const ctrl = new Int32Array(control);
  // 在共享出去之前写，不需要原子操作。
  ctrl[CTRL_CAPACITY] = entries;
  return {
    data: createSharedArrayBuffer(dataBytes),
    index: createSharedArrayBuffer(entries * SLOT_BYTES),
    control,
  };
}

/**
 * 只读共享区状态。
 *
 * 不需要建 cache 实例，daemon 侧上报 `/v1/info` 用。这块内存不计入 V8 堆，
 * 所以 `heapUsed` / `arrayBuffers` 都看不到它——不单独报一个数，运维会以为
 * 这部分内存凭空消失了。
 */
export function readSharedArenaUsage(spec: SharedArenaSpec): SharedArenaUsage {
  const ctrl = new Int32Array(spec.control);
  const entryCapacity = ctrl[CTRL_CAPACITY] || 0;
  return {
    usedBytes: Atomics.load(ctrl, CTRL_BUMP),
    capacityBytes: spec.data.byteLength,
    entries: Math.min(Atomics.load(ctrl, CTRL_COUNT), entryCapacity),
    entryCapacity,
    rejected: Atomics.load(ctrl, CTRL_REJECTED),
  };
}

/** 返回 hash 的字节长度；含非 ASCII 字符时返回 -1（这类 hash 不进共享区，避免截断后误命中） */
function asciiLength(hash: string): number {  for (let i = 0; i < hash.length; i += 1) {
    if (hash.charCodeAt(i) > 0x7f) return -1;
  }
  return hash.length;
}

export class SharedArenaContentCache implements ContentCache {
  private readonly _spec: SharedArenaSpec;
  private readonly _data: SharedArrayBuffer;
  private readonly _ctrl: Int32Array;
  private readonly _words: Int32Array;
  private readonly _bytes: Uint8Array;
  private readonly _entryCapacity: number;
  private readonly _local = new Map<string, { offset: number; length: number }>();

  constructor(spec: SharedArenaSpec) {
    this._spec = spec;
    this._data = spec.data;
    this._ctrl = new Int32Array(spec.control);
    this._words = new Int32Array(spec.index);
    this._bytes = new Uint8Array(spec.index);
    this._entryCapacity = this._ctrl[CTRL_CAPACITY] || 0;
  }

  public putCache(hash: string, data: Uint8Array, _needCopy?: boolean): void {
    if (this._local.has(hash)) return;
    const existing = this._findInShared(hash);
    if (existing) {
      this._local.set(hash, existing);
      return;
    }
    const hashLength = asciiLength(hash);
    if (hashLength <= 0 || hashLength > HASH_MAX_BYTES) return;
    if (!data || data.length === 0) return;

    // 先领 payload 再领槽位：反过来的话空间不足时会白白消耗一个槽位，
    // 让 `stats().entries` 把空槽也算进去。槽位满了才浪费 payload，而槽位满
    // 意味着已经到缓存上限了，浪费一次无所谓。
    const offset = this._reserve(data.length);
    if (offset < 0) {
      Atomics.add(this._ctrl, CTRL_REJECTED, 1);
      return;
    }
    const slot = this._claimSlot();
    if (slot < 0) {
      Atomics.add(this._ctrl, CTRL_REJECTED, 1);
      return;
    }

    new Uint8Array(this._data, offset, data.length).set(data);

    const word = slot * SLOT_WORDS;
    const hashBase = slot * SLOT_BYTES + SLOT_HASH;
    Atomics.store(this._words, word + SLOT_OFFSET / 4, offset);
    Atomics.store(this._words, word + SLOT_LENGTH / 4, data.length);
    Atomics.store(this._words, word + SLOT_HASH_LENGTH / 4, hashLength);
    for (let i = 0; i < hashLength; i += 1) {
      this._bytes[hashBase + i] = hash.charCodeAt(i);
    }
    // 发布：这之前的普通写入对读到 READY 的线程可见。
    Atomics.store(this._words, word + SLOT_STATE / 4, SLOT_STATE_READY);

    this._local.set(hash, { offset, length: data.length });
  }

  public getCache(hash: string): Uint8Array | undefined {
    const local = this._local.get(hash);
    if (local) return this._view(local.offset, local.length);
    const shared = this._findInShared(hash);
    if (!shared) return undefined;
    this._local.set(hash, shared);
    return this._view(shared.offset, shared.length);
  }

  public stats(): SharedArenaStats {
    return { ...readSharedArenaUsage(this._spec), localEntries: this._local.size };
  }

  private _view(offset: number, length: number): Uint8Array {
    // 服务端必须是 Buffer：裸 Uint8Array 在请求 content server 时会抛错。
    if (typeof Buffer === 'function' && Uint8Array.isPrototypeOf(Buffer)) {
      return Buffer.from(this._data, offset, length);
    }
    return new Uint8Array(this._data, offset, length);
  }

  private _findInShared(hash: string): { offset: number; length: number } | undefined {
    const hashLength = asciiLength(hash);
    if (hashLength <= 0 || hashLength > HASH_MAX_BYTES) return undefined;
    const count = Math.min(Atomics.load(this._ctrl, CTRL_COUNT), this._entryCapacity);
    for (let slot = 0; slot < count; slot += 1) {
      const word = slot * SLOT_WORDS;
      if (Atomics.load(this._words, word + SLOT_STATE / 4) !== SLOT_STATE_READY) continue;
      if (Atomics.load(this._words, word + SLOT_HASH_LENGTH / 4) !== hashLength) continue;
      const hashBase = slot * SLOT_BYTES + SLOT_HASH;
      let same = true;
      for (let i = 0; i < hashLength; i += 1) {
        if (this._bytes[hashBase + i] !== hash.charCodeAt(i)) {
          same = false;
          break;
        }
      }
      if (!same) continue;
      return {
        offset: Atomics.load(this._words, word + SLOT_OFFSET / 4),
        length: Atomics.load(this._words, word + SLOT_LENGTH / 4),
      };
    }
    return undefined;
  }

  /** 从共享 bump 指针领一段 payload 空间；空间不够返回 -1 且不推进指针 */
  private _reserve(length: number): number {
    const capacity = this._data.byteLength;
    for (;;) {
      const current = Atomics.load(this._ctrl, CTRL_BUMP);
      if (current + length > capacity) return -1;
      if (Atomics.compareExchange(this._ctrl, CTRL_BUMP, current, current + length) === current) {
        return current;
      }
    }
  }

  /** 领一个索引槽；表满返回 -1 */
  private _claimSlot(): number {
    for (;;) {
      const current = Atomics.load(this._ctrl, CTRL_COUNT);
      if (current >= this._entryCapacity) return -1;
      if (Atomics.compareExchange(this._ctrl, CTRL_COUNT, current, current + 1) === current) {
        return current;
      }
    }
  }
}

/**
 * 把共享 arena 装成当前 isolate 的默认内容缓存。
 *
 * 必须在启动任何 map 之前调用：`CachingContentServer` 在构造时取默认缓存，
 * 同一个 shard 的所有图共用一个实例（这一点和原来的模块级单例行为一致）。
 */
export function installSharedContentArena(spec: SharedArenaSpec): SharedArenaContentCache {
  const cache = new SharedArenaContentCache(spec);
  setDefaultContentCache(cache);
  return cache;
}
