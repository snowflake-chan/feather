import { BlockInfo } from '@box/schema/voxel/block-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { VoxelCollisionBox } from '@box/schema/utils/rbush-schema';

export const WorkerSchema = new MuRefSchema<Worker>();
export enum VoxelMessageType {
  RESET_VOXELS,
  RETURN_MEMORY,
  POLL,
  REMESH_ALL,
  UPDATE_LIGHTMAP,
  SET_VOXEL_INVISIBLE,
  CALC_VOXEL_BY_BOXES,
}

export type VoxelResetMessage = {
  type: VoxelMessageType.RESET_VOXELS;
  shape: number[];
  stride: number[];
  offset: number;
  data: ArrayBuffer;
  dataStart?: [number, number, number];
  dataEnd?: [number, number, number];
  dataStride?: [number, number, number];
  blockInfo: BlockInfo;
  innerAO: boolean;
};

export type VoxelReturnMemoryMessage = {
  type: VoxelMessageType.RETURN_MEMORY;
  data: ArrayBuffer;
};

export type VoxelPollMessage = {
  type: VoxelMessageType.POLL;
  data: ArrayBuffer;
};

export type VoxelRemeshMessage = {
  type: VoxelMessageType.REMESH_ALL;
};

export type VoxelUpdateLightMessage = {
  type: VoxelMessageType.UPDATE_LIGHTMAP;
  eyeX: number;
  eyeY: number;
  eyeZ: number;
  buffer: ArrayBuffer;
  size: number;
};

export type VoxelInvisible = {
  type: VoxelMessageType.SET_VOXEL_INVISIBLE;
  value: boolean;
};

export type ChunkBoxes = {
  idx: number;
  chunkOffset: number;
  boxes: VoxelCollisionBox[];
};
export type VoxelCalcVoxelByBoxes = {
  type: VoxelMessageType.CALC_VOXEL_BY_BOXES;
  dataStart: [number, number, number];
  dataEnd: [number, number, number];
  chunkBoxes: ChunkBoxes[];
};

export type VoxelMessage =
  | VoxelResetMessage
  | VoxelReturnMemoryMessage
  | VoxelPollMessage
  | VoxelRemeshMessage
  | VoxelUpdateLightMessage
  | VoxelInvisible
  | VoxelCalcVoxelByBoxes;

export enum WorkerMessageType {
  UPDATE_CHUNK,
  UPDATE_HEIGHTMAP,
  CLEAR_CHUNK,
  UPDATE_LIGHTMAP,
  RETURN_MEMORY,
  POLL,
  LOG,
  UPDATE_VOXEL_VIEW,
}

export interface BoundingBox {
  minX: number;
  minY: number;
  minZ: number;

  maxX: number;
  maxY: number;
  maxZ: number;
}

export type WorkerUpdateChunkMessage = {
  type: WorkerMessageType.UPDATE_CHUNK;
  ix: number;
  iy: number;
  iz: number;
  meshStart: number;
  meshEnd: number;
  meshBounds: BoundingBox;
  alphaStart: number;
  alphaEnd: number;
  alphaBounds: BoundingBox;
  fluidStart: number;
  fluidEnd: number;
  fluidBounds: BoundingBox;

  // visibility flags
  posX: number;
  negX: number;
  posY: number;
  negY: number;
  posZ: number;
  negZ: number;

  data: ArrayBuffer;
};

export type WorkerUpdateHeightMessage = {
  type: WorkerMessageType.UPDATE_HEIGHTMAP;
  x: number;
  y: number;
  width: number;
  height: number;
  data: ArrayBuffer;
};

export type WorkerClearChunkMessage = {
  type: WorkerMessageType.CLEAR_CHUNK;
  ix: number;
  iy: number;
  iz: number;
  solid: boolean;
};

export type WorkerUpdateLightMessage = {
  type: WorkerMessageType.UPDATE_LIGHTMAP;
  ambient: number;
  buffer: ArrayBuffer;
  size: number;
};

export type WorkerPollMessage = {
  type: WorkerMessageType.POLL;
};

export type WorkerLogMessage = {
  type: WorkerMessageType.LOG;
  message: object;
};

export type WorkerUpdateVoxelViewMessage = {
  type: WorkerMessageType.UPDATE_VOXEL_VIEW;
  data: ArrayBuffer;
  dataStart: [number, number, number];
  dataEnd: [number, number, number];
};

export type WorkerMessage =
  | WorkerUpdateChunkMessage
  | WorkerUpdateLightMessage
  | WorkerClearChunkMessage
  | WorkerPollMessage
  | WorkerUpdateHeightMessage
  | WorkerLogMessage
  | WorkerUpdateVoxelViewMessage;
