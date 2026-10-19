import { createHash, randomUUID } from 'crypto';

import type { BuildCacheAPI } from '@box/build-system/type';
import type { Logger } from 'pino';
import type { RuntimeRedisStore } from '../redis/runtime-redis';

export class RedisBuildCache implements BuildCacheAPI {
  private lastRedisWarningAt = 0;

  public constructor(
    private readonly fallback: BuildCacheAPI,
    private readonly redis: RuntimeRedisStore,
    private readonly ttlSeconds: number,
    private readonly namespace: string,
    private readonly logger: Logger,
  ) {}

  private token(name: string, params: any[]) {
    return createHash('sha1')
      .update(JSON.stringify([name, params]))
      .digest('hex');
  }

  private resultKey(name: string, params: any[]) {
    return `box-local:${this.namespace}:build:${this.token(name, params)}`;
  }

  private warn(error: unknown) {
    const now = Date.now();
    if (now - this.lastRedisWarningAt < 30_000) return;
    this.lastRedisWarningAt = now;
    this.logger.warn(
      { err: error },
      'Redis build cache failed; using the persistent local build cache.',
    );
  }

  public async retrieve(name: string, params: any[]) {
    const key = this.resultKey(name, params);
    try {
      const cached = await this.redis.get(key);
      if (cached !== undefined) return cached;
    } catch (error) {
      this.warn(error);
    }

    const local = await this.fallback.retrieve(name, params);
    if (local) {
      try {
        await this.redis.setex(key, this.ttlSeconds, local);
      } catch (error) {
        this.warn(error);
      }
    }
    return local;
  }

  public async invalidate(name: string, params: any[], result = '') {
    const key = this.resultKey(name, params);
    try {
      if (result) {
        await this.redis.compareAndDelete(key, result);
      }
    } catch (error) {
      this.warn(error);
    }
    await this.fallback.invalidate(name, params, result);
  }

  public async store(
    name: string,
    params: any[],
    method: () => Promise<string>,
  ) {
    const cached = await this.retrieve(name, params);
    if (cached) return cached;

    const key = this.resultKey(name, params);
    const lockKey = `${key}:lock`;
    const lockValue = randomUUID();
    let ownsLock = false;
    let lockHeartbeat: ReturnType<typeof setInterval> | undefined;
    try {
      ownsLock = await this.redis.setIfAbsent(lockKey, 30, lockValue);
      if (!ownsLock) {
        const deadline = Date.now() + 120_000;
        while (Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const result = await this.redis.get(key);
          if (result !== undefined) return result;
          if ((await this.redis.get(lockKey)) === undefined) break;
        }
      } else {
        let renewing = false;
        lockHeartbeat = setInterval(async () => {
          if (renewing) return;
          renewing = true;
          try {
            if (!(await this.redis.compareAndExpire(lockKey, lockValue, 30))) {
              ownsLock = false;
            }
          } catch (error) {
            this.warn(error);
          } finally {
            renewing = false;
          }
        }, 10_000);
        lockHeartbeat.unref();
      }

      const result = await this.fallback.store(name, params, method);
      await this.redis.setex(key, this.ttlSeconds, result);
      return result;
    } catch (error) {
      this.warn(error);
      return this.fallback.store(name, params, method);
    } finally {
      if (lockHeartbeat) clearInterval(lockHeartbeat);
      if (ownsLock) {
        try {
          await this.redis.compareAndDelete(lockKey, lockValue);
        } catch (error) {
          this.warn(error);
        }
      }
    }
  }
}
