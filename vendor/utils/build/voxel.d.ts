import { MuReadStream, MuWriteStream } from '@box/mudb/stream';
import { vec3 } from 'gl-matrix';
export type BoxBoundary = {
    start: vec3;
    end: vec3;
};
export declare class VoxelView {
    data: Uint16Array;
    shape: [number, number, number];
    stride: [number, number, number];
    offset: number;
    dataStart?: [number, number, number];
    dataEnd?: [number, number, number];
    dataStride?: [number, number, number];
    constructor(data: Uint16Array, shape: [number, number, number], stride: [number, number, number], offset: number, dataStart?: [number, number, number], dataEnd?: [number, number, number], dataStride?: [number, number, number]);
    getVoxelByPtr: (ptr: number) => number;
    getVoxel(x: number, y: number, z: number): number;
    getVoxels(): vec3[];
    getDimension(): vec3;
    index(x: number, y: number, z: number): number;
    contains(x: number, y: number, z: number, start: [number, number, number], end: [number, number, number]): boolean;
    setVoxelByPtr: (ptr: number, b: number) => number;
    setVoxel(x: number, y: number, z: number, b: number): number;
    setVoxelRotate(x: number, y: number, z: number, rotate: number): number;
    slice(lo: [number, number, number], hi: [number, number, number]): VoxelView;
    transpose(px: number, py: number, pz: number): VoxelView;
    step(sx: number, sy: number, sz: number): VoxelView;
    copy(other: VoxelView): void;
    fill(b: number): void;
    equals(other: VoxelView): boolean;
    clear(): void;
    destroy(): void;
    getStartPosition(): vec3 | undefined;
}
export declare function getBoxBoundary(voxels: VoxelView): BoxBoundary;
export declare function allocVoxels(nx: number, ny: number, nz: number, dataStart?: [number, number, number], dataEnd?: [number, number, number]): VoxelView;
export declare function freeVoxels(voxels: VoxelView): void;
export declare function cloneVoxels(voxels: VoxelView): VoxelView;
export declare function storeVoxels(voxels: VoxelView, ws: MuWriteStream, isEmpty: boolean): void;
export declare function restoreVoxels(rs: MuReadStream): {
    voxels: VoxelView;
    isEmpty: boolean;
};
export declare function flipVoxels(voxels: VoxelView, axis: 'X' | 'Y' | 'Z', boundary?: BoxBoundary): void;
export declare function isEmptyVoxels(voxelView: VoxelView): boolean;
//# sourceMappingURL=voxel.d.ts.map