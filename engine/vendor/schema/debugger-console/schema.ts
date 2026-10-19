import {
  MuUTF8,
  MuUint32,
  MuStruct,
  MuArray,
  MuBoolean,
} from '@box/mudb/schema';

export const StackFrameSchema = new MuStruct({
  function: new MuUTF8(),
  file: new MuUTF8(),
  line: new MuUint32(),
  column: new MuUint32(),
  source: new MuUTF8(),
  isolate: new MuBoolean(false),
});
export const ParsedErrorSchema = new MuStruct({
  name: new MuUTF8('Error'),
  message: new MuUTF8(),
  stack: new MuArray(StackFrameSchema, Infinity),
});

/**
 * 用在 DebuggerConsole 中存储错误信息的结构
 * 为了方便前后端通信，所以是个 Schema
 */
export type ParsedError = typeof ParsedErrorSchema.identity;
