import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { ListPageOptions } from '@box/schema/api/js/storage';
import type { Logger } from '@box/utils/logger';
import type { CommonGameDataServer, ReturnValue, TableType } from './types';

type StoredTable = {
  formatVersion: 1;
  records: Record<string, { current?: ReturnValue; history: Record<string, ReturnValue> }>;
};

type Ticket = { identity: string; release: () => void; timeout: ReturnType<typeof setTimeout> };

export type LocalDataStorageOptions = {
  storagePath: string;
  projectNamespace: string;
  groupNamespace: string;
  mode: string;
  lockTimeoutMs: number;
  logger: Logger;
};

const safeName = /^[a-zA-Z0-9_-]{1,160}$/;

function requireSafeName(value: string, label: string) {
  const normalized = value.trim();
  if (!safeName.test(normalized)) throw new Error(`${label} contains unsupported characters`);
  return normalized;
}

function freshVersion() {
  return randomUUID().replace(/-/g, '').slice(0, 26).toUpperCase();
}

function emptyTable(): StoredTable {
  return { formatVersion: 1, records: {} };
}

function cloneValue(value: ReturnValue | undefined): ReturnValue | undefined {
  return value === undefined ? undefined : structuredClone(value);
}

export class LocalDataStorage implements CommonGameDataServer {
  private readonly root: string;
  private readonly projectNamespace: string;
  private readonly groupNamespace: string;
  private readonly mode: string;
  private readonly lockTimeoutMs: number;
  private readonly logger: Logger;
  private readonly queues = new Map<string, Promise<void>>();
  private readonly tickets = new Map<string, Ticket>();

  constructor(options: LocalDataStorageOptions) {
    this.root = path.resolve(options.storagePath, 'game-data-storage');
    this.projectNamespace = requireSafeName(options.projectNamespace, 'project namespace');
    this.groupNamespace = requireSafeName(options.groupNamespace, 'group namespace');
    this.mode = requireSafeName(options.mode, 'storage mode');
    this.lockTimeoutMs = Math.max(1000, options.lockTimeoutMs);
    this.logger = options.logger;
  }

  async connect() {
    fs.mkdirSync(this.root, { recursive: true });
    this.logger.log(`Local data storage ready: ${JSON.stringify({ driver: 'local', root: this.root, projectNamespace: this.projectNamespace, groupNamespace: this.groupNamespace, mode: this.mode })}`);
  }

  async close() {
    for (const ticket of this.tickets.values()) {
      clearTimeout(ticket.timeout);
      ticket.release();
    }
    this.tickets.clear();
  }

  private namespace(type: TableType) {
    return type === 'group' ? this.groupNamespace : this.projectNamespace;
  }

  private tablePath(type: TableType, table: string) {
    const safeTable = requireSafeName(table, 'data storage name');
    const directory = path.join(this.root, type, this.mode, this.namespace(type));
    const target = path.join(directory, `${safeTable}.json`);
    if (!target.startsWith(`${this.root}${path.sep}`)) throw new Error('invalid local storage path');
    return target;
  }

  private identity(type: TableType, table: string, key: string) {
    return `${this.tablePath(type, table)}\u0000${key}`;
  }

  private readTable(target: string): StoredTable {
    if (!fs.existsSync(target)) return emptyTable();
    const parsed = JSON.parse(fs.readFileSync(target, 'utf8')) as StoredTable;
    if (parsed?.formatVersion !== 1 || !parsed.records || typeof parsed.records !== 'object') {
      throw new Error(`local storage file is invalid: ${target}`);
    }
    return parsed;
  }

  private writeTable(target: string, table: StoredTable) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(table), { encoding: 'utf8', mode: 0o600 });
      fs.renameSync(temporary, target);
    } finally {
      fs.rmSync(temporary, { force: true });
    }
  }

  private async acquire(identity: string) {
    const previous = this.queues.get(identity) || Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
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
    try { return await action(); } finally { release(); }
  }

  private async beginTicket(ticket: string, identity: string) {
    if (!ticket || this.tickets.has(ticket)) throw new Error('invalid or duplicate local storage ticket');
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
    if (!active || active.identity !== identity) throw new Error('local storage ticket does not match this key');
    this.tickets.delete(ticket);
    clearTimeout(active.timeout);
    return active.release;
  }

  async createTable(type: TableType, table: string) {
    const target = this.tablePath(type, table);
    await this.withLock(target, () => {
      if (!fs.existsSync(target)) this.writeTable(target, emptyTable());
    });
  }

  async get(type: TableType, table: string, key: string, version?: string, ticket?: string) {
    const target = this.tablePath(type, table);
    const identity = this.identity(type, table, key);
    if (ticket) await this.beginTicket(ticket, identity);
    const record = this.readTable(target).records[key];
    return cloneValue(version ? record?.history[version] : record?.current);
  }

  private put(target: string, key: string, value: unknown) {
    const table = this.readTable(target);
    const previous = table.records[key];
    const now = Date.now();
    const next: ReturnValue = { key, value: structuredClone(value) as ReturnValue['value'], version: freshVersion(), createTime: previous?.current?.createTime || now, updateTime: now };
    table.records[key] ||= { history: {} };
    table.records[key].current = next;
    table.records[key].history[next.version] = next;
    this.writeTable(target, table);
  }

  async set(type: TableType, table: string, key: string, value: unknown, ticket?: string) {
    const target = this.tablePath(type, table);
    const identity = this.identity(type, table, key);
    if (ticket) {
      const release = this.takeTicket(ticket, identity);
      try { this.put(target, key, value); } finally { release(); }
      return;
    }
    await this.withLock(identity, () => this.put(target, key, value));
  }

  async increment(type: TableType, table: string, key: string, amount: number) {
    const target = this.tablePath(type, table);
    return this.withLock(this.identity(type, table, key), () => {
      const current = this.readTable(target).records[key]?.current?.value ?? 0;
      if (typeof current !== 'number') throw new Error('The increment value should be a numeric type.');
      const next = current + amount;
      this.put(target, key, next);
      return next;
    });
  }

  async list(type: TableType, table: string, options: ListPageOptions) {
    const records = Object.values(this.readTable(this.tablePath(type, table)).records)
      .map((record) => record.current)
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
      const a = targetValue(left); const b = targetValue(right);
      if (typeof a === 'number' && typeof b === 'number' && a !== b) return (a - b) * direction;
      if (typeof a === 'number') return -1;
      if (typeof b === 'number') return 1;
      return left.key.localeCompare(right.key) * direction;
    });
    const pageSize = Math.max(1, Math.min(1000, options.pageSize || 100));
    const start = Math.max(0, options.cursor || 0) * pageSize;
    return { items: structuredClone(filtered.slice(start, start + pageSize)), isLastPage: start + pageSize >= filtered.length };
  }

  async remove(type: TableType, table: string, key: string, ticket?: string) {
    const target = this.tablePath(type, table);
    const identity = this.identity(type, table, key);
    const remove = () => {
      const data = this.readTable(target);
      const previous = cloneValue(data.records[key]?.current);
      if (data.records[key]) data.records[key].current = undefined;
      this.writeTable(target, data);
      return previous;
    };
    if (ticket && this.tickets.has(ticket)) {
      const release = this.takeTicket(ticket, identity);
      try { return remove(); } finally { release(); }
    }
    return this.withLock(identity, remove);
  }

  async dropTable(type: TableType, table: string) {
    const target = this.tablePath(type, table);
    await this.withLock(target, () => fs.rmSync(target, { force: true }));
  }
}
