import { ContentServer, Hash, OssCdnPath, OssStoreType } from '.';
export declare class ContentPerf implements ContentServer {
    content: ContentServer;
    storeBytes: number;
    retrieveBytes: number;
    cacheMiss: number;
    constructor(content: ContentServer);
    init(): Promise<void>;
    store(content: Uint8Array, options?: {
        ossStoreType?: OssStoreType;
    }): Promise<Hash>;
    retrieve(hash: Hash, options?: {
        ossCdnPath?: OssCdnPath;
    }): Promise<Uint8Array | undefined>;
}
