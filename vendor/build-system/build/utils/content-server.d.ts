import type { Logger } from 'pino';
import { ContentSplitter } from '@box/content-server/content-split';
import { ObjectStoreService } from '@box/content-server/object-store-service';
export declare function createContentServer(logger: Logger, config: {
    contentHostURL: string;
    maxIPFSConnections: number;
}): ContentSplitter;
export declare function createOSSContentServer(logger: Logger, config: {
    ossUploadURL: string;
    maxIPFSConnections: number;
    ossCdnURL: string;
}): ObjectStoreService;
//# sourceMappingURL=content-server.d.ts.map