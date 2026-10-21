import { MuUTF8, MuStruct } from '@box/mudb/schema';
import {
  CursorDictSchema,
  FileDictSchema,
} from '@box/schema/code-editor/code-editor-common-state';

export const CodeEditorClientStateSchema = new MuStruct({
  cursorDict: CursorDictSchema,
  fileDict: FileDictSchema,
  selectedFileId: new MuUTF8(),
  sessionId: new MuUTF8(),
});
export type CodeEditorClientState = typeof CodeEditorClientStateSchema.identity;
