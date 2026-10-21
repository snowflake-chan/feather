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
import { VERTEX_SIZE } from '../voxel-mesher';

import REGL from 'regl';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { REGLVAOSchema, REGLTexture2DSchema } from '../../utils/regl-schema';
import { GLTextureSchema } from '../../gl/schema/gl-texture';
import { ChunkVisibilityFlags } from '../visibility-flags';

// ------------------------------------------------------------------
// Client voxel data
// ------------------------------------------------------------------
export const GLVoxelAttribSchema = new MuStruct({
  buffer: new MuRefSchema<REGL.Buffer>(),
  offset: new MuInt32(0),
  stride: new MuInt32(VERTEX_SIZE),
  normalized: new MuBoolean(false),
  size: new MuInt32(4),
  divisor: new MuInt32(0),
});

export const GLVoxelGeomSchema = new MuStruct({
  index: Vec3Schema,
  vbo: new MuRefSchema<REGL.Buffer>(),
  count: new MuInt32(),
  distance: new MuFloat64(1),

  vao: REGLVAOSchema,
  attrib0: GLVoxelAttribSchema,
  attrib1: GLVoxelAttribSchema,
  attrib2: GLVoxelAttribSchema,
  attrib3: GLVoxelAttribSchema,

  minX: new MuInt32(0),
  minY: new MuInt32(0),
  minZ: new MuInt32(0),
  maxX: new MuInt32(0),
  maxY: new MuInt32(0),
  maxZ: new MuInt32(0),
});

export type GLVoxelGeom = typeof GLVoxelGeomSchema.identity;

export const GLVoxelFluidGeomSchema = new MuStruct({
  index: Vec3Schema,
  vbo: new MuRefSchema<any>(),
  count: new MuInt32(0),
  distance: new MuFloat64(1),

  vao: REGLVAOSchema,
  attrib0: GLVoxelAttribSchema,
  attrib1: GLVoxelAttribSchema,

  minX: new MuInt32(0),
  minY: new MuInt32(0),
  minZ: new MuInt32(0),
  maxX: new MuInt32(0),
  maxY: new MuInt32(0),
  maxZ: new MuInt32(0),
});

export type GLVoxelFluidGeom = typeof GLVoxelFluidGeomSchema.identity;

export type GLVoxelGeomType = GLVoxelGeom | GLVoxelFluidGeom;

export const GLVoxelChunkSchema = new MuStruct({
  index: Vec3Schema,

  visible: new MuBoolean(false),

  posX: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_X),
  posY: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_Y),
  posZ: new MuUint8(0x3f & ~ChunkVisibilityFlags.POS_Z),
  negX: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_X),
  negY: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_Y),
  negZ: new MuUint8(0x3f & ~ChunkVisibilityFlags.NEG_Z),

  geom: GLVoxelGeomSchema,
  alphaGeom: GLVoxelGeomSchema,
  fluidGeom: GLVoxelFluidGeomSchema,
});

export type GLVoxelChunk = typeof GLVoxelChunkSchema.identity;

const GeomRefSchema = <MuSchema<GLVoxelGeom[]>>(
  (<any>new MuArray(new MuRefSchema<GLVoxelGeom>(), Infinity))
);
const FluidGeomRefSchema = <MuSchema<GLVoxelFluidGeom[]>>(
  (<any>new MuArray(new MuRefSchema<GLVoxelFluidGeom>(), Infinity))
);

export const GLVoxelChunkListSchema = new MuArray(GLVoxelChunkSchema, Infinity);

export const GLVoxelStateSchema = new MuStruct({
  // chunks
  nx: new MuInt32(),
  ny: new MuInt32(),
  nz: new MuInt32(),
  chunks: GLVoxelChunkListSchema,

  // frame state
  parallaxChunks: GeomRefSchema,
  parallaxChunksKey: new MuASCII(),
  noParallaxChunks: GeomRefSchema,
  noParallaxChunksKey: new MuASCII(),
  alphaParallaxChunks: GeomRefSchema,
  alphaParallaxChunksKey: new MuASCII(),
  alphaNoParallaxChunks: GeomRefSchema,
  alphaNoParallaxChunksKey: new MuASCII(),
  fluidChunks: FluidGeomRefSchema,
  fluidChunksKey: new MuASCII(),

  // Reflection and shadow passes
  reflectChunks: GeomRefSchema,
  shadowChunks: GeomRefSchema,
  shadowChunksKey: new MuASCII(),

  // voxel textures
  colorAtlasTexture: GLTextureSchema,
  materialAtlasTexture: GLTextureSchema,
  bumpAtlasTexture: GLTextureSchema,
  waterBumpTexture: GLTextureSchema,

  // buffered worker writes
  workerWrites: new MuArray(new MuVarint(), Infinity),
  updateInProgress: new MuBoolean(false),
  needsRemesh: new MuBoolean(false),

  // height map
  terrainHeightTex: REGLTexture2DSchema,
});

export type GLVoxelState = typeof GLVoxelStateSchema.identity;
