import { MuBoolean } from '@box/mudb/schema/boolean';
import { MuJSON } from '@box/mudb/schema/json';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';

export const PostMessageScriptSchema = new MuStruct({
  type: new MuUTF8(''),
  value: new MuStruct({} as any),
  isOld: new MuBoolean(false),
});

export type PostMessageScriptType = typeof PostMessageScriptSchema.identity;

export interface NavigatorEventListener {
  (event: MessageEventType): void;
}

export const PostMessageSchema = new MuStruct({
  type: new MuUTF8(''),
  value: new MuUTF8(''),
  isOld: new MuBoolean(false),
});

export type PostMessageType = typeof PostMessageSchema.identity;

export const ClipboardSchema = new MuStruct({
  text: new MuUTF8(''),
});

// 参照window的MessageEvent，只保留了data属性
export const MessageEventSchema = new MuStruct({
  data: new MuJSON({}),
});

export type MessageEventType = typeof MessageEventSchema.identity;

export const NavigatorSchema = new MuStruct({
  postMessage: PostMessageSchema,
});

export type NavigatorType = typeof NavigatorSchema.identity;
