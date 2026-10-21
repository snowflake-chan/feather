import { MuBoolean, MuStruct, MuUint32 } from '@box/mudb/schema';
import {
  REWGPUGroupSchema,
  REWGPUTexture2DSchema,
} from '../../utils/rewgpu-schema';

export const GPUPostSchema = new MuStruct({
  // If set, use post processing
  enabled: new MuBoolean(false),
  groupDirty: new MuBoolean(true),

  // oit
  oitGroup: REWGPUGroupSchema,

  // fxaa
  fxaaEnabled: new MuBoolean(false),

  // Blur
  blurEnabled: new MuBoolean(false),
  blurScale: new MuUint32(4), // must be integer power of 2

  // Volumetric scattering
  scatteringEnabled: new MuBoolean(false),
  scatteringTarget: REWGPUTexture2DSchema,
  scatteringGroup: REWGPUGroupSchema,

  // SSAO
  ssaoEnabled: new MuBoolean(true),
  ssaoGroup: REWGPUGroupSchema,

  // lut
  lutEnabled: new MuBoolean(true),
});
