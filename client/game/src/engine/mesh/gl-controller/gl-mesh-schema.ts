import {
  MuStruct,
  MuUint32,
  MuBoolean,
  MuInt32,
  MuFloat64,
  MuArray,
  MuSchema,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';
import {
  Mat3Schema,
  Mat4Schema,
  Vec2Schema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { LightProbe } from '../../voxel/light-schema';
import {
  REGLBufferSchema,
  REGLTexture2DSchema,
  REGLVAOSchema,
} from '../../utils/regl-schema';
import {
  NodesInfoSchema,
  NodesMatrixSchema,
  AnimationsSchema,
  RenderableType,
} from '../parse/mesh-schema';

export const GLMeshVertexAttributeSchema = new MuStruct({
  buffer: REGLBufferSchema,
  offset: new MuInt32(0),
  stride: new MuInt32(4),
  size: new MuInt32(4),
  divisor: new MuInt32(0),
  normalize: new MuBoolean(false),
});

export const GLMeshSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>new MuVarint(RenderableType.GLMesh),

  hash: new MuUTF8(),

  distance: new MuFloat64(),
  passId: new MuVarint(),

  lox: new MuFloat64(),
  loy: new MuFloat64(),
  loz: new MuFloat64(),

  hix: new MuFloat64(),
  hiy: new MuFloat64(),
  hiz: new MuFloat64(),

  // Reference data
  meshBuffer: REGLBufferSchema,
  uvBuffer: REGLBufferSchema,
  // nodes matrix idx buffer
  idxBuffer: REGLBufferSchema,
  // support mesh with normals
  normalsBuffer: REGLBufferSchema,

  // texture
  texture: REGLTexture2DSchema,
  textureShape: new MuArray(new MuInt32(), 2),

  // Vertex attributes
  vao: REGLVAOSchema,
  s0: GLMeshVertexAttributeSchema,
  s1: GLMeshVertexAttributeSchema,
  uv: GLMeshVertexAttributeSchema,
  normals: GLMeshVertexAttributeSchema,

  // nodes info
  nodesInfo: NodesInfoSchema,
  matrixTextureSize: new MuInt32(),
  alphaTextureSize: new MuInt32(),
  staticMatrixTexture: REGLTexture2DSchema,
  staticAlphaTexture: REGLTexture2DSchema,
  staticNodesMatrix: NodesMatrixSchema,
  staticIsTransparent: new MuBoolean(false),

  // animations data
  animations: AnimationsSchema,

  renderBoxOffset: Vec3Schema,

  isGLTF: new MuBoolean(false),
});

export const GLMeshMotionMatrixSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>new MuVarint(RenderableType.GLMesh),
  matrixTexture: REGLTexture2DSchema,
  alphaTexture: REGLTexture2DSchema,
  nodesMatrix: NodesMatrixSchema,
});

export type GLMeshMotionMatrix = typeof GLMeshMotionMatrixSchema.identity;

export type GLMesh = typeof GLMeshSchema.identity;

export const GLMeshInstanceSchema = new MuStruct({
  id: new MuUint32(0),

  distance: new MuFloat64(),

  red: new MuFloat64(),
  green: new MuFloat64(),
  blue: new MuFloat64(),
  alpha: new MuFloat64(),

  metalness: new MuFloat64(),
  shininess: new MuFloat64(),
  emissive: new MuFloat64(),

  model: Mat4Schema,
  normalMatrix: Mat3Schema,
  matrixTexture: REGLTexture2DSchema,
  alphaTexture: REGLTexture2DSchema,
  nodesMatrix: NodesMatrixSchema,

  ambient: <MuSchema<LightProbe>>new MuRefSchema<LightProbe>(),
  part: <MuSchema<GLMesh>>(<any>new MuRefSchema<GLMesh>()),
});

export type GLMeshInstance = typeof GLMeshInstanceSchema.identity;

export function compareMeshInstanceList(a: GLMeshInstance, b: GLMeshInstance) {
  return a.part.distance - b.part.distance || a.distance - b.distance;
}

export function compareTransparentMeshInstanceList(
  a: GLMeshInstance,
  b: GLMeshInstance,
) {
  return b.part.distance - a.part.distance || b.distance - a.distance;
}

export const GLMeshInstanceListSchema = new MuArray(
  GLMeshInstanceSchema,
  Infinity,
);

export type GLMeshInstanceList = typeof GLMeshInstanceListSchema.identity;

export const GLTextureInstanceSchema = new MuStruct({
  model: Mat4Schema,
  texture: REGLTexture2DSchema,
  vertex: new MuArray(Vec3Schema, Infinity),
  uv: new MuArray(Vec2Schema, Infinity),
});

export type GLTextureInstance = typeof GLTextureInstanceSchema.identity;

export const GLTextureInstanceListSchema = new MuArray(
  GLTextureInstanceSchema,
  Infinity,
);

export type GLTextureInstanceList = typeof GLTextureInstanceListSchema.identity;
