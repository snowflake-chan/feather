import { ContentServer } from '.';
export declare class ContentSplitter implements ContentServer {
    content: ContentServer;
    blockSize: number;
    hashLength: number;
    constructor(content: ContentServer, blockSize?: number, hashLength?: number);
    init(): Promise<void>;
    store(bytes: Uint8Array): Promise<string>;
    retrieve(hash: string): Promise<Uint8Array | undefined>;
}
