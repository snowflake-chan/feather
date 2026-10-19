import { MuDictionary, MuStruct, MuUTF8 } from '@box/mudb/schema';
import {
  CursorDictSchema,
  FileDictSchema,
} from '@box/schema/code-editor/code-editor-common-state';

export const CodeEditorServerStateSchema = new MuStruct({
  cursorDict: CursorDictSchema,
  fileDict: FileDictSchema,
  // key: sessionId, value: fileId
  selectedFiles: new MuDictionary(new MuUTF8(''), Infinity),
});
export type CodeEditorServerState = typeof CodeEditorServerStateSchema.identity;
