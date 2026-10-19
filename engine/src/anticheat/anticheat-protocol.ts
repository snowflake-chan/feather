import { MuBoolean, MuStruct, MuUint32, MuUTF8, MuVoid } from '@box/mudb/schema';

/** Only on the private host-to-script transport; not registered on game sockets. */
export const AnticheatProtocol = {
  server: {
    initialized: new MuVoid(),
    listen: new MuBoolean(),
    listenMessages: new MuUint32(),
    messageDecision: new MuStruct({ handle: new MuUint32(), playerId: new MuUint32(), allow: new MuBoolean(), reason: new MuUTF8() }),
    decision: new MuStruct({ handle: new MuUint32(), playerId: new MuUint32(), allow: new MuBoolean(), reason: new MuUTF8() }),
  },
  client: {
    movement: new MuStruct({ handle: new MuUint32(), playerId: new MuUint32(), payload: new MuUTF8() }),
    clientMessage: new MuStruct({ handle: new MuUint32(), playerId: new MuUint32(), payload: new MuUTF8() }),
  },
};
