import {
  MuUTF8,
  MuStruct,
  MuDictionary,
  MuFloat32,
  MuBoolean,
  MuVarint,
} from '@box/mudb/schema';
import { MuRDAStruct, MuRDARegister, MuRDAMap } from '@box/mudb/rda';
import { MuRDAText } from './murda-text';

export const FileRDA = new MuRDAStruct({
  fileId: new MuRDARegister(new MuUTF8()),
  name: new MuRDARegister(new MuUTF8()),
  text: MuRDAText,
  order: new MuRDARegister(new MuFloat32()),
  isClient: new MuRDARegister(new MuBoolean(false)),
  // 是否共享文件
  isShare: new MuRDARegister(new MuBoolean(false)),
  // 文件是否正在开启共享
  isUploading: new MuRDARegister(new MuBoolean(false)),
  lockedMapTitle: new MuRDARegister(new MuUTF8()),
  lockedMapId: new MuRDARegister(new MuVarint(0)),
  size: new MuRDARegister(new MuVarint(0)),
});

// fileId: file
export const FileDictRDA = new MuRDAMap(new MuUTF8(), FileRDA);

export const FileSchema = FileRDA.stateSchema;
export type FileState = typeof FileSchema.identity;

export const FileDictSchema = FileDictRDA.stateSchema;
export type FileDictState = typeof FileDictSchema.identity;

export const CursorSchema = new MuStruct({
  sessionId: new MuUTF8(),
  name: new MuUTF8(),
  fileId: new MuUTF8(),
  startPosId: new MuUTF8(),
  endPosId: new MuUTF8(),
});
export type CursorState = typeof CursorSchema.identity;

export const CursorDictSchema = new MuDictionary(CursorSchema, Infinity);
export type CursorDictState = typeof CursorDictSchema.identity;
