import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import type { ListPageOptions } from '@box/schema/api/js/storage';
import type { Logger } from '@box/utils/logger';
import type { CommonGameDataServer, ReturnValue, TableType } from './types';

type Ticket = {
  identity: string;
  release: () => void;
  timeout: ReturnType<typeof setTimeout>;
};

type RecordRow = {
  key: string;
  value: string | null;
  version: string | null;
  create_time: number | null;
  update_time: number | null;
};

export type SqliteDataStorageOptions = {
  path: string;
  projectNamespace: string;
  groupNamespace: string;
  mode: string;
  lockTimeoutMs: number;
  logger: Logger;
};

const safeName = /^[a-zA-Z0-9_-]{1,160}$/;

function requireSafeName(value: string, label: string) {
  const normalized = value.trim();
  if (!safeName.test(normalized)) {
    throw new Error(`${label} contains unsupported characters`);
  }
  return normalized;
}

function freshVersion() {
  return randomUUID().replace(/-/g, '').slice(0, 26).toUpperCase();
}

/**
 * SQLite 版 CommonGameDataServer。
 *
 * 和 LocalDataStorage 的语义一致，但用 SQLite（WAL）而不是整表 JSON 重写：
 * - 单文件、事务、prepared statement
 * - current + history 两套记录
 * - ticket/lock 语义与 LocalDataStorage 对齐（进程内）
 *
 * 注意：单进程/同机多进程可用；不要放网络文件系统。
 */
export class SqliteDataStorage implements CommonGameDataServer {
  private readonly root: string;
  private readonly projectNamespace: string;
  private readonly groupNamespace: string;
  private readonly mode: string;
  private readonly lockTimeoutMs: number;
  private readonly logger: Logger;
  private readonly queues = new Map<string, Promise<void>>();
  private readonly tickets = new Map<string, Ticket>();
  private db!: DatabaseSync;
  private connected = false;

  constructor(options: SqliteDataStorageOptions) {
    this.root = options.path === ':memory:' ? ':memory:' : path.resolve(options.path);
    this.projectNamespace = requireSafeName(options.projectNamespace, 'project namespace');
    this.groupNamespace = requireSafeName(options.groupNamespace, 'group namespace');
    this.mode = requireSafeName(options.mode, 'storage mode');
    this.lockTimeoutMs = Math.max(1000, options.lockTimeoutMs);
    this.logger = options.logger;
  }

