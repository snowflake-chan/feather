import type { MapStats } from '../contract';

/** 标称 tick 周期（ms），与 engine 的 `MS_PER_TICK` 一致；标称 TPS = 1000/64 = 15.625 */
export const NOMINAL_TICK_MS = 64;
export const NOMINAL_TICK_RATE = 1000 / NOMINAL_TICK_MS;

export interface TickSample {
  /** engine 的 `state.perf.avgTickTime`：从启动起的累计帧耗时（ms） */
  tickTimeSum: number;
  /** engine 的 `state.perf.tickCounter`：从启动起的总帧数 */
  tickCounter: number;
}

/**
 * 这一采样窗口内的平均**单帧计算耗时**（单位 ms，全项目默认口径）。
 *
 * 不要和 `1000 / tickRate`（帧周期，含等待）混淆：
 * - 空闲图：周期 64ms，耗时 0.3ms
 * - 饱和图：周期被拉到 90ms，耗时 88ms
 *
 * 对应 MC 运维口径里的 MSPT。
 *
 * `avgTickTime` 是累计和，直接除 `tickCounter` 得到的是**生命周期**平均值，
 * 会越来越钝（跑了一小时后，一次抖动几乎不改变它）。所以用两次采样的差值。
 */
export function deriveTickDuration(
  previous: TickSample,
  current: TickSample,
): number | undefined {
  const ticks = current.tickCounter - previous.tickCounter;
  if (!Number.isFinite(ticks) || ticks <= 0) return undefined;
  const delta = current.tickTimeSum - previous.tickTimeSum;
  if (!Number.isFinite(delta) || delta < 0) return undefined;
  return Math.round((delta / ticks) * 100) / 100;
}

export function collectStats(spec: {
  game: { state: any };
  startedAt: number;
  previousTime: number;
  previousTick: number;
  previousTickTimeSum: number;
  previousTickCounter: number;
}): {
  stats: MapStats;
  previousTime: number;
  previousTick: number;
  previousTickTimeSum: number;
  previousTickCounter: number;
} {
  const now = Date.now();
  const elapsedMs = Math.max(1, now - spec.previousTime);
  const state = spec.game.state;
  const tick = Number(state?.clock?.tick ?? 0);
  const tickRate = Math.round(((tick - spec.previousTick) / (elapsedMs / 1000)) * 10) / 10;

  const tickTimeSum = Number(state?.perf?.avgTickTime ?? 0);
  const tickCounter = Number(state?.perf?.tickCounter ?? 0);
  const tickDuration = deriveTickDuration(
    { tickTimeSum: spec.previousTickTimeSum, tickCounter: spec.previousTickCounter },
    { tickTimeSum, tickCounter },
  );
  const maxTickDurationRaw = Number(state?.perf?.maxTickTime ?? 0);

  return {
    stats: {
      tick,
      players: Array.isArray(state?.connectionSet) ? state.connectionSet.length : 0,
      uptime: now - spec.startedAt,
      tickRate,
      tickDuration,
      maxTickDuration:
        Number.isFinite(maxTickDurationRaw) && maxTickDurationRaw > 0
          ? Math.round(maxTickDurationRaw * 100) / 100
          : undefined,
      // 内存 / CPU 不在这里采：`process.cpuUsage()` / `memoryUsage()` 在 worker 里读的是
      // 整个进程，同进程多 shard 会报同一个数。那两项由 daemon 侧用
      // `worker.cpuUsage()` / `worker.getHeapStatistics()` 按 shard 采，见 shard-usage.ts。
    },
    previousTime: now,
    previousTick: tick,
    previousTickTimeSum: tickTimeSum,
    previousTickCounter: tickCounter,
  };
}
