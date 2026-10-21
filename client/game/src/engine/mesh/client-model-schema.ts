import {
  MuStruct,
  MuUint32,
  MuSchema,
  MuArray,
  MuFloat64,
  MuVarint,
  MuDictionary,
  MuBoolean,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Renderable, MeshMotionMatrix } from './renderable-schema';
import { Mat4Schema, Vec4Schema } from '@box/schema/utils/math-schema';
import {
  NetSkinTableSchema,
  NetMeshTableSchema,
} from '@box/schema/mesh/model-schema';
import { HashSchema } from '@box/schema/content-server/index';

export const ClientModelSchema = new MuStruct({
  id: new MuVarint(),

  // lightmap id
  lightmapId: new MuUint32(0),

  // reference to mesh object
  glRef: <MuSchema<Renderable>>new MuRefSchema<Renderable>(),

  // model matrix
  model: Mat4Schema,
  useMotionTexture: new MuBoolean(false),
  motionMatrix: <MuSchema<MeshMotionMatrix>>new MuRefSchema<MeshMotionMatrix>(),

  // mesh tint
  color: Vec4Schema,
  metalness: new MuFloat64(0),
  emissive: new MuFloat64(0),
  shininess: new MuFloat64(0),

  // model render shadow
  renderShadow: new MuBoolean(true),
  staticShadow: new MuBoolean(false),
});

export type ClientModel = typeof ClientModelSchema.identity;

export const ClientModelListSchema = new MuArray(ClientModelSchema, Infinity);

export type ClientModelList = typeof ClientModelListSchema.identity;

export const ClientModelStateSchema = new MuStruct({
  passId: new MuVarint(),
  meshHashes: NetMeshTableSchema,
  skinHashes: NetSkinTableSchema,
  skinPartHashes: new MuDictionary(HashSchema, Infinity),
});