  async connect() {
    if (this.connected) return;
    if (this.root !== ':memory:') {
      fs.mkdirSync(path.dirname(this.root), { recursive: true });
    }
    this.db = new DatabaseSync(this.root);
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA busy_timeout = 5000;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS records (
        db_type TEXT NOT NULL,
        namespace TEXT NOT NULL,
        mode TEXT NOT NULL,
        table_name TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        version TEXT,
        create_time INTEGER,
        update_time INTEGER,
        PRIMARY KEY (db_type, namespace, mode, table_name, key)
      );
      CREATE TABLE IF NOT EXISTS history (
        db_type TEXT NOT NULL,
        namespace TEXT NOT NULL,
        mode TEXT NOT NULL,
        table_name TEXT NOT NULL,
        key TEXT NOT NULL,
        version TEXT NOT NULL,
        value TEXT NOT NULL,
        create_time INTEGER NOT NULL,
        update_time INTEGER NOT NULL,
        PRIMARY KEY (db_type, namespace, mode, table_name, key, version)
      );
      CREATE TABLE IF NOT EXISTS tables (
        db_type TEXT NOT NULL,
        namespace TEXT NOT NULL,
        mode TEXT NOT NULL,
        table_name TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (db_type, namespace, mode, table_name)
      );
      CREATE INDEX IF NOT EXISTS records_lookup
        ON records (db_type, namespace, mode, table_name, key);
    `);
    this.connected = true;
    this.logger.log(
      `SQLite data storage ready: ${JSON.stringify({
        driver: 'sqlite',
        path: this.root,
        projectNamespace: this.projectNamespace,
        groupNamespace: this.groupNamespace,
        mode: this.mode,
      })}`,
    );
  }

  async close() {
    for (const ticket of this.tickets.values()) {
      clearTimeout(ticket.timeout);
      ticket.release();
    }
    this.tickets.clear();
    if (this.connected) {
      this.db.close();
      this.connected = false;
    }
  }

  private database() {
    if (!this.connected) throw new Error('SQLite data storage is not connected');
    return this.db;
  }

  private namespace(type: TableType) {
    return type === 'group' ? this.groupNamespace : this.projectNamespace;
  }

  private identity(type: TableType, table: string, key: string) {
    return `${type}\u0000${this.namespace(type)}\u0000${this.mode}\u0000${table}\u0000${key}`;
  }

  private tableName(table: string) {
    return requireSafeName(table, 'data storage name');
  }

  private transaction<T>(action: () => T): T {
    const db = this.database();
    db.exec('BEGIN IMMEDIATE;');
    try {
      const result = action();
      db.exec('COMMIT;');
      return result;
    } catch (error) {
      db.exec('ROLLBACK;');
      throw error;
    }
  }

  private rowToReturn(row: RecordRow | undefined): ReturnValue | undefined {
    if (!row || row.value === null || row.value === undefined) return undefined;
    return {
      key: row.key,
      value: JSON.parse(row.value),
      version: row.version ?? '',
      createTime: row.create_time ?? 0,
      updateTime: row.update_time ?? 0,
    };
  }

  private readCurrent(type: TableType, table: string, key: string) {
    const row = this.database()
      .prepare(
        `SELECT key, value, version, create_time, update_time
         FROM records
         WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ? AND key = ?`,
      )
      .get(type, this.namespace(type), this.mode, this.tableName(table), key) as
      | RecordRow
      | undefined;
    return this.rowToReturn(row);
  }

  private readVersion(type: TableType, table: string, key: string, version: string) {
    const row = this.database()
      .prepare(
        `SELECT key, value, version, create_time, update_time
         FROM history
         WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ? AND key = ? AND version = ?`,
      )
      .get(type, this.namespace(type), this.mode, this.tableName(table), key, version) as
      | RecordRow
      | undefined;
    return this.rowToReturn(row);
  }

  private put(type: TableType, table: string, key: string, value: unknown) {
    const db = this.database();
    const tableName = this.tableName(table);
    const namespace = this.namespace(type);
    const now = Date.now();
    const previous = db
      .prepare(
        `SELECT create_time FROM records
         WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ? AND key = ?`,
      )
      .get(type, namespace, this.mode, tableName, key) as
      | { create_time: number | null }
      | undefined;
    const next: ReturnValue = {
      key,
      value: structuredClone(value) as ReturnValue['value'],
      version: freshVersion(),
      createTime: previous?.create_time || now,
      updateTime: now,
    };
    const valueJson = JSON.stringify(next.value);
    db.prepare(
      `INSERT INTO records (db_type, namespace, mode, table_name, key, value, version, create_time, update_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (db_type, namespace, mode, table_name, key)
       DO UPDATE SET value = excluded.value, version = excluded.version, update_time = excluded.update_time`,
    ).run(
      type,
      namespace,
      this.mode,
      tableName,
      key,
      valueJson,
      next.version,
      next.createTime,
      next.updateTime,
    );
    db.prepare(
      `INSERT INTO history (db_type, namespace, mode, table_name, key, version, value, create_time, update_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      type,
      namespace,
      this.mode,
      tableName,
      key,
      next.version,
      valueJson,
      next.createTime,
      next.updateTime,
    );
    return next;
  }

  private async acquire(identity: string) {
    const previous = this.queues.get(identity) || Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.catch(() => undefined).then(() => current);
    this.queues.set(identity, tail);
    await previous.catch(() => undefined);
    return () => {
      release();
      if (this.queues.get(identity) === tail) this.queues.delete(identity);
    };
  }

  private async withLock<T>(identity: string, action: () => T | Promise<T>) {
    const release = await this.acquire(identity);
    try {
      return await action();
    } finally {
      release();
    }
  }

  private async beginTicket(ticket: string, identity: string) {
    if (!ticket || this.tickets.has(ticket)) {
      throw new Error('invalid or duplicate local storage ticket');
    }
    const release = await this.acquire(identity);
    const timeout = setTimeout(() => {
      const active = this.tickets.get(ticket);
      if (!active) return;
      this.tickets.delete(ticket);
      active.release();
    }, this.lockTimeoutMs);
    timeout.unref();
    this.tickets.set(ticket, { identity, release, timeout });
  }

  private takeTicket(ticket: string, identity: string) {
    const active = this.tickets.get(ticket);
    if (!active || active.identity !== identity) {
      throw new Error('local storage ticket does not match this key');
    }
    this.tickets.delete(ticket);
    clearTimeout(active.timeout);
    return active.release;
  }

  async createTable(type: TableType, table: string) {
    const db = this.database();
    db.prepare(
      `INSERT INTO tables (db_type, namespace, mode, table_name, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (db_type, namespace, mode, table_name) DO NOTHING`,
    ).run(type, this.namespace(type), this.mode, this.tableName(table), Date.now());
  }

  async get(type: TableType, table: string, key: string, version?: string, ticket?: string) {
    const identity = this.identity(type, table, key);
    if (ticket) await this.beginTicket(ticket, identity);
    return version
      ? this.readVersion(type, table, key, version)
      : this.readCurrent(type, table, key);
  }

  async list(type: TableType, table: string, options: ListPageOptions) {
    const rows = this.database()
      .prepare(
        `SELECT key, value, version, create_time, update_time
         FROM records
         WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ? AND value IS NOT NULL`,
      )
      .all(type, this.namespace(type), this.mode, this.tableName(table)) as RecordRow[];
    const records = rows
      .map((row) => this.rowToReturn(row))
      .filter((record): record is ReturnValue => Boolean(record));
    const targetValue = (record: ReturnValue) => {
      let value: unknown = record.value;
      for (const part of (options.constraintTarget || '').split('.').filter(Boolean)) {
        value = value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined;
      }
      return value;
    };
    const filtered = records.filter((record) => {
      const value = targetValue(record);
      if (typeof options.min === 'number' && (typeof value !== 'number' || value < options.min)) return false;
      if (typeof options.max === 'number' && (typeof value !== 'number' || value > options.max)) return false;
      return true;
    });
    const direction = options.ascending === false ? -1 : 1;
    filtered.sort((left, right) => {
      const a = targetValue(left);
      const b = targetValue(right);
      if (typeof a === 'number' && typeof b === 'number' && a !== b) return (a - b) * direction;
      if (typeof a === 'number') return -1;
      if (typeof b === 'number') return 1;
      return left.key.localeCompare(right.key) * direction;
    });
    const pageSize = Math.max(1, Math.min(1000, options.pageSize || 100));
    const start = Math.max(0, options.cursor || 0) * pageSize;
    return {
      items: structuredClone(filtered.slice(start, start + pageSize)),
      isLastPage: start + pageSize >= filtered.length,
    };
  }

  async set(type: TableType, table: string, key: string, value: unknown, ticket?: string) {
    const identity = this.identity(type, table, key);
    const write = () => this.transaction(() => this.put(type, table, key, value));
    if (ticket) {
      const release = this.takeTicket(ticket, identity);
      try {
        write();
      } finally {
        release();
      }
      return;
    }
    await this.withLock(identity, write);
  }

  async increment(type: TableType, table: string, key: string, amount: number) {
    const identity = this.identity(type, table, key);
    return this.withLock(identity, () =>
      this.transaction(() => {
        const current = this.readCurrent(type, table, key)?.value ?? 0;
        if (typeof current !== 'number') {
          throw new Error('The increment value should be a numeric type.');
        }
        const next = current + amount;
        this.put(type, table, key, next);
        return next;
      }),
    );
  }

  async remove(type: TableType, table: string, key: string, ticket?: string) {
    const identity = this.identity(type, table, key);
    const remove = () =>
      this.transaction(() => {
        const previous = this.readCurrent(type, table, key);
        if (previous) {
          this.database()
            .prepare(
              `UPDATE records
               SET value = NULL, version = NULL, update_time = ?
               WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ? AND key = ?`,
            )
            .run(
              Date.now(),
              type,
              this.namespace(type),
              this.mode,
              this.tableName(table),
              key,
            );
        }
        return previous;
      });
    if (ticket && this.tickets.has(ticket)) {
      const release = this.takeTicket(ticket, identity);
      try {
        return remove();
      } finally {
        release();
      }
    }
    return this.withLock(identity, remove);
  }

  async dropTable(type: TableType, table: string) {
    const db = this.database();
    const tableName = this.tableName(table);
    const namespace = this.namespace(type);
    this.transaction(() => {
      db.prepare(
        `DELETE FROM history WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ?`,
      ).run(type, namespace, this.mode, tableName);
      db.prepare(
        `DELETE FROM records WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ?`,
      ).run(type, namespace, this.mode, tableName);
      db.prepare(
        `DELETE FROM tables WHERE db_type = ? AND namespace = ? AND mode = ? AND table_name = ?`,
      ).run(type, namespace, this.mode, tableName);
    });
  }
}
