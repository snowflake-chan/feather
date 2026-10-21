import { MuStruct, MuVarint } from '@box/mudb/schema';
import { RPCTokenSchema } from '@box/schema/replica/replica-schema';
import { PendingRPCSchema } from '../replica/replica-client-schema';

export const PublishClientStateSchema = new MuStruct({
  rpcCounter: RPCTokenSchema,
  pendingRPC: PendingRPCSchema,

  gameId: new MuVarint(),
});
