import type { Logger } from 'pino';
import { BuildSystem, BuildSystemAPI, TaskObject } from '../type';
export type Migration = (buildSystem: BuildSystem, hash: string) => Promise<string>;
export interface MigrationRaw {
    migration: Migration;
    name: string;
    fromVersion: string;
    toVersion: string;
}
export declare function migrationTaskName(name: string, fromVersion: string, toVersion: string): string;
/**
 * Compares two versions of the form `n.n.n` where n is
 * any integer. Returns -1 if the first argument is strictly
 * lower than the second argument, otherwise 1.
 */
export declare function cmpVersions(a: string, b: string): number;
type VersionMap = {
    [fromVersion: string]: string[];
};
declare class DAGStore {
    forwardMap: VersionMap;
    versions: {
        [version: string]: true;
    };
}
export declare function preprocessMigrations(mas: MigrationRaw[]): {
    migrationTasks: TaskObject;
    dags: {
        [name: string]: DAGStore;
    };
};
export declare function getMigrationPath(spec: {
    name: string;
    fromVersion: string;
    toVersion: string;
}): string[];
export declare function buildMigrate(bs: BuildSystemAPI, logger: Logger, name: string, fromVersion: string, toVersion: string, hash: string): Promise<string>;
export {};
//# sourceMappingURL=index.d.ts.map