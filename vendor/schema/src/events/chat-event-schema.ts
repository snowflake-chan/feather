import { MuArray } from '@box/mudb/schema/array';
import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuInt32 } from '@box/mudb/schema/int32';
import { MuSchema } from '@box/mudb/schema/schema';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
import { MsgType } from '../chat/chat-schema';

export const ChatLogEventSchema = new MuStruct({
  senderId: new MuInt32(-1),
  targetId: new MuInt32(-1),
  name: new MuUTF8(),
  msgType: <MuSchema<MsgType>>new MuUint8(MsgType.txt),
  message: new MuUTF8(),
  private: new MuBoolean(false),
  duration: new MuInt32(0),
});

export const ChatEventSchema = new MuStruct({
  chats: new MuArray(ChatLogEventSchema, Infinity),
});
