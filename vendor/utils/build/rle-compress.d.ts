import { MuWriteStream, MuReadStream } from '@box/mudb/stream';
import type { vec3 } from 'gl-matrix';
import type { VoxelView } from './voxel';
export declare function compress(voxels: VoxelView, out: MuWriteStream): boolean;
export declare function decompress(inp: MuReadStream, voxels: VoxelView): boolean;
export declare function sectionDecompress(rle: Uint8Array | number[], voxels: VoxelView, start: vec3, end: vec3): boolean;
export declare function old_decompress(rle: Uint8Array | number[], voxels: VoxelView): boolean;
//# sourceMappingURL=rle-compress.d.ts.map