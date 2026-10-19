import { RedisClient, ClientOpts, createClient } from 'redis';
import { Semaphore } from '../semaphore';

export interface RedisConfig {
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_TLS?: boolean;
  REDIS_DB?: number;
}

export interface SubscribeCallback {
  (message: string): any;
}

export class RedisCache {
  /**
   * This must only be accessed by TestRedisCache
   */
  public _client: RedisClient | undefined;
  private subCallbacks: { [channel: string]: SubscribeCallback[] } = {};
  private subscribeMutex = new Semaphore();
  constructor() {}

  public async init(config: RedisConfig) {
    const redisClientOpts: ClientOpts = {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    };

    if (config.REDIS_PASSWORD !== '') {
      redisClientOpts.password = config.REDIS_PASSWORD;
    }
    if (config.REDIS_TLS) {
      redisClientOpts.tls = true;
    }
    if (config.REDIS_DB !== undefined) {
      redisClientOpts.db = config.REDIS_DB;
    }

    this._client = createClient(redisClientOpts);
    this._client.on('message', (channel, message) => {
      const cbs = this.subCallbacks[channel];
      if (cbs && cbs.length > 0) {
        for (const cb of cbs) {
          cb(message);
        }
      }
    });
  }

  public quit() {
    if (this._client !== undefined) {
      this._client.quit();
    }
  }

  public async get(key: string): Promise<string | undefined> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.get(key, (err, result) => {
        if (err !== null && err !== undefined) {
          reject(err);
          return;
        }

        if (result === null) {
          // Convert null to undefined
          resolve(void 0);
        } else {
          resolve(result);
        }
      });
    });
  }

  public async keys(key: string): Promise<string[]> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.keys(key, (err, result) => {
        if (err !== null && err !== undefined) {
          reject(err);
          return;
        }
        resolve(result || []);
      });
    });
  }

  public async del(key: string): Promise<void> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.del(key, (err) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async setex(
    key: string,
    seconds: number,
    value: string,
    nx = false,
  ): Promise<any> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      if (nx) {
        client.set(key, value, 'EX', seconds, 'NX', (err, res) => {
          if (err !== null && err !== undefined) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      } else {
        client.set(key, value, 'EX', seconds, (err, res) => {
          if (err !== null && err !== undefined) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      }
    });
  }

  public async expire(key: string, seconds: number): Promise<void> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.expire(key, seconds, (err) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async ttl(key: string): Promise<number> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.ttl(key, (err, ttl) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve(ttl);
        }
      });
    });
  }

  public async sadd(key: string, value: string): Promise<number> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.sadd(key, value, (err, ttl) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve(ttl);
        }
      });
    });
  }

  public async smembers(key: string): Promise<string[]> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.smembers(key, (err, list) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }

  public async setnx(key: string, value: string): Promise<number> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.setnx(key, value, (err, result) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  public async dispose(): Promise<void> {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.quit((err) => {
        if (err !== null && err !== undefined) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private requireClient(): RedisClient {
    const client = this._client;

    if (!client) {
      throw new Error(`You forgot to initialize the redis clients`);
    }

    return client;
  }

  public publish(channel: string, message: string) {
    const client = this.requireClient();
    return new Promise((resolve, reject) => {
      client.publish(channel, message, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(void 0);
        }
      });
    });
  }

  public async subscribe(channel: string, callback: SubscribeCallback) {
    if (channel in this.subCallbacks) {
      this.subCallbacks[channel].push(callback);
      return;
    }
    await this.subscribeMutex.p();
    if (channel in this.subCallbacks) {
      this.subCallbacks[channel].push(callback);
      this.subscribeMutex.v();
      return;
    }
    const client = this.requireClient();
    return new Promise<void>((resolve, reject) => {
      client.subscribe(channel, (err) => {
        if (err) {
          reject(err);
        } else {
          this.subCallbacks[channel] = [callback];
          resolve();
        }
        this.subscribeMutex.v();
      });
    });
  }

  public async unsubscribe(channel: string, callback: SubscribeCallback) {
    const cbs = this.subCallbacks[channel];
    if (cbs && cbs.length > 0) {
      const idx = cbs.indexOf(callback);
      if (idx > -1) {
        cbs.splice(idx, 1);
        if (cbs.length === 0) {
          const client = this.requireClient();
          return new Promise<boolean>((resolve, reject) => {
            client.unsubscribe(channel, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          });
        }
        return true;
      }
    }
    return false;
  }

  public async incr(key: string) {
    const client = this.requireClient();

    return new Promise((resolve, reject) => {
      client.incr(key, (err, result) => {
        if (err !== null && err !== undefined) {
          reject(err);
          return;
        }

        if (result === null) {
          resolve(void 0);
        } else {
          resolve(result);
        }
      });
    });
  }
}
