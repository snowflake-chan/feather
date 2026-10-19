import { VoxelView, BoxBoundary } from './voxel';
import { vec3 } from 'gl-matrix';
type GetMaterial = number | ((i: number, j: number, k: number) => number);
type OnCondition = (i: number, j: number, k: number) => boolean;
export interface TempGeometry {
    lo: vec3;
    hi: vec3;
    positions: vec3[];
    elements: vec3[];
    normals: vec3[];
}
export declare enum WorkAction {
    bakeAoData = 0,
    syncVoxel = 1,
    updateVoxel = 2,
    sendPoints = 3,
    clearData = 4,
    changeSize = 5
}
export declare enum Actions {
    Attach = 0,
    Erase = 1,
    Paint = 2,
    Select = 3,
    Translate = 4,
    ColorSelect = 5,
    PickColor = 6,
    HollowOut = 7,
    FillSameColorSpace = 8,
    Extrude = 9
}
export declare enum EditingMode {
    line = 0,
    center = 1,
    box = 2,
    voxel = 3,
    face = 4,
    rect = 5
}
export declare enum colorSelectOptions {
    volume = 0,
    face = 1,
    all = 2
}
export declare enum CenterModeOption {
    square = 0,
    circle = 1
}
export declare enum FaceModeColorOption {
    voxelColor = 0,
    currentColor = 1
}
export declare enum FaceModeSelectOption {
    geometry = 0,
    colorGeometry = 1
}
export declare function generateCuboid(a: vec3, b: vec3, isVoxle: boolean, outerNormal: boolean, range?: vec3 | boolean): TempGeometry;
export declare function boundary(a: vec3, b: vec3, minima: vec3, maxima: vec3): BoxBoundary;
export declare function surfaceScale(normal: vec3, surface: vec3[], scale: number): vec3[];
export declare function hex2rgb(hex: string): number[];
export declare function absMod(n: number, mod: number): number;
export declare function traverseVoxels(voxel: VoxelView, start: vec3 | vec3, end: vec3 | vec3, operation: (i: number, j: number, k: number, data: number, ptr: number) => void): void;
export declare function inRange(position: vec3, minimum: vec3, maximum: vec3): boolean;
export declare function adjacentVoxels(src: VoxelView, out: VoxelView, currentPos: vec3, value: number, currentMaterial: number, axis: vec3, start: vec3, end: vec3, normal?: vec3): void;
export declare function drawVoxelSphere(voxels: VoxelView, center: vec3 | vec3, radius: number): void;
export declare function drawVoxelCircle(voxels: VoxelView, color: number, center: vec3 | vec3, radius: number, N_axis: string | vec3 | vec3, visitor: (x: number, y: number, z: number) => void): void;
export declare function drawVoxelSquare(voxels: VoxelView, color: number, center: vec3 | vec3, halfEdgeLen: number, N_axis: string | vec3 | vec3, force?: boolean): void;
export declare function calcRadius(N_axis: vec3, center: vec3, pos: vec3): number;
export declare function calcHalfEdgeLen(N_axis: vec3, center: vec3, pos: vec3): number;
export declare function drawVoxelLine(startP: vec3 | vec3, endP: vec3 | vec3, visitor: (x: number, y: number, z: number) => void): void;
export declare function cloneArray(x: number[][]): number[][];
export declare function newBundle(voxel: VoxelView, prevStart: vec3, prevEnd: vec3, start: vec3, end: vec3, eliminateMaterial: GetMaterial, newMaterial: GetMaterial, condition?: OnCondition): VoxelView;
export declare function fillSpace(voxel: VoxelView, start: vec3, end: vec3, material: GetMaterial, condition?: OnCondition): void;
export declare function allocEmptyVoxels(x: number, y: number, z: number): VoxelView;
export declare function getElementPos(e: HTMLElement): {
    x: number;
    y: number;
};
export declare function mergeVoxel(a: VoxelView, b: VoxelView, start: vec3, end: vec3, type?: number): Function;
export declare function surfaceByNormalAndPoint(p: vec3, q: vec3): vec3[];
export {};
//# sourceMappingURL=helper.d.ts.map