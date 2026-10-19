import { Redis, RedisOptions } from 'ioredis';
export interface SubscribeCallback {
    (message: string): any;
}
export declare class RedisIoCache {
    redis: Redis | undefined;
    private subCallbacks;
    private subscribeMutex;
    constructor();
    init(config: RedisOptions): Promise<void>;
    isReady(): boolean;
    quit(): void;
    get(key: string): Promise<string | undefined>;
    keys(key: string): Promise<string[]>;
    del(key: string): Promise<void>;
    setex(key: string, seconds: number, value: string, nx?: boolean): Promise<any>;
    expire(key: string, seconds: number): Promise<void>;
    ttl(key: string): Promise<number>;
    sadd(key: string, value: string): Promise<number>;
    smembers(key: string): Promise<string[]>;
    setnx(key: string, value: string): Promise<number>;
    dispose(): Promise<void>;
    private requireClient;
    publish(channel: string, message: string): Promise<unknown>;
    subscribe(channel: string, callback: SubscribeCallback): Promise<void>;
    unsubscribe(channel: string, callback: SubscribeCallback): Promise<boolean>;
    incr(key: string): Promise<unknown>;
}
//# sourceMappingURL=redis-io-cache.d.ts.map