import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

import type { BuildCacheAPI } from '@box/build-system/type';

type CacheData = Record<string, string>;
const INVALID_CACHE_ENTRY = '!';

/**
 * Local counterpart of boxes' persistent build-cache service.
 *
 * A runtime process is disposable, but its project directory is not. Keeping
 * the task-token -> result-hash mapping beside the project lets unchanged
 * projects reuse prebake results after creator/runtime restarts.
 */
export class LocalBuildCache implements BuildCacheAPI {
  private readonly pending = new Map<string, Promise<string>>();

  constructor(
    private readonly filename: string,
    private readonly fallbackFilename = '',
  ) {}

  private token(name: string, params: any[]) {
    return createHash('sha1')
      .update(JSON.stringify([name, params]))
      .digest('hex');
  }

  private readFile(filename: string): CacheData {
    try {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      return data && typeof data === 'object' ? data : {};
    } catch {
      return {};
    }
  }

  private read(): CacheData {
    return this.readFile(this.filename);
  }

  private cached(token: string) {
    const primary = this.read()[token];
    if (primary === INVALID_CACHE_ENTRY) return '';
    return primary ||
      (this.fallbackFilename ? this.readFile(this.fallbackFilename)[token] : '');
  }

  private write(data: CacheData) {
    fs.mkdirSync(path.dirname(this.filename), { recursive: true });
    const temporary = `${this.filename}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(data));
    fs.renameSync(temporary, this.filename);
  }

  public async retrieve(name: string, params: any[]): Promise<string> {
    return this.cached(this.token(name, params));
  }

  public async invalidate(
    name: string,
    params: any[],
    result = '',
  ): Promise<void> {
    const token = this.token(name, params);
    const latest = this.read();
    const current = latest[token];
    if (result && current && current !== result && current !== INVALID_CACHE_ENTRY) {
      return;
    }
    // Persist a tombstone so a stale fallback cache cannot poison every new
    // runtime process after the first recovery.
    latest[token] = INVALID_CACHE_ENTRY;
    this.write(latest);
  }

  public async store(
    name: string,
    params: any[],
    method: () => Promise<string>,
  ): Promise<string> {
    const token = this.token(name, params);
    const cached = this.cached(token);
    if (cached) return cached;

    const current = this.pending.get(token);
    if (current) return current;

    const task = method().then((result) => {
      const latest = this.read();
      latest[token] = result;
      this.write(latest);
      return result;
    });
    this.pending.set(token, task);
    try {
      return await task;
    } finally {
      this.pending.delete(token);
    }
  }
}
