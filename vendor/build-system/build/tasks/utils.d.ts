import { BuildSystem } from '../build-system';
export declare function concat(bs: BuildSystem, ...hashes: string[]): Promise<string>;
export declare function concatValues(bs: BuildSystem, hash: string): Promise<string>;
export declare function recursivelyConcatValues(bs: BuildSystem, hash: string): Promise<string>;
export declare function removeExtensions(bs: BuildSystem, hash: string): Promise<string>;
export declare function swapExtensions(bs: BuildSystem, hash: string): Promise<string>;
export declare function copyExtensions(bs: BuildSystem, hash: string): Promise<string>;
export declare function mergeJSON(bs: BuildSystem, ...hashes: string[]): Promise<string>;
export declare function mergeDir(bs: BuildSystem, ...hashes: string[]): Promise<string>;
export declare function stripMeta(bs: BuildSystem, hash: string): Promise<string>;
export declare function calcSize(bs: BuildSystem, hash: string): Promise<string>;
export declare function addMeta(bs: BuildSystem, hash: string): Promise<string>;
export declare function flatten(bs: BuildSystem, hash: string): Promise<string>;
export declare function replacePattern(bs: BuildSystem, hash: string, pattern: string, replace: string): Promise<string>;
export declare function mapJSON(bs: BuildSystem, task: string, hash: string, ret?: string): Promise<string>;
//# sourceMappingURL=utils.d.ts.map