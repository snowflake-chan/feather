import {
  CommonSQL,
  CommonDatabase,
  CommonGameDataServer,
  ReturnValue,
} from './types';
import { GameServerState } from '../game-server-schema';
import { MuServerProtocol, MuServer } from '@box/mudb/server';
import { StorageProtocol } from './storage-protocol';
import {
  StorageClientSchema,
  StorageQuerySchema,
  StorageQueryState,
  StorageClientSetSchema,
} from './storage-schema';
import { Semaphore } from '@box/utils/semaphore';
import { PostgresDataStorage } from './postgres-data-storage';
import { DisabledDataStorage } from './disabled-data-storage';
import { DB_ERROR_STATUS, ListReturnValue } from '@box/schema/api/js/storage';
import { StorageLimiters } from './limiters';
import { getConfigSync } from '../../config/server';
import { FeatureFlag } from '@box/env/constants';
import { resolveGroupStorageNamespace } from './storage-namespace';

type DbFetchResultType = ReturnValue | ListReturnValue | undefined | number;
export class StorageController {
  public protocol: MuServerProtocol<typeof StorageProtocol>;
  public state: GameServerState;
  public dbServer: CommonGameDataServer;
  private _limiters: StorageLimiters;
  private _dbServerReady?: Promise<void>;

