import { NodeType } from './const';
export interface VbProjectData {
    HEXCOLORS: (string | null)[][];
    PBRATTRBS: (SerializedVec3 | null)[][];
    TR: SerializedVec2[][];
    CURRENTCOLORINDEX: number;
    ENCODEVOXELS: number[];
}
export interface CompactModelRGB {
    r: number;
    g: number;
    b: number;
}
export interface VbFileData extends VbProjectData {
    filename: string;
}
export type SerializedVec2 = [number, number];
export type SerializedVec3 = [number, number, number];
export type SerializedQuat = [number, number, number, number];
export interface VoxaProjectDataV1 {
    version: number;
    nodes: Nodes;
    voxels: Voxels;
    palette: PaletteData;
}
export type Nodes = Record<string, Node>;
export type Node = RootNode | SkinPartNode | GroupNode;
interface BaseNodeData {
    id: string;
    type: NodeType;
    name: string;
    parentId?: string;
    childrenIds?: string[];
}
interface NodeData extends BaseNodeData {
    pivot: SerializedVec3;
    position: SerializedVec3;
    quaternion: SerializedQuat;
}
export interface RootNode extends BaseNodeData {
    type: NodeType.Root;
}
export interface GroupNode extends NodeData {
    type: NodeType.Group;
}
export interface SkinPartNode extends NodeData {
    type: NodeType.SkinPart;
    voxelId?: string;
}
export type Voxels = Record<string, VoxelData>;
export interface VoxelData {
    id: string;
    encodedView: number[];
    localPalette: number[];
}
export interface PaletteData {
    items: PaletteItem[];
    groups: Record<string, PaletteGroup>;
    groupList: string[];
}
export type PaletteItem = {
    id: string;
    color: PaletteColor;
    hsv: PaletteHSV;
    material: PaletteMaterial;
};
export type PaletteColor = {
    r: number;
    g: number;
    b: number;
};
export type PaletteHSV = [number, number, number];
export type PaletteMaterial = {
    emissive: number;
};
export type PaletteGroup = {
    id: string;
    name: string;
    colorIndices: number[];
};
export type Meshes = Record<string, number[]>;
export type VoxaModelV1 = {
    bounds: SerializedVec3;
    meshes: Meshes;
};
export type VoxaDataV1 = {
    project: VoxaProjectDataV1;
    model: VoxaModelV1;
};
export {};
