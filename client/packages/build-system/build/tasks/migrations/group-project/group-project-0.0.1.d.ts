import type { BuildSystem } from '../../../build-system';
declare function noMigration(bs: BuildSystem, hash: string): Promise<string>;
declare function uiTreeMigration(bs: BuildSystem, hash: string): Promise<string>;
export declare const UiTree_001: {
    name: string;
    fromVersion: string;
    toVersion: string;
    migration: typeof uiTreeMigration;
};
export declare const AudioAssets_001: {
    name: string;
    fromVersion: string;
    toVersion: string;
    migration: typeof noMigration;
};
export {};
//# sourceMappingURL=group-project-0.0.1.d.ts.map