  constructor(spec: {
    server: MuServer;
    sql: CommonSQL;
    state: GameServerState;
  }) {
    this.state = spec.state;
    this.state.storage.sql = spec.sql;
    this.protocol = spec.server.protocol(StorageProtocol);
    const config = getConfigSync();
    const usePostgres = Boolean(String(config.databaseUrl || '').trim());
    const projectNamespace = String(
        config.dataStorageNamespace ||
        config.containerName ||
        config.contentId ||
        'default',
      );
    const groupNamespace = resolveGroupStorageNamespace(config);
    if (usePostgres) {
      this.dbServer = new PostgresDataStorage({
        connectionString: config.databaseUrl,
        schema: config.databaseSchema,
        poolSize: config.databasePoolSize,
        ssl: config.databaseSsl,
        sslRejectUnauthorized: config.databaseSslRejectUnauthorized,
        projectNamespace,
        groupNamespace,
        mode: config.mode,
        lockTimeoutMs: config.dataStorageLockTimeoutMs,
        logger: this.state.logger,
      });
    } else {
      this.dbServer = new DisabledDataStorage();
    }
    this._limiters = new StorageLimiters();

    this.protocol.configure({
      connect: (client) => {
        const wrapper = StorageClientSchema.clone(StorageClientSchema.identity);
        wrapper.sessionId = client.sessionId;
        this.state.storage.clients[client.sessionId] = wrapper;
      },
      disconnect: (client) => {
        const wrapper = this.state.storage.clients[client.sessionId];
        if (!wrapper) {
          return;
        }
        delete this.state.storage.clients[client.sessionId];
        Object.keys(wrapper.queries).forEach((handle) => {
          const q = wrapper.queries[handle];
          q.abort && q.abort();
        });
        StorageClientSchema.free(wrapper);
      },
      message: {
        query: (client, { handle, sqlExpr, params }) => {
          const sessionId = client.sessionId;
          const connection = this.state.storage.clients[sessionId];
          if (!connection) {
            return;
          }
          if (handle in connection.queries) {
            return;
          }
          const db = this.state.storage.db;
          if (!db) {
            return;
          }

          const query = StorageQuerySchema.clone(StorageQuerySchema.identity);
          query.sessionId = sessionId;
          query.handle = handle;
          query.lastAccess = this.state.clock.clock;
          connection.queries[query.handle] = query;

          this.state.perf.sqlQueries++;

          db.query({
            sqlExpr: db.prepareSQL(sqlExpr),
            params: params.map((x) => (x.type === 'null' ? null : x.data)),
            onReady: (step, abort) => {
              const conn = this.state.storage.clients[sessionId];
              if (!conn || !(handle in conn.queries)) {
                this.state.perf.sqlErrors++;
                abort();
                return;
              }
              const q = conn.queries[handle];
              q.lastAccess = this.state.clock.clock;
              if (q.state !== StorageQueryState.PENDING) {
                this.state.perf.sqlErrors++;
                abort();
                const c = this.state.storage.clients[sessionId];
                if (c) {
                  delete c.queries[handle];
                  StorageQuerySchema.free(query);
                }
                return;
              } else {
                q.step = step;
                q.abort = abort;
                q.state = StorageQueryState.OPEN;
                step();
              }
            },
            onRows: (columns, rows) => {
              this.state.perf.sqlRows += rows.length;

              const cl = this.protocol.clients[sessionId];
              if (cl) {
                cl.message.queryRows({
                  handle,
                  columns,
                  rows: rows.map((row) =>
                    row.map((r) => {
                      if (r instanceof Uint8Array) {
                        return {
                          type: 'bytes',
                          data: r,
                        };
                      } else {
                        const type = typeof r;
                        if (type === 'undefined' || r === null) {
                          return {
                            type: 'null',
                            data: void 0,
                          };
                        } else if (
                          type === 'string' ||
                          type === 'number' ||
                          type === 'boolean'
                        ) {
                          return {
                            type,
                            data: r,
                          };
                        } else if (<any>r instanceof Date) {
                          return {
                            type: 'date',
                            data: r.valueOf(),
                          };
                        } else {
                          this.state.logger.error('bad sql type: ' + type);
                          return { type: 'null', data: void 0 };
                        }
                      }
                    }),
                  ),
                });
              }
            },
            onDone: () => {
              const cl = this.protocol.clients[sessionId];
              const conn = this.state.storage.clients[sessionId];
              if (!cl || !conn) {
                return;
              }
              const q = conn.queries[handle];
              if (!q || q.state !== StorageQueryState.OPEN) {
                return;
              }

              q.state = StorageQueryState.DONE;
              q.abort && q.abort();
              cl.message.queryDone(handle);
              StorageQuerySchema.free(q);
              delete conn.queries[handle];
            },
            onError: (err) => {
              this.state.perf.sqlErrors++;

              const cl = this.protocol.clients[sessionId];
              const conn = this.state.storage.clients[sessionId];
              if (!cl || !conn) {
                return;
              }
              const q = conn.queries[handle];
              if (!q) {
                return;
              }

              q.state = StorageQueryState.ERROR;
              q.abort && q.abort();
              cl.message.queryError({
                handle,
                error: 'sql error: ' + err,
              });
              StorageQuerySchema.free(q);
              delete conn.queries[handle];
            },
          });
        },
        queryAbort: (client, handle) => {
          const conn = this.state.storage.clients[client.sessionId];
          if (!conn) {
            return;
          }
          const q = conn.queries[handle];
          if (q) {
            if (q.state === StorageQueryState.OPEN) {
              q.abort && q.abort();
            } else if (q.state === StorageQueryState.PENDING) {
              q.state = StorageQueryState.DONE;
            }
          }
        },
        queryStep: (client, handle) => {
          const conn = this.state.storage.clients[client.sessionId];
          if (!conn) {
            return;
          }
          const q = conn.queries[handle];
          if (q) {
            if (q.state === StorageQueryState.OPEN) {
              q.step && q.step();
              q.lastAccess = this.state.clock.clock;
            }
          }
        },
        dbFetch: async (client, { handle, dbKey, dbType, type, params }) => {
          try {
            await this.ensureDbServerReady();
            const p = JSON.parse(params);

            // 限流判定
            const checked = this._limiters.check(
              type,
              dbKey,
              p.key,
              params.length,
            );
            if (!checked) {
              this.state.logger.log(
                `[storage] ${this.state.settings.contentId} REQUEST THROTTLED: ${type} ${dbKey} ${dbType} key: ${p.key}`,
              );
              client.message.dbFetchError({
                dbKey,
                dbType,
                handle,
                error: this.formatError('REQUEST_THROTTLED'),
              });
              return;
            }
            let result: DbFetchResultType;
            switch (type) {
              case 'set':
                await this.dbServer.set(
                  dbType,
                  dbKey,
                  p.key,
                  p.value,
                  p.ticket,
                );
                break;
              case 'increment':
                result = await this.dbServer.increment(
                  dbType,
                  dbKey,
                  p.key,
                  p.value,
                );
                break;
              case 'get':
                result = await this.dbServer.get(
                  dbType,
                  dbKey,
                  p.key,
                  p.version,
                  p.ticket,
                );
                break;
              case 'remove':
                result = await this.dbServer.remove(
                  dbType,
                  dbKey,
                  p.key,
                  p.ticket,
                );
                break;
              case 'list':
                result = await this.dbServer.list(dbType, dbKey, {
                  pageSize: p.pageSize,
                  cursor: p.cursor,
                  max: p.max,
                  min: p.min,
                  ascending: p.ascending,
                  constraintTarget: p.constraintTarget,
                });
                break;
              case 'createTable':
                await this.dbServer.createTable(dbType, dbKey);
                break;
              case 'drop':
                await this.dbServer.dropTable(dbType, dbKey);
                break;
              default:
                throw new Error(`storage handle type ${type} is invalid!`);
            }
            client.message.dbResultDone({
              dbKey,
              dbType,
              handle,
              result: this.dbFetchResultToString(result),
            });
          } catch (error) {
            const config = getConfigSync();
            let msg;
            if (
              config.method === 'local' ||
              config.FEATURE_FLAGS?.includes(FeatureFlag.StorageJava)
            ) {
              msg = error instanceof Error ? (error as Error & { msg?: string }).msg || error.message : String(error);
            }
            client.message.dbFetchError({
              dbKey,
              dbType,
              handle,
              error: this.formatError('SERVER_FETCH_ERROR', msg),
            });
          }
        },
      },
    });
  }

