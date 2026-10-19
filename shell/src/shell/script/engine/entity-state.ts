/**
 * 引擎侧状态操作 —— 从上游 `entity/entity-controller.ts` 内联而来。
 *
 * 上游 `entity-update.ts` 只用到 entity-controller 的两个函数，但该文件有
 * 148 行并拖出 `seed/seed-schema`、`utils/sorted-array-remove` 等依赖。
 * 内联这两个函数即可让 shell 自洽，无需引入整个 entity-controller。
 *
 * 函数体与上游逐字一致（`entity/entity-controller.ts:37-50`），仅补上
 * `GameServerState` 的类型来源。
 */
import { DeletedEntitiesSchema } from '@box/schema/entity/entity-schema';
import type { GameServerState } from './game-server-schema';

export function destroyEntityId(state: GameServerState, id: number) {
  if (id) {
    state.entity.pendingDelete.push(id);
    state.entity.deletedEntities[id] = true;
  }
}

export function clearDestroyedEntity(state: GameServerState) {
  // free and reset entity delete entities
  DeletedEntitiesSchema.free(state.entity.deletedEntities);
  state.entity.deletedEntities = DeletedEntitiesSchema.alloc();
}
