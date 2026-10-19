import type { Logger } from 'pino';
import type { OssCdnPath, OssStoreType } from '@box/content-server';
import { tasks } from './task-index';
import { BuildSystem } from './build-system';
export { BuildSystem } from './build-system';
export type Hash = string;
export interface BuildSystemAPI {
    build<T extends keyof Tasks>(taskName: T, ...params: TaskParams<Tasks[T]>): Promise<Hash>;
    retrieveJSON: (hash: string) => Promise<any>;
    retrieveContent: (hash: string) => Promise<Uint8Array>;
    retrieveContentFromS3: (hash: string, options?: {
        ossCdnPath?: OssCdnPath;
    }) => Promise<Uint8Array>;
    storeJSON: (data: any) => Promise<string>;
    storeContent: (data: Uint8Array) => Promise<string>;
    storeContentToS3: (data: Uint8Array, options?: {
        ossStoreType?: OssStoreType;
    }) => Promise<string>;
    nextUidListUsingGet: (query: {
        num: number;
    }) => Promise<string[]>;
    logger: Logger;
}
export interface BuildCacheAPI {
    retrieve(name: string, params: any[]): Promise<string>;
    invalidate(name: string, params: any[], result?: string): Promise<void>;
    store(name: string, params: any[], result: () => Promise<string>): Promise<string>;
}
export type Task = (buildSystem: BuildSystem, ...args: any[]) => Promise<string>;
export interface TaskObject {
    [name: string]: Task;
}
export type Tasks = typeof tasks;
export type TaskParams<T extends Task> = T extends (bs: BuildSystem, ...args: infer R) => any ? R : any[];
//# sourceMappingURL=type.d.ts.map