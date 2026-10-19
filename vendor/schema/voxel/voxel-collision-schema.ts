import { MuStruct, MuInt32, MuArray, MuBoolean } from '@box/mudb/schema';
import { RBushSchema } from '../utils/rbush-schema';

export const CHUNK_SHIFT = 5;
export const CHUNK_SIZE = 1 << CHUNK_SHIFT;
export const CHUNK_MASK = CHUNK_SIZE - 1;

export const VoxelCollisionChunkSchema = new MuStruct({
  i: new MuInt32(),
  j: new MuInt32(),
  k: new MuInt32(),

  // indexes
  hasSolid: new MuBoolean(false),
  rbush: RBushSchema,

  hasFluid: new MuBoolean(false),
  fluidRBush: RBushSchema,
});

export type VoxelCollisionChunk = typeof VoxelCollisionChunkSchema.identity;

export const VoxelCollisionSchema = new MuStruct({
  chunkDimI: new MuInt32(),
  chunkDimJ: new MuInt32(),
  chunkDimK: new MuInt32(),
  chunks: new MuArray(VoxelCollisionChunkSchema, Infinity),
});

export type VoxelCollision = typeof VoxelCollisionSchema.identity;
