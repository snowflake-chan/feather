import {
  MuStruct,
  MuUTF8,
  MuInt32,
  MuSortedArray,
  MuUint8,
  MuSchema,
  MuFloat64,
  MuOption,
  MuASCII,
  MuVarint,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { MsgType } from '@box/schema/chat/chat-schema';
import { compareId } from '@box/utils/id';

export const GIFInfo = new MuStruct({
  url: new MuASCII(),
  imageData: new MuRefSchema<ImageData>(),
  frameIndex: new MuUint8(0),
  frameStartTick: new MuFloat64(),
  cycleCount: new MuUint8(3),
  startTick: new MuFloat64(),
});

export const ChatBubbleSchema = new MuStruct({
  id: new MuInt32(),
  tick: new MuFloat64(),
  message: new MuUTF8(),
  msgType: <MuSchema<MsgType>>new MuUint8(MsgType.txt),
  gifInfo: new MuOption(GIFInfo),
  duration: new MuInt32(0),
});

export type GIFInfoType = typeof GIFInfo.identity;

export type ChatBubble = typeof ChatBubbleSchema.identity;

export const ChatBubbleListSchema = new MuSortedArray(
  ChatBubbleSchema,
  Infinity,
  compareId,
);
