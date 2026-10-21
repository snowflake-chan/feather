import {
  MuASCII,
  MuArray,
  MuDictionary,
  MuStruct,
  MuUTF8,
  MuVarint,
} from '@box/mudb/schema';
import { Mat3Schema, Vec3Schema } from '@box/schema/utils/math-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import {
  REWGPUBufferSchema,
  REWGPUGroupSchema,
  REWGPUPipelineSchema,
  REWGPUTexture2DSchema,
} from 'src/engine/utils/rewgpu-schema';
import type { FontsManager } from '../overlay/font-manager';

/**
 * 字形
 */
export const GlyphSchema = new MuStruct({
  /**
   * 引用的字体图集索引
   */
  fontIdx: new MuVarint(0),

  /**
   * 字形对应的字符
   */
  char: new MuUTF8(''),

  /**
   * 字形的数据
   */
  matrix: Mat3Schema,
});

export type GlyphInstance = typeof GlyphSchema.identity;

/**
 * 字体
 */
export const FontSchema = new MuStruct({
  /**
   * 字体配置拼接成的字符串，格式如下：
   * `${fontSize}-${fontFamily}-${fontWeight}`
   */
  configKey: new MuASCII(''),

  /**
   * 字体大小
   */
  fontSize: new MuVarint(23),

  /**
   * 字体族名
   */
  fontFamily: new MuASCII(''),

  /**
   * 字重
   */
  fontWeight: new MuASCII(''),

  /**
   * 该字体的字形集合
   */
  glyphSet: new MuDictionary(GlyphSchema, Infinity),

  // 图集的canvas的CanvasRenderingContext2D
  atlasContext: new MuRefSchema<CanvasRenderingContext2D>(),

  /**
   * 图集中下个可放置字形位图的位置
   * [right, top, bottom]
   *
   *               top
   *  ___          ___
   * | A |right   | ? |
   *  ---          ---
   *               bottom
   */
  atlasMetrics: Vec3Schema,
});

export type FontInstance = typeof FontSchema.identity;

export const GlyphListSchema = new MuArray(
  new MuRefSchema<GlyphInstance>(),
  Infinity,
);

export type GlyphListInstance = typeof GlyphListSchema.identity;

export const GPUTextOverlaySchema = new MuStruct({
  fontsManager: new MuRefSchema<FontsManager>(),

  textPipeline: REWGPUPipelineSchema,

  fonts: new MuArray(FontSchema, Infinity),

  fontsTexture: REWGPUTexture2DSchema,

  fontsTextureGroup: REWGPUGroupSchema,

  texSizeBuffer: REWGPUBufferSchema,
});

export type GPUTextOverlayState = typeof GPUTextOverlaySchema.identity;

export const GPUOverlaySchema = new MuStruct({
  text: GPUTextOverlaySchema,
});
