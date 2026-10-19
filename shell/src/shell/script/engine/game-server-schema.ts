/**
 * 引擎侧游戏状态类型 —— shell 与引擎的**类型边界**。
 *
 * ## 为什么是类型声明而不是完整移植
 *
 * `GameServerState` 在上游是 `MuStruct` 实例（`game-server-schema.ts:116-226`，
 * 111 行 + 11 个下游模块）。但 shell 对它的使用**全部是参数类型标注**，
 * 没有任何运行时取值（无 `GameServerState.xxx`）。
 *
 * ## 为什么 `replica` 需要精确类型
 *
 * 其余字段用 `any` 是安全的：shell 只把 state 透传给引擎侧函数。
 * 但 `state.replica.players` 会作为泛型参数传给 `@box/utils/id` 的 `zipId()`，
 * 若为 `any` 则泛型推断塌成 `unknown`，导致 `player.id` 报错。
 *
 * 所以 `replica` 用真实的 `GameReplicaSchema` 类型。
 */
import type { GameReplica } from '@box/schema/replica/game-replica';

export type GameServerState = {
  replica: GameReplica;
  [k: string]: any;
};
