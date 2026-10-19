import {
  MuBoolean,
  MuStruct,
  MuUTF8,
  MuUint8,
  MuVarint,
  MuVoid,
} from '@box/mudb/schema';
import { ParsedErrorSchema } from './schema';

export const DebuggerProtocol = {
  name: 'debugger',
  client: {
    updateLog: new MuStruct({
      level: new MuUint8(),
      message: new MuUTF8(),
    }),
    scriptException: ParsedErrorSchema,
    scriptEvalResult: new MuStruct({
      token: new MuVarint(),
      error: new MuBoolean(true),
      result: new MuUTF8(),
    }),
    clearLog: new MuVoid(),
  },
  server: {
    scriptEval: new MuStruct({
      token: new MuVarint(),
      expr: new MuUTF8(),
    }),
    /** Browser-side script output, relayed to the editor and Creator CLI. */
    clientLog: new MuStruct({
      level: new MuUint8(),
      message: new MuUTF8(),
    }),
    clientException: ParsedErrorSchema,
    clientClearLog: new MuVoid(),
  },
};
