import {
  MuUTF8,
  MuStruct,
  MuVarint,
  MuUnion,
  MuFloat64,
  MuBytes,
  MuVoid,
  MuBoolean,
  MuArray,
  MuASCII,
  MuOption,
  MuSchema,
} from '@box/mudb/schema';

export type DBFetchType =
  | 'get'
  | 'set'
  | 'increment'
  | 'list'
  | 'remove'
  | 'createTable'
  | 'drop';
export type DBType = 'group' | 'project';

export const QueryParamSchema = new MuUnion({
  number: new MuFloat64(),
  string: new MuUTF8(),
  bytes: new MuBytes(),
  boolean: new MuBoolean(),
  date: new MuFloat64(),
  null: new MuVoid(),
});

export type QueryParam = typeof QueryParamSchema.identity;

export const QueryParamListSchema = new MuArray(QueryParamSchema, Infinity);

export const StorageProtocol = {
  name: 'storage-api',
  client: {
    queryRows: new MuStruct({
      handle: new MuVarint(),
      columns: new MuArray(new MuUTF8(), Infinity),
      rows: new MuArray(QueryParamListSchema, Infinity),
    }),
    queryDone: new MuVarint(),
    queryError: new MuStruct({
      handle: new MuVarint(),
      error: new MuUTF8(),
    }),

    dbResultDone: new MuStruct({
      dbKey: new MuUTF8(),
      dbType: <MuSchema<DBType>>new MuASCII(),
      handle: new MuVarint(),
      result: new MuOption(new MuUTF8()),
    }),
    dbFetchError: new MuStruct({
      dbKey: new MuUTF8(),
      dbType: <MuSchema<DBType>>new MuASCII(),
      handle: new MuVarint(),
      error: new MuUTF8(),
    }),
  },
  server: {
    query: new MuStruct({
      handle: new MuVarint(),
      sqlExpr: new MuArray(new MuUTF8(), Infinity),
      params: QueryParamListSchema,
    }),
    queryStep: new MuVarint(),
    queryAbort: new MuVarint(),

    // db server 的所有操作
    dbFetch: new MuStruct({
      handle: new MuVarint(),
      dbType: <MuSchema<DBType>>new MuASCII(),
      dbKey: new MuUTF8(),
      type: <MuSchema<DBFetchType>>new MuASCII(),
      params: new MuUTF8(),
    }),
  },
};
