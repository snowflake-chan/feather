import { ContentServer, Hash } from './index';
export declare class FileSystemContentServer implements ContentServer {
    private readonly directory;
    constructor(directory: string);
    init(): Promise<void>;
    store(content: Uint8Array): Promise<Hash>;
    retrieve(hash: Hash): Promise<Uint8Array | undefined>;
}
