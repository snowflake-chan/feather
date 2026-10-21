import { MuStruct, MuArray, MuVarint, MuUint16 } from '@box/mudb/schema';
import { HashSchema } from '@box/schema/content-server/index';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Vec2Schema } from '@box/schema/utils/math-schema';
import {
  REWGPUTexture2DSchema,
  REWGPUCubeSchema,
} from 'src/engine/utils/rewgpu-schema';

export const GPUGameTextureSchema = new MuStruct({
  radius: new MuVarint(256),
  /**
   * 宽高不一致的材质通过size记录尺寸
   */
  size: Vec2Schema,
  mipLevelCount: new MuUint16(1),
  hashes: new MuArray(HashSchema, Infinity),
  faces: new MuRefSchema<(HTMLImageElement | ImageBitmap)[]>(),
  mipmap: new MuRefSchema<(HTMLImageElement | ImageBitmap)[]>(),
  data: new MuRefSchema<HTMLImageElement | ImageBitmap>(),
  texture: REWGPUTexture2DSchema,
  cube: REWGPUCubeSchema,
});

export type GPUGameTexture = typeof GPUGameTextureSchema.identity;
