import { MuStruct, MuUTF8 } from '@box/mudb/schema';
import { CodeEditorStateSchema } from '../schema';

export const CodeEditorRPCProtocol = {
  name: 'code-editor-rpc',
  client: {
    setInitialState: CodeEditorStateSchema,
    setCursorPosition: new MuStruct({
      fileId: new MuUTF8(),
      userId: new MuUTF8(),
      textId: new MuUTF8(),
    }),

    userEnterFile: new MuStruct({
      fileId: new MuUTF8(),
      name: new MuUTF8(),
      userId: new MuUTF8(),
    }),

    userExitFile: new MuStruct({
      fileId: new MuUTF8(),
      userId: new MuUTF8(),
    }),
  },
  server: {
    setCursorPosition: new MuStruct({
      fileId: new MuUTF8(),
      userId: new MuUTF8(),
      textId: new MuUTF8(),
    }),

    userEnterFile: new MuStruct({
      fileId: new MuUTF8(),
      name: new MuUTF8(),
      userId: new MuUTF8(),
    }),

    userExitFile: new MuStruct({
      fileId: new MuUTF8(),
      userId: new MuUTF8(),
    }),
  },
};
