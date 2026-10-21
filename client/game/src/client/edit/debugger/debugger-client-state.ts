import {
  MuStruct,
  MuSchema,
  MuUint8,
  MuUTF8,
  MuUnion,
  MuUint32,
  MuArray,
  MuVarint,
} from '@box/mudb/schema';
import { GameLogLevel } from '@box/schema/api/console';
import { ParsedErrorSchema } from '@box/schema/debugger-console/schema';

export const LogEntrySchema = new MuStruct({
  level: <MuSchema<GameLogLevel>>new MuUint8(GameLogLevel.INFO),
  message: new MuUnion({
    text: new MuUTF8(),
    exception: ParsedErrorSchema,
    evalExpression: new MuUTF8(),
    evalResult: new MuUTF8(),
  }),
  id: new MuVarint(),
  time: new MuUint32(),
});
export type LogEntry = typeof LogEntrySchema.identity;

export const LogListSchema = new MuArray(LogEntrySchema, Infinity);
export type LogList = typeof LogListSchema.identity;

export const DebugInputListSchema = new MuArray(new MuUTF8(), Infinity);

export const DebuggerClientStateSchema = new MuStruct({
  tokenCounter: new MuVarint(0),
  log: LogListSchema,
  debugInput: DebugInputListSchema,
});
