import { RedisIoCache } from '@box/utils/redis-cache/redis-io-cache';
import type { Logger } from 'pino';

export interface RuntimeRedisStore {
  readonly database: number;
  isReady(): boolean;
  get(key: string): Promise<string | undefined>;
  setex(key: string, seconds: number, value: string): Promise<void>;
  consume(key: string): Promise<string | undefined>;
  incrementWindow(key: string, ttlMs: number): Promise<number>;
  setIfAbsent(key: string, seconds: number, value: string): Promise<boolean>;
  compareAndExpire(key: string, value: string, seconds: number): Promise<boolean>;
  compareAndDelete(key: string, value: string): Promise<void>;
}

const consumeScript = `
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
`;

const incrementWindowScript = `
local value = redis.call('INCR', KEYS[1])
if value == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return value
`;

const compareAndDeleteScript = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

const compareAndExpireScript = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  redis.call('EXPIRE', KEYS[1], ARGV[2])
  return 1
end
return 0
`;

class RedisRuntimeStore implements RuntimeRedisStore {
  public constructor(
    private readonly cache: RedisIoCache,
    public readonly database: number,
  ) {}

  public isReady() {
    return this.cache.isReady();
  }

  public get(key: string) {
    return this.cache.get(key);
  }

  public async setex(key: string, seconds: number, value: string) {
    await this.cache.setex(key, Math.max(1, Math.ceil(seconds)), value);
  }

  public async consume(key: string) {
    const value = await this.cache.redis!.eval(consumeScript, 1, key);
    return value === null || value === undefined ? undefined : String(value);
  }

  public async incrementWindow(key: string, ttlMs: number) {
    const value = await this.cache.redis!.eval(
      incrementWindowScript,
      1,
      key,
      String(Math.max(1000, Math.ceil(ttlMs))),
    );
    return Number(value);
  }

  public async setIfAbsent(key: string, seconds: number, value: string) {
    return Boolean(
      await this.cache.setex(
        key,
        Math.max(1, Math.ceil(seconds)),
        value,
        true,
      ),
    );
  }

  public async compareAndDelete(key: string, value: string) {
    await this.cache.redis!.eval(compareAndDeleteScript, 1, key, value);
  }

  public async compareAndExpire(
    key: string,
    value: string,
    seconds: number,
  ) {
    return Boolean(
      await this.cache.redis!.eval(
        compareAndExpireScript,
        1,
        key,
        value,
        String(Math.max(1, Math.ceil(seconds))),
      ),
    );
  }
}

export async function createRuntimeRedisStore(options: {
  host: string;
  port: number;
  password: string;
  database: number;
  role: string;
  logger: Logger;
}): Promise<RuntimeRedisStore | undefined> {
  if (!options.host.trim()) return undefined;

  const cache = new RedisIoCache();
  try {
    await cache.init({
      host: options.host,
      port: options.port,
      password: options.password || undefined,
      db: options.database,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      retryStrategy: (attempt) =>
        Math.min(5000, Math.max(250, attempt * 250)),
    });
    const store = new RedisRuntimeStore(cache, options.database);
    await cache.redis!.ping();
    options.logger.info(
      `Redis ${options.role} store ready: ${JSON.stringify({
        host: options.host,
        port: options.port,
        database: options.database,
      })}`,
    );
    return store;
  } catch (error) {
    // Keep the reconnecting client. Every consumer has an in-memory/file
    // fallback, so a Redis outage must not prevent a map from opening.
    options.logger.warn(
      { err: error },
      `Redis ${options.role} store is unavailable; local fallback is active.`,
    );
    return cache.redis
      ? new RedisRuntimeStore(cache, options.database)
      : undefined;
  }
}
