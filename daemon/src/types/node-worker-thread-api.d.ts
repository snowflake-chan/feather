/**
 * `worker.cpuUsage()` / `worker.getHeapStatistics()` 的补丁声明。
 *
 * 这两个是 Node 22 后期才补上的采样口子：
 * - `worker.cpuUsage()`      → 该线程的 CPU 时间（per-thread）
 * - `worker.getHeapStatistics()` → 该 isolate 的 V8 堆统计（per-isolate）
 *
 * 运行时没问题（`shell` 包已经要求 Node >= 22.17），但本包锁的 `@types/node@20`
 * 里没有这两个方法。不能用 `process.cpuUsage()` / `process.memoryUsage()` 顶替：
 * 它们在 worker 里读的是**整个进程**，同进程多个 shard 会报出同一个数。
 *
 * 等 `@types/node` 升到包含这两个 API 的版本后，删掉本文件即可。
 */
declare module 'node:worker_threads' {
  interface Worker {
    /** 该线程的累计 CPU 时间（微秒）。传 previous 则返回差值 */
    cpuUsage(previous?: { user: number; system: number }): Promise<{
      user: number;
      system: number;
    }>;
    /** 该 isolate 的 V8 堆统计 */
    getHeapStatistics(): Promise<{
      total_heap_size: number;
      total_heap_size_executable: number;
      total_physical_size: number;
      total_available_size: number;
      used_heap_size: number;
      heap_size_limit: number;
      malloced_memory: number;
      peak_malloced_memory: number;
      does_zap_garbage: number;
      number_of_native_contexts: number;
      number_of_detached_contexts: number;
      total_global_handles_size: number;
      used_global_handles_size: number;
      external_memory: number;
    }>;
  }
}

export {};