  private dbFetchResultToString(result: DbFetchResultType) {
    if (!result) {
      return;
    }
    return JSON.stringify(result);
  }

  private resetMutex = new Semaphore(1);
  public async reset() {
    await this.resetMutex.p();
    this._limiters.reset();
    try {
      await new Promise((resolve, reject) => {
        if (this.state.storage.db) {
          const oldDb = this.state.storage.db;
          this.state.storage.db = null;
          oldDb.close({
            onSuccess: () => {
              StorageClientSetSchema.assign(
                this.state.storage.clients,
                StorageClientSetSchema.identity,
              );
              this.state.storage.sql.open({
                chunkSize: this.state.settings.dbChunkSize,
                onReady: (db: CommonDatabase) => {
                  this.state.storage.db = db;
                  resolve(void 0);
                },
                onError: (err: any) => {
                  reject(err);
                },
              });
            },
            onError: reject,
          });
        } else {
          this.state.storage.sql.open({
            chunkSize: this.state.settings.dbChunkSize,
            onReady: (db: CommonDatabase) => {
              this.state.storage.db = db;
              resolve(void 0);
            },
            onError: (err: any) => {
              reject(err);
            },
          });
        }
      });
    } finally {
      this.resetMutex.v();
    }
  }

  /**
   * Boxes does not connect its business storage while resetting scripts.
   * Keep that startup ordering locally as well: an unavailable external
   * PostgreSQL server may fail a data-space call, but must never delay the
   * editor/game runtime from becoming ready. A failed attempt is discarded so
   * the next getDataStorage/getGroupStorage request can reconnect.
   */
  private ensureDbServerReady() {
    if (!this._dbServerReady) {
      const pending = this.dbServer.connect().catch((error) => {
        if (this._dbServerReady === pending) {
          this._dbServerReady = undefined;
        }
        throw error;
      });
      this._dbServerReady = pending;
    }
    return this._dbServerReady;
  }

  private formatError(status: DB_ERROR_STATUS, msg?: string) {
    return JSON.stringify({
      status,
      msg,
    });
  }
}
