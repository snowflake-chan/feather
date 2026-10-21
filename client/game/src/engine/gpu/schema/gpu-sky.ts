import { MuStruct } from '@box/mudb/schema';
import { GPUGameTextureSchema } from './gpu-texture';

export const GPUSkySchema = new MuStruct({
  nightSampler: GPUGameTextureSchema,
  cloudSamplerCube: GPUGameTextureSchema,

  snowTexture: GPUGameTextureSchema,
});

export type GPUSky = typeof GPUSkySchema.identity;
