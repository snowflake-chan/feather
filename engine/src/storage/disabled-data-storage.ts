import type { ListPageOptions } from '@box/schema/api/js/storage';

import type { CommonGameDataServer, TableType } from './types';

class DataStorageNotConfiguredError extends Error {
  public readonly msg = '服主尚未配置 PostgreSQL，数据存储 API 不可用';

  constructor() {
    super('BOX_DATABASE_URL is not configured; data storage API is unavailable');
    this.name = 'DataStorageNotConfiguredError';
  }
}

/** Keeps the script API visible while making its unavailable state explicit. */
export class DisabledDataStorage implements CommonGameDataServer {
  private unavailable(): never {
    throw new DataStorageNotConfiguredError();
  }

  async connect(): Promise<void> { this.unavailable(); }
  async close(): Promise<void> {}
  async get(_type: TableType, _table: string, _key: string): Promise<never> { this.unavailable(); }
  async list(_type: TableType, _table: string, _options: ListPageOptions): Promise<never> { this.unavailable(); }
  async set(_type: TableType, _table: string, _key: string, _value: unknown): Promise<never> { this.unavailable(); }
  async increment(_type: TableType, _table: string, _key: string, _value: number): Promise<never> { this.unavailable(); }
  async remove(_type: TableType, _table: string, _key: string): Promise<never> { this.unavailable(); }
  async createTable(_type: TableType, _table: string): Promise<never> { this.unavailable(); }
  async dropTable(_type: TableType, _table: string): Promise<never> { this.unavailable(); }
}
