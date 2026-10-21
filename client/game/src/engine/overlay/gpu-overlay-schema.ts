import { MuArray, MuFloat64, MuStruct, MuVarint } from '@box/mudb/schema';
import { Vec3Schema } from '@box/schema/utils/math-schema';
import { GlyphListSchema } from '../gpu/schema/gpu-overlay';

export const GPUOverlayInstanceSchema = new MuStruct({
  position: Vec3Schema,

  glyphs: GlyphListSchema,

  zIndex: new MuFloat64(0),
});

export type GPUOverlayInstance = typeof GPUOverlayInstanceSchema.identity;

export const GPUOverlayInstanceListSchema = new MuArray(
  GPUOverlayInstanceSchema,
  Infinity,
);

export type GPUOverlayInstanceList =
  typeof GPUOverlayInstanceListSchema.identity;

export const GPUOverlayStateSchema = new MuStruct({
  list: GPUOverlayInstanceListSchema,
  /**
   * 字形总数
   */
  glyphsCount: new MuVarint(),
});
