import { ContentServer } from '@box/content-server';
import { Logger } from '@box/utils/logger';
export type UploadDirType = {
    [name: string]: string | UploadDirType;
};
/**
 * helper function, uploads a directory completely into IPFS
 *
 * return the structure of the directory
 */
export declare function uploadDirectory(root: string, content: ContentServer): Promise<UploadDirType>;
export declare function watchUploadDirectory(root: string, content: ContentServer, logger: Logger, onChange: (dir: UploadDirType) => Promise<void>): void;
export declare function watchFile(logger: Logger, file: string, onChange: (buffer: Buffer) => Promise<void>): void;
export declare function watchNewFiles(logger: Logger, directory: string, onChange: (filePath: string) => Promise<void>): void;
//# sourceMappingURL=upload-dir.d.ts.map