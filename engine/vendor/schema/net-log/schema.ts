import { LogMessageSchema } from '@box/utils/logger';
import {
  MuStruct,
  MuVarint,
  MuUTF8,
  MuASCII,
  MuArray,
  MuJSON,
} from '@box/mudb/schema';

export const NetLogEventSchema = new MuJSON();
export type NetLogEvent = typeof NetLogEventSchema.identity;

export const NetLogSchema = {
  name: 'net-log',
  client: {
    log: LogMessageSchema,
  },
  server: {
    log: new MuStruct({
      level: new MuVarint(),
      prefix: new MuArray(new MuASCII(), Infinity),
      message: new MuUTF8(),
    }),
    logASCII: new MuStruct({
      level: new MuVarint(),
      prefix: new MuArray(new MuASCII(), Infinity),
      message: new MuASCII(),
    }),
    logPino: NetLogEventSchema,
  },
};
