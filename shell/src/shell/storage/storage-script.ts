import { GameDatabase, GameQueryResult } from '@box/schema/api/js/db';
import { GameStorage } from '@box/schema/api/js/storage';
import { StorageProtocol, QueryParam } from './storage-protocol';
import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { Semaphore } from '@box/utils/semaphore';
import { StorageScriptDB } from './storage-db-script';
import { Logger } from '@box/utils/logger';

export class QueryWrapper {
  public query: GameQueryResult;
  public handle: number = 0;
  public pendingDone: {
    resolve: (message: { done: boolean; value: any }) => void;
    reject: (err: any) => void;
  }[] = [];
  public pendingNext: {
    resolve: (message: { done: boolean; value: any }) => void;
    reject: (err: any) => void;
  }[] = [];

  // buffered rows
  public pendingRow: any[] = [];

  public stepQuery: (handle: number) => void;
  public abortQuery: (handle: number) => void;
  public schedule: (event: () => void) => void;

  public error: string | null = null;
  public done: boolean = false;
  public aborted: boolean = false;

  // if set, then currently drain all rows in one shot without waiting
  public thenResolve?: (rows: any[]) => any;
  public thenReject?: (err: any) => any;

  private stepMutex = new Semaphore(0);

  constructor(spec: {
    step: (handle: number) => void;
    abort: (handle: number) => void;
    schedule: (event: () => void) => void;
  }) {
    this.stepQuery = spec.step;
    this.abortQuery = spec.abort;
    this.schedule = spec.schedule;
    this.query = new GameQueryResult(
      this.handleNext,
      this.handleReturn,
      this.handleThrow,
      this.handleThen,
    );
  }

  // must be called in a schedule()'d tick
  private drainDone() {
    // resolve then() if it was activated
    if (this.thenResolve) {
      if (this.error) {
        if (this.thenReject) {
          try {
            this.thenReject(new Error(this.error));
          } catch (e) {}
        }
      } else {
        const rows = this.pendingRow;
        this.pendingRow = [];
        try {
          this.thenResolve(rows);
        } catch (e) {}
      }
      this.thenResolve = void 0;
      this.thenReject = void 0;
    }

    if (this.pendingDone.length > 0) {
      this.pendingRow.length = 0;
    }

    // if we have buffered rows just wait until next call to next
    if (this.pendingRow.length > 0) {
      return;
    }

    // resolve all pending next handlers
    while (this.pendingNext.length > 0) {
      const p = this.pendingNext.shift();
      if (p) {
        try {
          if (this.error) {
            const e = new Error(this.error);
            p.reject(e);
          } else {
            p.resolve({
              done: true,
              value: void 0,
            });
          }
        } catch (e) {}
      }
    }

    // resolve all pending done handlers
    while (this.pendingDone.length > 0) {
      const p = this.pendingDone.shift();
      if (p) {
        try {
          if (this.error) {
            const e = new Error(this.error);
            p.reject(e);
          } else {
            p.resolve({
              done: true,
              value: void 0,
            });
          }
        } catch (e) {}
      }
    }
  }

  // called by user script, in tick event()
  public handleNext = () => {
    return new Promise<{ done: boolean; value: any }>((resolve, reject) => {
      // if user calls next while in then mode, just push into queue and skip this
      if (this.thenResolve && !this.done) {
        this.pendingNext.push({ resolve, reject });
        return;
      }

      const value = this.pendingRow.shift();
      if (value) {
        resolve({
          done: false,
          value,
        });
        if (this.done && this.pendingRow.length === 0) {
          this.drainDone();
        }
      } else if (this.done) {
        if (this.error) {
          const e = new Error(this.error);
          reject(e);
        } else {
          resolve({
            done: true,
            value: null,
          });
        }
      } else {
        this.pendingNext.push({ resolve, reject });
        if (!this.thenResolve) {
          this.stepMutex
            .p()
            .then(() => {
              if (this.done || this.aborted) {
                return;
              }
              this.stepQuery(this.handle);
            })
            .catch((e) => console.error(e));
        }
      }
    });
  };

  // called by user script
  public handleReturn = () => {
    return new Promise<{ done: boolean; value: any }>((resolve, reject) => {
      // again, then() takes precedence over return()
      if (this.thenResolve && !this.done) {
        this.pendingDone.push({ resolve, reject });
        return;
      }

      if (this.done) {
        this.pendingDone.push({ resolve, reject });
        this.pendingRow.length = 0;
        this.drainDone();
      } else {
        this.pendingDone.push({ resolve, reject });
        this.pendingRow.length = 0;
        this.aborted = true;
        this.abortQuery(this.handle);
      }
    });
  };

  public handleThrow = (err: any) => {
    return new Promise<any>((_, reject) => {
      // if in then() mode just push into queue
      if (this.thenResolve && !this.done) {
        this.pendingDone.push({ resolve: () => reject(err), reject });
        return;
      }

      if (this.done) {
        this.pendingRow.length = 0;
        this.pendingDone.push({ resolve: () => reject(err), reject });
        this.drainDone();
      } else {
        this.pendingDone.push({ resolve: () => reject(err), reject });
        this.aborted = true;
        this.pendingRow.length = 0;
        this.abortQuery(this.handle);
      }
    });
  };

  public handleThen = (
    resolve: (rows: any[]) => any,
    reject: (err: any) => any,
  ) => {
    if (typeof resolve !== 'function' || typeof reject !== 'function') {
      throw new Error('invalid arguments to then()');
    }
    if (this.thenResolve) {
      this.pendingDone.push({
        resolve: () => resolve([]),
        reject,
      });
      return;
    } else if (this.done) {
      if (this.error) {
        reject(new Error(this.error));
      } else {
        const rows = this.pendingRow;
        this.pendingRow = [];
        try {
          resolve(rows);
        } catch (e) {}
      }
      return;
    }

    // enter "then" mode
    this.thenResolve = resolve;
    this.thenReject = reject;
    if (this.stepMutex.spinP()) {
      this.stepQuery(this.handle);
    }
  };

