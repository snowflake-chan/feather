import { createClient } from 'redis-mock';

import { RedisCache, RedisConfig } from './redis-cache';

// We use single connection for Redis, so do nothing here, which not like TestDatabase.
export class TestRedisCache extends RedisCache {
  constructor() {
    super();
  }
  // TODO ensure client is not used after quit is called
  public async init(config: RedisConfig) {
    this._client = createClient();
  }
}
