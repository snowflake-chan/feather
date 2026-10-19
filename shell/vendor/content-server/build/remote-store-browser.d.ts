import { ContentServer, Hash } from './index';
export declare class RemoteStoreBrowser implements ContentServer {
    private storeURL;
    private retrieveURL;
    constructor(cdnPath: string, ipfsPath?: string);
    init(): Promise<void>;
    store(raw_content: Uint8Array): Promise<Hash>;
    retrieve(hashOfBlob: Hash): Promise<Uint8Array | undefined>;
}
