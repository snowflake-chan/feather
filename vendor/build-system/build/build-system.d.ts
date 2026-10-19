import type { Logger } from 'pino';
import { MuSchema } from '@box/mudb/schema';
import { BuildSystemAPI, BuildCacheAPI, Tasks, TaskParams } from './type';
import { ContentServer, OssCdnPath, OssStoreType } from '@box/content-server';
export declare class BuildSystem implements BuildSystemAPI {
    cache: BuildCacheAPI;
    contentServer: ContentServer;
    ossContentServer: ContentServer;
    nextUidListUsingGet: (query: {
        num: number;
    }) => Promise<string[]>;
    logger: Logger;
    debug: boolean;
    tasks: Tasks;
    constructor(cache: BuildCacheAPI, contentServer: ContentServer, ossContentServer: ContentServer, nextUidListUsingGet: (query: {
        num: number;
    }) => Promise<string[]>, logger: Logger, debug?: boolean);
    retrieveJSON(hash: string): Promise<any>;
    retrieveContent(hash: string): Promise<Uint8Array>;
    retrieveContentFromS3(hash: string, options?: {
        ossCdnPath?: OssCdnPath;
    }): Promise<Uint8Array>;
    retrieveBinarySchema<T>(schema: MuSchema<T>, hash: string): Promise<T>;
    retrieveJSONSchema<T>(schema: MuSchema<T>, hash: string): Promise<T>;
    storeBinarySchema<T>(schema: MuSchema<T>, value: MuSchema<T>['identity']): Promise<string>;
    storeContent(data: Uint8Array): Promise<string>;
    storeContentToS3(data: Uint8Array, options?: {
        ossStoreType?: OssStoreType;
    }): Promise<string>;
    storeJSON(data: any): Promise<string>;
    build<T extends keyof Tasks>(name: T, ...params: TaskParams<Tasks[T]>): Promise<string>;
    addTasks(task: any): Promise<void>;
}
//# sourceMappingURL=build-system.d.ts.map