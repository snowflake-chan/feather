import {
  MuStruct,
  MuVarint,
  MuUTF8,
  MuArray,
  MuASCII,
  MuOption,
} from '@box/mudb/schema';
import type { MuSchema } from '@box/mudb/schema';
import type { TELEPORT_ERROR_STATUS } from '@box/schema/api/js/api';

export const TeleportScriptProtocol = {
  name: 'teleport-api',
  client: {
    teleportDone: new MuStruct({
      handle: new MuVarint(),
      serverId: new MuUTF8(),
    }),
    teleportError: new MuStruct({
      handle: new MuVarint(),
      error: new MuStruct({
        key: <MuSchema<TELEPORT_ERROR_STATUS>>new MuASCII(),
        msg: new MuOption(new MuUTF8()),
      }),
    }),
  },
  server: {
    teleport: new MuStruct({
      handle: new MuVarint(),
      mapId: new MuUTF8(),
      playerIds: new MuArray(new MuVarint(), Infinity),
      serverId: new MuUTF8(),
    }),
  },
};
