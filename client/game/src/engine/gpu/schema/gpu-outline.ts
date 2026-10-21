import { MuStruct } from '@box/mudb/schema';
import { REWGPUTexture2DSchema } from 'src/engine/utils/rewgpu-schema';

export const GPUOutlineStateSchema = new MuStruct({
  outlineDepth: REWGPUTexture2DSchema,
  outlineTarget: REWGPUTexture2DSchema,
});

export type GPUOutlineState = typeof GPUOutlineStateSchema.identity;
