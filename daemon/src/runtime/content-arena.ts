import {
  createSharedArenaSpec,
  type SharedArenaSpec,
} from 'feather-engine/content-arena';

const MB = 1024 * 1024;

/** 默认 64MB：够装下一个典型 .boxplay 的全量 blob，又不至于白白占着虚拟地址。 */
const DEFAULT_DATA_MB = 64;
/** 默认 16384 个槽位，单槽 72 字节 ≈ 1.1MB 索引。 */
const DEFAULT_ENTRIES = 16384;

function readPositiveInt(raw: string | undefined): number | undefined {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.floor(value);
}

/**
 * 创建一个跨 shard 共享的内容 arena 描述符。
 *
 * 为什么放在 daemon 层：arena 必须由**一个**地方创建再分发给所有 shard，
 * 否则每个 shard 各建一个就又回到「各存一份」。
 *
 * 用环境变量而不是 feather.toml，是因为这块是运行时调优参数、不随图变化。
 * 想关掉就 `FEATHER_CONTENT_ARENA=off`，会退回每 isolate 一份的 LRU。
 */
export function createContentArenaSpec(
  env: NodeJS.ProcessEnv = process.env,
): SharedArenaSpec | undefined {
  const toggle = String(env.FEATHER_CONTENT_ARENA ?? '').trim().toLowerCase();
  if (toggle === 'off' || toggle === '0' || toggle === 'false') return undefined;

  const dataMb = readPositiveInt(env.FEATHER_CONTENT_ARENA_MB);
  const entries = readPositiveInt(env.FEATHER_CONTENT_ARENA_ENTRIES);
  return createSharedArenaSpec({
    dataBytes: (dataMb ?? DEFAULT_DATA_MB) * MB,
    entries: entries ?? DEFAULT_ENTRIES,
  });
}
