import {
  MuStruct,
  MuSchema,
  MuVarint,
  MuASCII,
  MuDictionary,
  MuJSON,
  MuFloat64,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { CommonSQL, CommonDatabase } from './types';

export enum StorageQueryState {
  PENDING,
  OPEN,
  DONE,
  ERROR,
}

export const StorageQueryRowSchema = new MuJSON();

export const StorageQuerySchema = new MuStruct({
  handle: new MuVarint(0),
  lastAccess: new MuFloat64(),
  sessionId: new MuASCII(),
  state: <MuSchema<StorageQueryState>>new MuVarint(StorageQueryState.PENDING),
  step: new MuRefSchema<() => void>(),
  abort: new MuRefSchema<() => void>(),
});

export const StorageClientSchema = new MuStruct({
  sessionId: new MuASCII(),
  queries: new MuDictionary(StorageQuerySchema, Infinity),
});

export const StorageClientSetSchema = new MuDictionary(
  StorageClientSchema,
  Infinity,
);

export const StorageSchema = new MuStruct({
  sql: <MuSchema<CommonSQL>>new MuRefSchema<CommonSQL>(),
  db: new MuRefSchema<CommonDatabase>(),
  clients: StorageClientSetSchema,
});
