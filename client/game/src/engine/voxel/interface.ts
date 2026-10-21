import { GameClientState } from '../game-client-schema';
import { GLVoxelState } from './gl-voxel/gl-voxel-schema';
import { GPUVoxelState } from './gpu-voxel/gpu-voxel-schema';
import { BoundingBox } from './voxel-worker-schema';

type ArrayElement<T> = T extends (infer ElementType)[] ? ElementType : never;

export interface VoxelTypeMap {
  gl: GLVoxelState;
  gpu: GPUVoxelState;
}

export interface VoxelRenderer<K extends keyof VoxelTypeMap> {
  getVoxelState: (state: GameClientState) => VoxelTypeMap[K];
  updateChunk: (
    state: GameClientState,
    chunk: ArrayElement<VoxelTypeMap[K]['chunks']>,
    meshData: Uint8Array,
    alphaData: Uint8Array,
    fluidData: Uint8Array,
    meshBounds: BoundingBox,
    alphaBounds: BoundingBox,
    fluidBounds: BoundingBox,
  ) => void;
  clearChunk: (
    state: GameClientState,
    chunk: ArrayElement<VoxelTypeMap[K]['chunks']>,
    solid: boolean,
  ) => void;
  resetChunks: (state: GameClientState, mesh: VoxelTypeMap[K]) => void;
  initChunks: (
    state: GameClientState,
    mesh: VoxelTypeMap[K],
    cx: number,
    cy: number,
    cz: number,
  ) => void;
  updateHeightmap: (
    state: GameClientState,
    x: number,
    y: number,
    width: number,
    height: number,
    data: ArrayBuffer,
  ) => void;
  clearHeightTexture: (state: GameClientState) => void;
  destroyChunks: (state: GameClientState) => void;
}
