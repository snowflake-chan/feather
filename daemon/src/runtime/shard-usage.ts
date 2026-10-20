/**
 * shard（worker 线程）级资源采样。
 *
 * 为什么需要单独一层：engine 允许一个 shard 打包多图，而 `process.cpuUsage()` /
 * `process.memoryUsage()` 在 worker 里读的是**整个进程**——同进程的所有 shard
 * 会报出同一个数，多图多 shard 时完全失真。
 *
 * Node 提供了两个真正 per-thread / per-isolate 的口子：
 * - `worker.cpuUsage()`      → 该线程的 CPU 时间（累计值，可自己做差值）
 * - `worker.getHeapStatistics()` → 该 isolate 的 V8 堆统计
 *
 * 没有 per-thread RSS：线程共享地址空间，RSS 天然只有进程口径，所以 RSS 只出现在
 * `ShardStats`（并且每个 shard 都一样）而不出现在 `MapStats`。
 */
import type { ShardUsage } from '../contract';

/** 一次 CPU 采样的原始快照（微秒，单调递增） */
export interface CpuSnapshot {
  user: number;
  system: number;
  /** 采样时刻（ms） */
  at: number;
}

/**
 * 两次 CPU 快照之间该线程的平均占用率，单位 %。
 *
 * 单核满载 = 100。一个 shard 里塞了 N 张图时可以接近 N*100，不要当"占整机百分比"看。
 *
 * 没有上一次快照（shard 刚起来）或时间窗口非正时返回 undefined —— 宁可缺字段，
 * 也不要拿"从线程启动算起"的累计值冒充瞬时值。
 */
export function deriveCpuPercent(
  previous: CpuSnapshot | undefined,
  current: CpuSnapshot,
): number | undefined {
  if (!previous) return undefined;
  const elapsedMs = current.at - previous.at;
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return undefined;
  const deltaUs =
    current.user - previous.user + (current.system - previous.system);
  // 计数倒退说明采样被并发写坏了，别报负 CPU
  if (!Number.isFinite(deltaUs) || deltaUs < 0) return undefined;
  return Math.round((deltaUs / 1000 / elapsedMs) * 1000) / 10;
}

/** 把 `worker.getHeapStatistics()` 的结果转成契约里的字节口径 */
export function toShardUsage(
  heap: {
    used_heap_size: number;
    total_heap_size: number;
    heap_size_limit: number;
    external_memory: number;
    malloced_memory: number;
  },
  cpuPercent: number | undefined,
  sampledAt: string,
): ShardUsage {
  return {
    cpuPercent,
    heapUsedBytes: heap.used_heap_size,
    heapTotalBytes: heap.total_heap_size,
    heapLimitBytes: heap.heap_size_limit,
    externalBytes: heap.external_memory + heap.malloced_memory,
    sampledAt,
  };
}
