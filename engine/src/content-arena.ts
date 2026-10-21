/**
 * 共享内容 arena 的转出口。
 *
 * 为什么不从 daemon 直接引 `@box/content-server/shared-arena-cache`：
 * daemon 的 dependencies 里没有 `@box/content-server`（pnpm 严格解析），
 * 而 engine 有。daemon 本来就依赖 feather-engine，从这里转一手比往 daemon
 * 加依赖、改 lockfile 干净。
 */
export {
  createSharedArenaSpec,
  installSharedContentArena,
  readSharedArenaUsage,
  SharedArenaContentCache,
  DEFAULT_ARENA_DATA_BYTES,
  DEFAULT_ARENA_ENTRIES,
} from '@box/content-server/shared-arena-cache';

export type {
  SharedArenaSpec,
  SharedArenaStats,
  SharedArenaUsage,
} from '@box/content-server/shared-arena-cache';
