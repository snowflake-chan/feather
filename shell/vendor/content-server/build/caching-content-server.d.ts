import type { Logger } from 'pino';
import { ContentServer, Hash } from './index';
import { ContentCache } from './content-cache';
export declare class CachingContentServer implements ContentServer {
    private logger;
    private baseServer;
    private cache;
    private maxCacheItemSize;
    private _mutex;
    private _waitHash;
    private _signalHash;
    constructor(logger: Logger, baseServer: ContentServer, cache?: ContentCache, maxCacheItemSize?: number);
    init(): Promise<void>;
    store(content: Uint8Array): Promise<string>;
    retrieve(hash: Hash): Promise<Uint8Array>;
}
