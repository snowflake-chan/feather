import { MuUTF8, MuStruct, MuDictionary } from '@box/mudb/schema';
import { MuRDAText } from '@box/schema/code-editor/murda-text';
import { MuRDARegister, MuRDAStruct, MuRDAMap } from '@box/mudb/rda';

export const ScriptRDA = new MuRDAStruct({
  id: new MuRDARegister(new MuUTF8()),
  name: new MuRDARegister(new MuUTF8()),
  text: MuRDAText,
});

export const CodeEditorRDA = new MuRDAMap(new MuUTF8(), ScriptRDA);

export const CursorListSchema = new MuDictionary(
  new MuStruct({
    name: new MuUTF8(),
    textId: new MuUTF8(),
  }),
  Infinity,
);

export const CodeEditorStateSchema = new MuStruct({
  cursorList: new MuDictionary(CursorListSchema, Infinity),
  //TODO: selection list
});