  public notifyDone = () => {
    this.done = true;
    this.stepMutex.v(Infinity);
    this.schedule(() => {
      this.drainDone();
    });
  };

  public notifyError = (err: string) => {
    this.done = true;
    this.error = err;
    this.stepMutex.v(Infinity);
    this.schedule(() => {
      this.drainDone();
    });
  };

  public notifyRows = (columns: string[], rows: QueryParam[][]) => {
    if (this.done || this.aborted) {
      return;
    }
    for (const row of rows) {
      const value: any = {};
      for (let i = 0; i < columns.length; ++i) {
        if (row[i].type === 'bytes') {
          value[columns[i]] = new Uint8Array(<any>row[i].data);
        } else if (row[i].type === 'null') {
          value[columns[i]] = null;
        } else if (row[i].type === 'date') {
          value[columns[i]] = new Date(row[i].data as number);
        } else {
          value[columns[i]] = row[i].data;
        }
      }
      if (this.thenResolve || this.pendingNext.length === 0) {
        this.pendingRow.push(value);
      } else {
        const p = this.pendingNext.shift();
        if (p) {
          this.schedule(() => {
            p.resolve({
              done: false,
              value,
            });
          });
        }
      }
    }
    if (this.thenResolve) {
      // auto step
      this.stepQuery(this.handle);
    } else {
      this.stepMutex.v(1);
    }
  };
}

export class StorageSynchronizer {
  public protocol: MuClientProtocol<typeof StorageProtocol>;
  public queryCounter = 1;
  public queries: { [handle: number]: QueryWrapper } = {};
  public db: GameDatabase;
  public storage: GameStorage;
  public storageDbs: { [key: string]: StorageScriptDB } = {};
  public groupDbs: { [key: string]: StorageScriptDB } = {};
  public schedule: (event: () => void) => void;
  public groupId: string = '';

  constructor(spec: {
    client: MuClient;
    schedule: (event: () => void) => void;
    logger: Logger;
  }) {
    this.protocol = spec.client.protocol(StorageProtocol);
    this.schedule = spec.schedule;
    this.db = new GameDatabase(this.execQuery);
    this.storage = new GameStorage(
      (key) => {
        if (!this.storageDbs[key]) {
          this.storageDbs[key] = new StorageScriptDB(
            'project',
            key,
            this.protocol,
            spec.logger,
            this.schedule,
          );
        }
        return this.storageDbs[key].storage;
      },
      (key) => {
        if (!this.groupId) {
          return;
        }
        // 组数据库
        if (!this.groupDbs[key]) {
          this.groupDbs[key] = new StorageScriptDB(
            'group',
            key,
            this.protocol,
            spec.logger,
            this.schedule,
          );
        }
        return this.groupDbs[key].storage;
      },
    );

    this.protocol.configure({
      message: {
        queryRows: ({ handle, columns, rows }) => {
          const q = this.queries[handle];
          if (q) {
            q.notifyRows(columns, rows);
          }
        },
        queryDone: (handle) => {
          const q = this.queries[handle];
          if (q) {
            delete this.queries[handle];
            q.notifyDone();
          }
        },
        queryError: ({ handle, error }) => {
          const q = this.queries[handle];
          if (q) {
            delete this.queries[handle];
            q.notifyError(error);
          }
        },
        dbResultDone: ({ handle, dbKey, dbType, result }) => {
          if (dbType === 'group') {
            this.groupDbs[dbKey]?.fetchDone(handle, result);
          } else {
            this.storageDbs[dbKey]?.fetchDone(handle, result);
          }
        },
        dbFetchError: ({ handle, dbKey, dbType, error }) => {
          if (dbType === 'group') {
            this.groupDbs[dbKey]?.fetchError(handle, error);
          } else {
            this.storageDbs[dbKey]?.fetchError(handle, error);
          }
        },
      },
    });
  }

  private checkSQL(sql: string[]) {
    sql.forEach((part) => {
      if (part.match(/\?|\$|\@|\:/g)) {
        throw new Error('invalid sql expression');
      }
    });
  }

  private prepareParams(params: any[]) {
    return params.map((data) => {
      if (data instanceof Uint8Array) {
        return {
          type: 'bytes',
          data,
        };
      } else if (data === null || data === void 0) {
        return {
          type: 'null',
          data: void 0,
        };
      }
      const type = typeof data;
      if (type === 'number' || type === 'boolean' || type === 'string') {
        return <any>{
          type,
          data,
        };
      }
      throw new Error('invalid sql parameter');
    });
  }

  public execQuery = (sql: string[], ...params_: any[]) => {
    if (!Array.isArray(sql) || sql.length === 0 || typeof sql[0] !== 'string') {
      throw new Error(`db.sql must be called as a tag function. do not use ()`);
    }
    this.checkSQL(sql);
    const sqlExpr = sql;
    const params = this.prepareParams(params_);
    const q = new QueryWrapper({
      step: this.stepQuery,
      abort: this.abortQuery,
      schedule: this.schedule,
    });

    const h = (q.handle = ++this.queryCounter);
    this.queries[h] = q;
    this.protocol.server.message.query({
      handle: h,
      sqlExpr,
      params,
    });
    return q.query;
  };

  public stepQuery = (handle: number) => {
    this.protocol.server.message.queryStep(handle);
  };

  public abortQuery = (handle: number) => {
    this.protocol.server.message.queryAbort(handle);
  };
}
