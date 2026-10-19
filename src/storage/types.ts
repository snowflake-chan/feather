import {
  ListPageOptions,
  ListReturnValue,
  ResultValue,
} from '@box/schema/api/js/storage';
import { DBType } from './storage-protocol';

/**
 * Common API for SQL providers.  The storage provider interface should abstract over the following common storage types:
 */

export type ReturnValue = ResultValue;
export type TableType = DBType;

export interface CommonSQL {
  open(spec: {
    chunkSize: number;
    onReady: (db: CommonDatabase) => void;
    onError: (err: Error) => void;
  }): void;
}

export interface CommonDatabase {
  prepareSQL(sqlExpr: string[]): string;
  query(spec: {
    sqlExpr: string;
    params: any[];
    onReady: (step: () => void, close: () => void) => void;
    onRows: (
      columns: string[],
      rows: (Uint8Array | number | string | boolean | null)[][],
    ) => void;
    onDone: () => void;
    onError: (err: Error) => void;
  }): void;
  close(spec: { onSuccess: () => void; onError: (err: Error) => void }): void;
}

export interface CommonGameDataServer {
  connect: () => Promise<void>;
  close: () => Promise<void>;

  get: (
    dbType: DBType,
    table: string,
    key: string,
    version?: string,
    ticket?: string,
  ) => Promise<ReturnValue | undefined>;

  list: (
    dbType: DBType,
    table: string,
    options: ListPageOptions,
  ) => Promise<ListReturnValue>;

  set: (
    dbType: DBType,
    table: string,
    key: string,
    value: any,
    ticket?: string,
  ) => Promise<void>;

  increment: (
    dbType: DBType,
    table: string,
    key: string,
    value: number,
  ) => Promise<number>;

  remove: (
    dbType: DBType,
    table: string,
    key: string,
    ticket?: string,
  ) => Promise<ReturnValue | undefined>;

  createTable: (dbType: DBType, table: string) => Promise<void>;
  dropTable: (dbType: DBType, table: string) => Promise<void>;
}
