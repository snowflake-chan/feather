import { MuASCII, MuStruct, MuUTF8 } from '@box/mudb/schema';

export const TeleportProtocol = {
  name: 'teleport',
  client: {
    teleport: new MuStruct({
      playHash: new MuASCII(),
      serverId: new MuUTF8(),
    }),
    editTeleport: new MuASCII(),
  },
  server: {},
};
