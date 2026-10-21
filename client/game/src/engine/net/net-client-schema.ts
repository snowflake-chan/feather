import { NetModelSetSchema } from '@box/schema/mesh/model-schema';
import { MuStruct } from '@box/mudb/schema';

export const GameClientReplicaSchema = new MuStruct({
  models: NetModelSetSchema,
});
