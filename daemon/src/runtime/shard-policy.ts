/**
 * shard 分配策略。
 *
 * 原则：按**核数**分配，不按图数。
 *
 * - 核预算没用完：一张图一个 shard（一图一线程，tick 互不排队）。
 * - 核预算用完了：新图塞进最闲的 shard（此时打包是强制的，不是选择）。
 *
 * 为什么核数是唯一旋钮：真实机型的 RAM/核 基本恒定（1h2g / 2h4g / 4h8g / 8h16g
 * 都是 ~2GB/核），所以「核多 = 内存也多」，不需要再做内存感知的启发式。
 * 1 核机器自然得到 1 个 shard（全打包），多核机器自然得到一图一 shard。
 */

/** 默认预算 = 核数；FEATHER_MAX_SHARDS 可显式覆盖（例如设为核数的一半换取密度）。 */
export function resolveShardBudget(cores: number, override?: string | number): number {
  const parsed = Number(override);
  if (Number.isFinite(parsed) && parsed >= 1) return Math.floor(parsed);
  return Math.max(1, Math.floor(cores));
}

/**
 * 是否该为这张图新开 shard。
 *
 * @param activeMaps 当前处于 running/starting 的图数（含本次要启动的这张）
 * @param existingShards 现存 shard 数
 * @param budget 允许的最大 shard 数
 */
export function shouldCreateShard(
  activeMaps: number,
  existingShards: number,
  budget: number,
): boolean {
  const target = Math.min(Math.max(1, activeMaps), Math.max(1, budget));
  return existingShards < target;
}
