import {
  MuStruct,
  MuUint32,
  MuBoolean,
  MuFloat64,
  MuArray,
  MuUTF8,
  MuVarint,
  MuSchema,
  MuASCII,
  MuDictionary,
  MuFloat32,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

import {
  NodesInfoSchema,
  AnimationsSchema,
  RenderableType,
} from '../parse/mesh-schema';
import {
  REWGPUBufferSchema,
  REWGPUTexture2DSchema,
  REWGPUGroupSchema,
  REWGPUIndexBufferDesSchema,
} from '../../utils/rewgpu-schema';
import {
  Mat4Schema,
  Mat3Schema,
  Vec3Schema,
} from '@box/schema/utils/math-schema';
import { LightProbe } from 'src/engine/voxel/light-schema';

export const GPUMeshSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>(
    new MuVarint(RenderableType.GPUMesh)
  ),

  hash: new MuUTF8(),

  distance: new MuFloat64(),
  passId: new MuVarint(),

  lox: new MuFloat64(),
  loy: new MuFloat64(),
  loz: new MuFloat64(),

  hix: new MuFloat64(),
  hiy: new MuFloat64(),
  hiz: new MuFloat64(),

  // Vertex buffers
  meshBuffer: REWGPUBufferSchema,
  idxBuffer: REWGPUBufferSchema,
  uvBuffer: REWGPUBufferSchema,
  normalsBuffer: REWGPUBufferSchema,
  positionsBuffer: REWGPUBufferSchema,

  // index
  count: new MuVarint(),
  indexBufferDescriptor: REWGPUIndexBufferDesSchema,

  // texture
  texture: REWGPUTexture2DSchema,

  // groups
  staticNodesGroup: REWGPUGroupSchema,
  nodesTextureGroup: REWGPUGroupSchema,

  // nodes info
  nodesInfo: NodesInfoSchema,
  staticIsTransparent: new MuBoolean(false),
  staticMatrixBuffer: REWGPUBufferSchema,
  staticAlphaBuffer: REWGPUBufferSchema,

  // animations data
  animations: AnimationsSchema,

  renderBoxOffset: Vec3Schema,

  isGLTF: new MuBoolean(false),
});

export type GPUMesh = typeof GPUMeshSchema.identity;

export const GPUMeshMotionMatrixSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>(
    new MuVarint(RenderableType.GPUMesh)
  ),
  matrixData: new MuRefSchema<Float32Array>(),
  alphaData: new MuRefSchema<Float32Array>(),
});

export type GPUMeshMotionMatrix = typeof GPUMeshMotionMatrixSchema.identity;

export const GPUMeshInstanceSchema = new MuStruct({
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
  matrixData: new MuRefSchema<Float32Array>(),
  alphaData: new MuRefSchema<Float32Array>(),

  ambient: <MuSchema<LightProbe>>new MuRefSchema<LightProbe>(),
  part: <MuSchema<GPUMesh>>(<any>new MuRefSchema<GPUMesh>()),
});

export type GPUMeshInstance = typeof GPUMeshInstanceSchema.identity;

export const GPUMeshInstanceListSchema = new MuArray(
  GPUMeshInstanceSchema,
  Infinity,
);

export type GPUMeshInstanceList = typeof GPUMeshInstanceListSchema.identity;

export const GPUMeshInstanceListDictSchema = new MuDictionary(
  GPUMeshInstanceListSchema,
  Infinity,
);

export type GPUMeshInstanceListDict =
  typeof GPUMeshInstanceListDictSchema.identity;

export const GPUModelTextureSchema = new MuStruct({
  renderableType: <MuSchema<RenderableType>>(
    new MuVarint(RenderableType.GPUModelTexture)
  ),
  hash: new MuASCII(),
  width: new MuFloat64(0),
  height: new MuFloat64(0),

  // texture
  texture: REWGPUTexture2DSchema,

  // group
  group: REWGPUGroupSchema,
});

export type GPUModelTexture = typeof GPUModelTextureSchema.identity;

export const GPUModelTextureInstanceSchema = new MuStruct({
  model: Mat4Schema,
  part: <MuSchema<GPUModelTexture>>(<any>new MuRefSchema<GPUModelTexture>()),
});

export type GPUModelTextureInstancef =
  typeof GPUModelTextureInstanceSchema.identity;

export const GPUModelTextureInstanceListSchema = new MuArray(
  GPUModelTextureInstanceSchema,
  Infinity,
);

export type GPUModelTextureInstanceList =
  typeof GPUModelTextureInstanceListSchema.identity;
