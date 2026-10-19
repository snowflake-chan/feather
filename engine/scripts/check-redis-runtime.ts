import assert from 'node:assert/strict';

import type { BuildCacheAPI } from '@box/build-system/type';
import { GameSessionDataSchema } from '@box/schema/session/schema';
import { getFakeUser } from '../src/session/fake';
import { GameSession } from '../src/session/server';
import type { RuntimeRedisStore } from '../src/redis/runtime-redis';
import { RedisBuildCache } from '../src/utils/redis-build-cache';

class MemoryRedis implements RuntimeRedisStore {
  public readonly database = 3;
  private readonly values = new Map<string, string>();
  private readonly counters = new Map<string, number>();

  public isReady() { return true; }
  public async get(key: string) { return this.values.get(key); }
  public async setex(key: string, _seconds: number, value: string) {
    this.values.set(key, value);
  }
  public async consume(key: string) {
    const value = this.values.get(key);
    this.values.delete(key);
    return value;
  }
  public async incrementWindow(key: string, _ttlMs: number) {
    const value = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, value);
    return value;
  }
  public async setIfAbsent(key: string, _seconds: number, value: string) {
    if (this.values.has(key)) return false;
    this.values.set(key, value);
    return true;
  }
  public async compareAndDelete(key: string, value: string) {
    if (this.values.get(key) === value) this.values.delete(key);
  }
  public async compareAndExpire(key: string, value: string, _seconds: number) {
    return this.values.get(key) === value;
  }
}

class FailingRedis extends MemoryRedis {
  private fail(): never { throw new Error('redis unavailable'); }
  public override async get(_key: string): Promise<string | undefined> { return this.fail(); }
  public override async setex(_key: string, _seconds: number, _value: string) { return this.fail(); }
  public override async consume(_key: string): Promise<string | undefined> { return this.fail(); }
  public override async incrementWindow(_key: string, _ttlMs: number) { return this.fail(); }
  public override async setIfAbsent(_key: string, _seconds: number, _value: string) { return this.fail(); }
  public override async compareAndDelete(_key: string, _value: string) { return this.fail(); }
  public override async compareAndExpire(_key: string, _value: string, _seconds: number) { return this.fail(); }
}

class MemoryBuildCache implements BuildCacheAPI {
  private readonly values = new Map<string, string>();
  private token(name: string, params: any[]) { return JSON.stringify([name, params]); }
  public async retrieve(name: string, params: any[]) {
    return this.values.get(this.token(name, params)) || '';
  }
  public async invalidate(name: string, params: any[], result = '') {
    const token = this.token(name, params);
    if (!result || this.values.get(token) === result) this.values.delete(token);
  }
  public async store(name: string, params: any[], method: () => Promise<string>) {
    const token = this.token(name, params);
    const cached = this.values.get(token);
    if (cached) return cached;
    const result = await method();
    this.values.set(token, result);
    return result;
  }
}

const logger = { warn() {}, error() {} } as any;
const pinoLogger = { warn() {} } as any;

async function checkSessions() {
  const redis = new MemoryRedis();
  const first = new GameSession(logger, true, 60_000, redis, 'test');
  const second = new GameSession(logger, true, 60_000, redis, 'test');
  const user = getFakeUser('alice', 1001);

  await first.bindUserSession(user, '127.0.0.1', 'session-a', '', 'fp', 'CN');
  const shared = await second.getSessionData('session-a');
  assert.equal(shared?.user.id, user.id, 'another runtime must consume the Redis session');
  if (shared) GameSessionDataSchema.free(shared);
  assert.equal(await first.getSessionData('session-a'), undefined, 'session handoff must be single-use');

  assert.equal(await first.allowSessionAttempt('127.0.0.1', 2), true);
  assert.equal(await second.allowSessionAttempt('127.0.0.1', 2), true);
  assert.equal(await first.allowSessionAttempt('127.0.0.1', 2), false);

  const fallback = new GameSession(logger, true, 60_000, new FailingRedis(), 'test');
  await fallback.bindUserSession(user, '127.0.0.2', 'session-b', '', 'fp', 'CN');
  const local = await fallback.getSessionData('session-b');
  assert.equal(local?.user.id, user.id, 'Redis outage must retain the in-memory session path');
  if (local) GameSessionDataSchema.free(local);
}

async function checkBuildCache() {
  const redis = new MemoryRedis();
  const first = new RedisBuildCache(new MemoryBuildCache(), redis, 240, 'test', pinoLogger);
  const second = new RedisBuildCache(new MemoryBuildCache(), redis, 240, 'test', pinoLogger);
  let builds = 0;
  const build = async () => {
    builds += 1;
    await new Promise((resolve) => setTimeout(resolve, 25));
    return 'result-hash';
  };
  const results = await Promise.all([
    first.store('prebake', ['same-project'], build),
    second.store('prebake', ['same-project'], build),
  ]);
  assert.deepEqual(results, ['result-hash', 'result-hash']);
  assert.equal(builds, 1, 'Redis lock must deduplicate concurrent builds');
  const third = new RedisBuildCache(new MemoryBuildCache(), redis, 240, 'test', pinoLogger);
  assert.equal(await third.retrieve('prebake', ['same-project']), 'result-hash');
}

async function main() {
  await checkSessions();
  await checkBuildCache();
  process.stdout.write('Redis runtime checks passed.\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
