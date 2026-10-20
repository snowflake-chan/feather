import type { MapStats } from '../contract';

export function collectStats(spec: {
  game: { state: any };
  startedAt: number;
  previousCpu: NodeJS.CpuUsage;
  previousTime: number;
  previousTick: number;
}): {
  stats: MapStats;
  previousCpu: NodeJS.CpuUsage;
  previousTime: number;
  previousTick: number;
} {
  const now = Date.now();
  const usage = process.cpuUsage();
  const elapsedMs = Math.max(1, now - spec.previousTime);
  const cpuUs = (usage.user - spec.previousCpu.user) + (usage.system - spec.previousCpu.system);
  const state = spec.game.state;
  const tick = Number(state?.clock?.tick ?? 0);
  const tickRate = Math.round(((tick - spec.previousTick) / (elapsedMs / 1000)) * 10) / 10;
  return {
    stats: {
      tick,
      players: Array.isArray(state?.connectionSet) ? state.connectionSet.length : 0,
      uptimeMs: now - spec.startedAt,
      tickRate,
      rssBytes: process.memoryUsage().rss,
      heapUsedBytes: process.memoryUsage().heapUsed,
      cpuPercent: Math.round((cpuUs / 1000 / elapsedMs) * 1000) / 10,
    },
    previousCpu: usage,
    previousTime: now,
    previousTick: tick,
  };
}
