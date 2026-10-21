import type { BuildSystem } from '../../../build-system';
declare function noMigration(bs: BuildSystem, hash: string): Promise<string>;
export declare const UiTree_002: {
    name: string;
    fromVersion: string;
    toVersion: string;
    migration: typeof noMigration;
};
/**
 * 音频也需要migration
 * - 0.3.17补充animated字段，设置为false
 * - 0.3.13补充bounds字段
 */
declare function audioAssetsMigration(bs: BuildSystem, hash: string): Promise<string>;
export declare const AudioAssets_002: {
    name: string;
    fromVersion: string;
    toVersion: string;
    migration: typeof audioAssetsMigration;
};
export {};
//# sourceMappingURL=group-project-0.0.2.d.ts.map