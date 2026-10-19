import { createHash } from 'crypto';
import { BuildCacheAPI } from './type';
import { Semaphore } from '@box/utils/semaphore';

export class MockBuildCache implements BuildCacheAPI {
  private cache: { [token: string]: string } = {};
  private mutex: { [token: string]: Semaphore } = {};

  constructor() {}

  private token(name: string, params: any[]) {
    return createHash('sha1')
      .update(JSON.stringify([name, params]))
      .digest()
      .toString('hex');
  }

  public async retrieve(name: string, params: any[]): Promise<string> {
    const token = this.token(name, params);
    if (token in this.cache) {
      return this.cache[token];
    }
    return '';
  }

  public async invalidate(
    name: string,
    params: any[],
    result = '',
  ): Promise<void> {
    const token = this.token(name, params);
    if (!result || this.cache[token] === result) {
      delete this.cache[token];
    }
  }

  public async store(
    name: string,
    params: any[],
    method: () => Promise<string>,
  ): Promise<string> {
    const token = this.token(name, params);
    if (this.cache[token]) {
      return this.cache[token];
    }
    if (this.mutex[token]) {
      await this.mutex[token].p();
      return this.cache[token];
    }
    const sem = (this.mutex[token] = new Semaphore(0));
    try {
      const result = (this.cache[token] = await method());
      return result;
    } catch (e) {
      throw e;
    } finally {
      delete this.mutex[token];
      sem.v(Infinity);
    }
  }
}
