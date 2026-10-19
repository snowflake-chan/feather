import { NDArrayLikeImage } from '../../utils/pixels';
import { BuildSystem } from '../../type';
import { BlockSoundGroup, BlockCategory } from '@box/schema/voxel/block-schema';
export declare const BLOCK_BUMP_SHIFT = 6;
export declare const BLOCK_BUMP_SIZE: number;
export declare const BLOCK_COLOR_SHIFT = 4;
export declare const BLOCK_COLOR_SIZE: number;
export declare const blankImage: NDArrayLikeImage;
export declare const blankBumpImage: NDArrayLikeImage;
export declare class VoxelTextureInfo {
    id: number;
    row: number;
    column: number;
    animLength: number;
    color: NDArrayLikeImage[];
    emissive: NDArrayLikeImage[];
    metalness: NDArrayLikeImage[];
    smoothness: NDArrayLikeImage[];
    bump: NDArrayLikeImage[];
    constructor(id: number);
}
export declare class VoxelBlockInfo {
    id: number;
    name: string;
    textureId: number[];
    transparent: boolean;
    friction: number;
    mass: number;
    restitution: number;
    fluid: boolean;
    fluidColor: number[];
    fluidExtinction: number;
    velocity: number[];
    soundGroup: BlockSoundGroup;
    category: BlockCategory;
    emissive: number;
    averageColor: number[];
    constructor(id: number, name: string, textureId: number[], soundGroup: string, category: string, transparent: boolean, emissive: number[], friction: number, mass: number, restitution: number, fluid: boolean, fluidColor: number[], fluidExtinction: number, velocity: number[]);
}
export declare class VoxelAssetSpec {
    blocks: VoxelBlockInfo[];
    textures: VoxelTextureInfo[];
    atlasShift: number;
    atlasRadius: number;
    colorAtlas: NDArrayLikeImage[];
    bumpAtlas: NDArrayLikeImage[];
    materialAtlas: NDArrayLikeImage[];
}
export declare function storePixels(buildSystem: BuildSystem, image: NDArrayLikeImage): Promise<string>;
export declare function storePixelsOpt(buildSystem: BuildSystem, image: NDArrayLikeImage): Promise<string>;
export declare function readPixels(buildSystem: BuildSystem, hash: string): Promise<NDArrayLikeImage>;
//# sourceMappingURL=voxel-utils.d.ts.map