import type { Logger } from 'pino';
import { ContentServer, Hash, OssCdnPath, OssStoreType } from './index';
import { Semaphore } from '@box/utils/semaphore';
export declare class ObjectStoreService implements ContentServer {
    semaphore: Semaphore;
    logger: Logger;
    retryCount: number;
    private parsedUri;
    private parsedCdnPath;
    constructor(spec: {
        logger: Logger;
        uri: string;
        maxConcurrency: number;
        cdnPath: string;
    });
    private parseUrl;
    init(): Promise<void>;
    store(_content: Uint8Array, spec?: {
        ossStoreType?: OssStoreType;
        contentType?: string;
    }): Promise<Hash>;
    retrieve(hash: string, options?: {
        ossCdnPath?: OssCdnPath;
    }): Promise<Uint8Array>;
}
