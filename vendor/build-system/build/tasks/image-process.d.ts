import { BuildSystem } from '../type';
import { Hash } from '@box/content-server';
export declare function genThumbnail(bs: BuildSystem, hash: Hash, size: number): Promise<string>;
export declare function optimizeAvatar(bs: BuildSystem, url: string, size: number): Promise<string>;
export declare function applyLUT(bs: BuildSystem, imageHash: Hash, lutHash: Hash): Promise<string>;
export declare function applyLutDir(bs: BuildSystem, previewImage: Hash, luts: Hash, mergeDirs?: boolean): Promise<string>;
//# sourceMappingURL=image-process.d.ts.map