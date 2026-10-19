import { MuStruct, MuUint32, MuUTF8, MuBoolean } from '@box/mudb/schema'

export const ModerationProtocol = {
  name: 'script-moderation',
  server: { request: new MuStruct({ handle: new MuUint32(), playerId: new MuUint32(), payload: new MuUTF8() }) },
  client: { reply: new MuStruct({ handle: new MuUint32(), success: new MuBoolean(), payload: new MuUTF8() }) },
}
