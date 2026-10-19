import { MuArray, MuUint8, MuStruct } from '@box/mudb/schema';
import { MeshTextureSchema, MeshDataSchema } from '@box/mesher/schema';
import { ModelMeshSchema } from './modelMeshSchema';

export const MeshSchema = new ModelMeshSchema();
export const meshBufferSchema = new MuArray(new MuUint8(), Infinity);
export const modelMeshSchema = new MuStruct({
  meshBuffer: meshBufferSchema,
  pbrBuffer: meshBufferSchema,
});

export const NewMeshSchema = new MuStruct({
  texture: MeshTextureSchema,
  data: MeshDataSchema,
});
