import type { MapStats } from '../contract';

export function collectStats(spec: {
  game: { state: any };
  startedAt: number;
  previousCpu: NodeJS.CpuUsage;
  previousTime: number;
}): { stats: MapStats; previousCpu: NodeJS.CpuUsage; previousTime: number } {
  const now = Date.now();
  const usage = process.cpuUsage();
  const elapsedMs = Math.max(1, now - spec.previousTime);
  const cpuUs = (usage.user - spec.previousCpu.user) + (usage.system - spec.previousCpu.system);
  const state = spec.game.state;
  return {
    stats: {
      tick: Number(state?.clock?.tick ?? 0),
      players: Array.isArray(state?.connectionSet) ? state.connectionSet.length : 0,
      uptimeMs: now - spec.startedAt,
      tickRate: 64,
      rssBytes: process.memoryUsage().rss,
      heapUsedBytes: process.memoryUsage().heapUsed,
      cpuPercent: Math.round((cpuUs / 1000 / elapsedMs) * 1000) / 10,
    },
    previousCpu: usage,
    previousTime: now,
  };
}
