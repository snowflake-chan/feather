import {
  MuVoid,
  MuUTF8,
  MuStruct,
  MuBoolean,
  MuFloat32,
} from '@box/mudb/schema';
import {
  FileSchema,
  CursorSchema,
  CursorDictSchema,
} from './code-editor-common-state';

export const ShareScriptResSchema = new MuStruct({
  success: new MuBoolean(false),
  errorCode: new MuFloat32(),
});
export type ShareScriptResState = typeof ShareScriptResSchema.identity;

export const CodeEditorProtocol = {
  name: 'code-editor-protocol',
  client: {
    getSession: new MuUTF8(),
    syncFile: FileSchema,
    removeFile: new MuUTF8(),
    syncCursor: CursorSchema,
    syncCursorName: CursorSchema,
    removeCursor: new MuUTF8(),
    syncCursorDict: CursorDictSchema,
    addFileSuccess: new MuUTF8(),
    onShareAutoSave: new MuUTF8(),
  },
  server: {
    copyFile: new MuUTF8(),
    renameFile: new MuStruct({
      name: new MuUTF8(),
      fileId: new MuUTF8(),
    }),
    recoverFile: new MuStruct({
      isClient: new MuBoolean(),
      name: new MuUTF8(),
      hash: new MuUTF8(),
    }),
    addFile: new MuBoolean(),
    addFileForce: new MuStruct({
      fileId: new MuUTF8(),
      name: new MuUTF8(),
      hash: new MuUTF8(),
      isClient: new MuBoolean(),
    }),
    selectFile: new MuUTF8(),
    blurFile: new MuVoid(),
    removeFile: new MuUTF8(),
    syncCursorName: new MuUTF8(),
    syncCursor: CursorSchema,
  },
};
