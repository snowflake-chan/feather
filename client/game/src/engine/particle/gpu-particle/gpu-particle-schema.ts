import { MuStruct } from '@box/mudb/schema';
import { GPUGameTextureSchema } from '../../../engine/gpu/schema/gpu-texture';
import { REWGPUBufferSchema } from '../../../engine/utils/rewgpu-schema';

export const GPUParticleSchema = new MuStruct({
  noiseSampler: GPUGameTextureSchema,

  particleBackBuffer: REWGPUBufferSchema,
  particleBuffer: REWGPUBufferSchema,
});
