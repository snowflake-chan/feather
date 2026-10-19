import {
  MuStruct,
  MuArray,
  MuInt32,
  MuUTF8,
  MuBoolean,
  MuUint8,
  MuSchema,
  MuVarint,
} from '@box/mudb/schema';
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
