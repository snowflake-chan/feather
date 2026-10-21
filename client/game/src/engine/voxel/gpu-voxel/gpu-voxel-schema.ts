import {
  MuStruct,
  MuInt32,
  MuBoolean,
  MuFloat64,
  MuArray,
  MuSchema,
  MuVarint,
  MuUint8,
  MuASCII,
} from '@box/mudb/schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';

import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { ChunkVisibilityFlags } from '../visibility-flags';
import {
  REWGPUBufferSchema,
  REWGPUIndexBufferDesSchema,
  REWGPUTexture2DSchema,
} from '../../utils/rewgpu-schema';
import { GPUGameTextureSchema } from '../../gpu/schema/gpu-texture';

export const GPUVoxelGeomSchema = new MuStruct({
  index: Vec3Schema,
  count: new MuInt32(),
  indexBufferDescriptor: REWGPUIndexBufferDesSchema,
  distance: new MuFloat64(1),

  vertBuffer: REWGPUBufferSchema,

  minX: new MuInt32(0),
  minY: new MuInt32(0),
  minZ: new MuInt32(0),
  maxX: new MuInt32(0),
  maxY: new MuInt32(0),
  maxZ: new MuInt32(0),
});

export type GPUVoxelGeom = typeof GPUVoxelGeomSchema.identity;

export const GPUVoxelChunkSchema = new MuStruct({
  index: Vec3Schema,

  visible: new MuBoolean(false),

  posX: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_X),
  posY: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_Y),
  posZ: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_Z),
  negX: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_X),
  negY: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_Y),
  negZ: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_Z),

  geom: GPUVoxelGeomSchema,
  alphaGeom: GPUVoxelGeomSchema,
  fluidGeom: GPUVoxelGeomSchema,
});

export type GPUVoxelChunk = typeof GPUVoxelChunkSchema.identity;

const GeomRefSchema = <MuSchema<GPUVoxelGeom[]>>(
  new MuArray(new MuRefSchema<GPUVoxelGeom>(), Infinity)
);

export const GPUVoxelChunkListSchema = new MuArray(
  GPUVoxelChunkSchema,
  Infinity,
);

export const GPUVoxelStateSchema = new MuStruct({
  // chunks
  nx: new MuInt32(),
  ny: new MuInt32(),
  nz: new MuInt32(),
  chunks: GPUVoxelChunkListSchema,
  chunksDirty: new MuBoolean(true),

  // frame state
  parallaxChunks: GeomRefSchema,
  parallaxChunksKey: new MuASCII(),
  noParallaxChunks: GeomRefSchema,
  noParallaxChunksKey: new MuASCII(),
  alphaParallaxChunks: GeomRefSchema,
  alphaParallaxChunksKey: new MuASCII(),
  alphaNoParallaxChunks: GeomRefSchema,
  alphaNoParallaxChunksKey: new MuASCII(),
  fluidChunks: GeomRefSchema,
  fluidChunksKey: new MuASCII(),

  // shadow passes
  shadowChunks: GeomRefSchema,
  shadowChunksKey: new MuASCII(),

  // voxel textures
  radius: new MuVarint(0),
  mipLevelCount: new MuVarint(0),
  colorAtlasTexture: GPUGameTextureSchema,
  materialAtlasTexture: GPUGameTextureSchema,
  waterBumpTexture: GPUGameTextureSchema,

  // buffered worker writes
  workerWrites: new MuArray(new MuVarint(), Infinity),
  updateInProgress: new MuBoolean(false),
  needsRemesh: new MuBoolean(false),

  // height map
  terrainHeightTex: REWGPUTexture2DSchema,
  terrainTexDirty: new MuBoolean(true),
});

export type GPUVoxelState = typeof GPUVoxelStateSchema.identity;
