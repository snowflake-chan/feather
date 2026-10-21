import { MuStruct, MuUTF8, MuVarint, MuASCII } from '@box/mudb/schema';
import { RPCResultSchema, RPCTokenSchema } from '../replica/replica-schema';

export const PublishRPCSchema = new MuStruct({
  token: RPCTokenSchema,
  shortname: new MuASCII(),
});

export const CancelPublishRPCSchema = new MuStruct({
  token: RPCTokenSchema,

  // TODO add other args here
});

export const SaveGameRPCSchema = new MuStruct({
  token: RPCTokenSchema,
  saveAs: new MuUTF8(''),
});

export const PublishProtocol = {
  name: 'publishing',
  client: {
    init: new MuStruct({
      gameId: new MuVarint(),
    }),
    rpcResponse: RPCResultSchema,
  },
  server: {
    saveGame: SaveGameRPCSchema,
  },
};
