import { VoxelView } from '@box/utils/voxel';
import { Texture, TexturePositions } from './texture';
import { MeshDataSchema, MeshTextureSchema } from './schema';
interface UnpackedTexture {
    hash: string;
    rotation: number;
    flipped: boolean;
}
interface Rectangle {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    texture: UnpackedTexture;
}
export declare function voxelToRectangles(voxel: VoxelView, textureMap: Map<string, Texture>, compress?: boolean, extendEdge?: boolean, surfaceOnly?: boolean, squashDimension?: number): Rectangle[][];
export declare function getTexture(textureMap: Map<string, Texture>): {
    texture: Texture;
    positions: Map<Texture, import("./texture").Rect>;
};
export declare function textureToMeshTexture(texture: Texture, palette: number[] | [number, number, number][], emissivePalette?: number[]): Promise<import("@box/mudb/schema/struct").Struct<{
    palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
    data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
    width: import("@box/mudb/schema").MuVarint;
}>>;
export declare function rectanglesToMeshData(rectangles: Rectangle[][], textureMap: Map<string, Texture>, positions: TexturePositions, extendEdge?: boolean): import("@box/mudb/schema/struct").Struct<{
    vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
    sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
    uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
    uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
}>[];
export declare class Mesher {
    private compress;
    private extendEdge;
    private surfaceOnly;
    textureMap: Map<string, Texture>;
    models: Rectangle[][][];
    private textureCache;
    constructor(compress?: boolean, extendEdge?: boolean, surfaceOnly?: boolean);
    addModel(voxel: VoxelView, squashDimension?: number): void;
    getTextureData(): {
        texture: Texture;
        positions: Map<Texture, import("./texture").Rect>;
    };
    getMeshes(extendEdge?: boolean): import("@box/mudb/schema/struct").Struct<{
        vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
    }>[][];
    getMesh(index: number, extendEdge?: boolean): import("@box/mudb/schema/struct").Struct<{
        vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
    }>[];
    getTexture(palette: number[] | [number, number, number][], emissivePalette: number[]): Promise<import("@box/mudb/schema/struct").Struct<{
        palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        width: import("@box/mudb/schema").MuVarint;
    }>>;
}
export declare function voxelsToMeshes(voxels: VoxelView[], palette: number[] | [number, number, number][], emissivePalette: number[], compress?: boolean, extendEdge?: boolean): Promise<{
    meshes: import("@box/mudb/schema/struct").Struct<{
        vertices: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        sizes: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvs: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        uvFlags: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint8>;
    }>[][];
    texture: import("@box/mudb/schema/struct").Struct<{
        palette: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuUint32>;
        data: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuVarint>;
        width: import("@box/mudb/schema").MuVarint;
    }>;
}>;
export declare function unpackTextureData(texture: typeof MeshTextureSchema.identity, channels: number[]): Uint8Array;
export declare function unpackMeshData(meshData: typeof MeshDataSchema.identity, VertexDataType?: typeof Uint8Array | typeof Uint16Array, UVDataType?: typeof Uint8Array | typeof Uint16Array): {
    meshData: Uint16Array | Uint8Array;
    uvData: Uint16Array | Uint8Array;
    count: number;
    lox: number;
    loy: number;
    loz: number;
    hix: number;
    hiy: number;
    hiz: number;
};
/**
 * 通过矩形二维数组计算顶点总数
 * 这部分计算逻辑参照：
 * - rectanglesToMeshData更新sizes数组
 * - unpackMeshData计算count
 */
export declare function getVertexCount(rectangles: Rectangle[][]): number;
export {};
