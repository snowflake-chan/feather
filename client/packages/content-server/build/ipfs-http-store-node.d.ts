import * as http from 'http';
import * as https from 'https';
import type { Logger } from 'pino';
import { ContentServer, Hash } from './index';
import { Semaphore } from '@box/utils/semaphore';
export declare class GoIPFSStore implements ContentServer {
    semaphore: Semaphore;
    protocol: string;
    hostname: string;
    port: number;
    apiPrefix: string;
    server: typeof http | typeof https;
    logger: Logger;
    pin: boolean;
    retryCount: number;
    constructor(spec: {
        logger: Logger;
        uri: string;
        pin: boolean;
        maxConcurrency: number;
    });
    init(): Promise<void>;
    store(_content: Uint8Array): Promise<Hash>;
    retrieve(hash: Hash): Promise<Uint8Array | undefined>;
}
