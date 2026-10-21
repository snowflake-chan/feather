import { GameReplica } from '@box/schema/replica/game-replica';
import { GamePrivateReplicaSchema } from '@box/schema/replica/game-private-replica';
import {
  NetModelSetSchema,
  NetModelSchema,
} from '@box/schema/mesh/model-schema';
import { deltaList, patchList } from '@box/utils/script/delta';
import { GameClientState } from '../game-client-schema';

// // 恢复secret的数据为服务端数据
// export function resetSecretData(state: GameClientState) {
//   // reset private replicas
//   state.privateReplicas[0] = GamePrivateReplicaSchema.clone(
//     state.secret.replica,
//   );
// }

// // diff server replica 数据
// export function applyServerReplicaUpdates(
//   state: GameClientState,
//   nextReplica: GameReplica,
// ) {
//   const { replica, clientReplica } = state;
//   // 检查models更新的内容，同步更新到clientReplica的models
//   if (!NetModelSetSchema.equal(replica.models, nextReplica.models)) {
//     const modelsDelta = {
//       remove: [],
//       upserts: [],
//     };
//     deltaList(NetModelSchema, modelsDelta, replica.models, nextReplica.models);
//     patchList(NetModelSchema, clientReplica.models, modelsDelta);
//   }
// }
