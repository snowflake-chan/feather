import { vec2, vec3 } from 'gl-matrix';
import TinySDF from '@mapbox/tiny-sdf';
import type { ReWGPU } from '@box/rewgpu';
import type { GameClientState } from 'src/engine/game-client-schema';
import {
  GlyphListSchema,
  GlyphInstance,
  FontInstance,
  FontSchema,
  GlyphSchema,
  GlyphListInstance,
} from '../schema/gpu-overlay';
import { GPUState } from '../schema/gpu-schema';

/**
 * 仅允许设置font相关属性
 */
export type SDFConfig = {
  /**
   * 生成SDF图集时的大小，以px为单位
   *
   * 只控制生成SDF时的字体大小，不决定实际的渲染大小，渲染大小通过渲染时计算决定
   *
   * @default 23
   */
  fontSize?: number;
  /**
   * 字体
   * @default 'Sans-Serif'
   */
  fontFamily?: string;
  /**
   * 字重
   * @default 'normal'
   */
  fontWeight?: string;
};

/**
 * 除了字体相关的参数含义详见: https://github.com/mapbox/tiny-sdf
 */
/**
 * Whitespace buffer around a glyph in pixels
 * 文本图片周围的空白区域
 */
export const SDF_BUFFER = 3;

/**
 * radius 参数的大小会影响 SDF（Signed Distance Field，带符号距离场）图生成的质量和效果。
 * 具体来说，它会影响以下几个方面：
 *
 * 1. 边缘的清晰度：较大的 radius 值会导致 SDF 图中边缘区域的模糊程度增加，因为它会使用更多的像素来编码距离。相反，较小的 radius 值会产生更加清晰的边缘。
 *
 * 2. 文件大小：较大的 radius 值会导致生成的 SDF 图文件大小增加，因为需要更多的像素来编码距离信息。这可能会增加加载时间和内存占用。
 *
 * 3. 渲染性能：较大的 radius 值可能会增加 SDF 图的渲染复杂度，因为需要更多的计算来处理距离信息。这可能会对渲染性能产生一定的影响，特别是在移动设备或性能较低的设备上。
 */
const SDF_RADIUS = 8;

/**
 * cutoff 参数控制了字形内部部分的半径比例（相对值）。
 * 具体来说，它确定了在生成 SDF 图时，距离场中哪一部分被认为是字形的内部部分。
 *
 * 较大的 cutoff 值会导致 SDF 图中被认为是字形内部的区域更多，因此内部部分的粗细会减小。
 * 相反，较小的 cutoff 值会使内部部分的粗细增加，因为被认为是内部的区域会更少。
 *
 * 对于不同的字体和缩放比例，可能需要调整 cutoff 参数以获得最佳的效果。
 */
const SDF_CUTOFF = 0.25;

type CachedSDFConfig = Required<SDFConfig> & {
  buffer: number;
  radius: number;
  cutoff: number;
};

type SDFCache = {
  sdf: TinySDF;
  config: CachedSDFConfig;
};

const MIN_TEXTURE_ARRAY_LAYERS = 2;

export const DEFAULT_ATLAS_SIZE = 1024;
const FONT_ATLAS_MAX_SIZE = DEFAULT_ATLAS_SIZE;

export class FontsManager {
  /**
   * 以字体样式为key的sdf工具字典
   */
  private sdfMap = new Map<string, SDFCache>();

  private rewgpu: ReWGPU;

  constructor(rewgpu: ReWGPU) {
    this.rewgpu = rewgpu;
  }

  public getGlyphs(
    state: GameClientState,
    spec: { text: string; config?: SDFConfig },
  ): GlyphListInstance {
    const { text, config: propsConfig = {} } = spec;
    const {
      fontSize = 23,
      fontFamily = 'Sans-Serif',
      fontWeight = 'normal',
    } = propsConfig;

    const { fonts } = state.gpu.overlay.text;

    const sdfConfig = { fontSize, fontFamily, fontWeight };

    const key = this.getSDFKey(sdfConfig);

    const sdfCache = this.getSDFCache(key, sdfConfig);

    const chars = text.split('');

    const glyphs = GlyphListSchema.alloc();
    glyphs.length = 0;

    // 放置新字符的位图所需要的尺寸
    const imgSize = sdfCache.config.fontSize + sdfCache.config.buffer * 4;

    const updatedFonts: FontInstance[] = [];

    const currentFonts = fonts.slice();

    chars.forEach((c) => {
      // 判定是否已经有可用的Char数据，如果已有，直接复用
      let glyph: GlyphInstance | undefined;

      let availableFont: FontInstance | undefined;
      let availableFontIdx = 0;
      const glyphPos: vec2 = [0, 0];

      currentFonts.find((font, idx) => {
        if (font.configKey === key) {
          if (font.glyphSet[c]) {
            glyph = font.glyphSet[c];
            return true;
          }

          // 康康能否作为可用的图集
          if (this.getNextGlyphPosInAtlas(glyphPos, imgSize, font)) {
            availableFont = font;
            availableFontIdx = idx;
          }

          return false;
        }

        return false;
      });

      // 如果已经找到了字形缓存，直接使用缓存数据，否则走后续流程，创建字形的位图
      if (glyph) {
        glyphs.push(glyph);
        return;
      }

      // 如果没有可用的图集，要先新建图集
      if (!availableFont) {
        availableFont = this.createFont(key, sdfConfig);

        // 如果创建失败，跳过
        if (!availableFont) {
          return;
        }

        availableFontIdx = currentFonts.length;

        currentFonts.push(availableFont);
      }

      // 未找到字符，开始生成新的数据，并更新atlas
      const {
        data,
        width,
        height,
        glyphAdvance,
        glyphWidth,
        glyphHeight,
        glyphLeft,
        glyphTop,
      } = sdfCache.sdf.draw(c);

      // 来放到atlas中
      glyph = GlyphSchema.alloc();

      glyph.fontIdx = availableFontIdx;
      glyph.char = c;

      glyph.matrix[0] = width;
      glyph.matrix[1] = height;

      glyph.matrix[2] = glyphWidth;
      glyph.matrix[3] = glyphHeight;

      glyph.matrix[4] = glyphLeft;
      glyph.matrix[5] = glyphTop;

      this.getNextGlyphPosInAtlas(glyphPos, imgSize, availableFont);

      glyph.matrix[6] = glyphPos[0];
      glyph.matrix[7] = glyphPos[1];

      glyph.matrix[8] = glyphAdvance;

      availableFont.atlasMetrics[0] = glyphPos[0] + imgSize;
      availableFont.atlasMetrics[1] = glyphPos[1];
      availableFont.atlasMetrics[2] = glyphPos[1] + imgSize;

      const imageData = new ImageData(width, height);

      this.makeRGBAImageData(imageData, data);

      availableFont.atlasContext?.putImageData(
        imageData,
        glyphPos[0],
        glyphPos[1],
      );

      availableFont.glyphSet[c] = glyph;

      glyphs.push(glyph);

      !updatedFonts.includes(availableFont) && updatedFonts.push(availableFont);
    });

    this.updateFontsTexture(state.gpu, updatedFonts);

    return glyphs;
  }

  private getSDFCache(key: string, config: Required<SDFConfig>) {
    const { fontSize, fontFamily, fontWeight } = config;

    let sdfCache = this.sdfMap.get(key);

    if (!sdfCache) {
      const cachedConfig: CachedSDFConfig = {
        fontSize,
        fontFamily,
        fontWeight,
        buffer: SDF_BUFFER,
        radius: SDF_RADIUS,
        cutoff: SDF_CUTOFF,
      };

      sdfCache = {
        sdf: new TinySDF(cachedConfig),
        config: cachedConfig,
      };

      this.sdfMap.set(key, sdfCache);
    }

    return sdfCache;
  }

  private getSDFKey(options: Required<SDFConfig>) {
    return [options.fontSize, options.fontFamily, options.fontWeight].join('-');
  }

  // Convert alpha-only to RGBA so we can use `putImageData` for building the composite bitmap
  private makeRGBAImageData(out: ImageData, alphaChannel: Uint8ClampedArray) {
    for (let i = 0; i < alphaChannel.length; i++) {
      out.data[4 * i + 0] = alphaChannel[i];
      out.data[4 * i + 1] = alphaChannel[i];
      out.data[4 * i + 2] = alphaChannel[i];
      out.data[4 * i + 3] = 255;
    }

    return out;
  }

  private createFont(
    configKey: string,
    sdfConfig: Required<SDFConfig>,
  ): FontInstance | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = DEFAULT_ATLAS_SIZE;
    canvas.height = DEFAULT_ATLAS_SIZE;

    const context = canvas.getContext('2d');

    // 无法创建context，出错
    if (!context) {
      console.error('Failed to create font when getting canvas context.');

      return;
    }

    const font = FontSchema.alloc();

    font.configKey = configKey;
    vec3.zero(font.atlasMetrics);

    font.fontSize = sdfConfig.fontSize;
    font.fontFamily = sdfConfig.fontFamily;
    font.fontWeight = sdfConfig.fontWeight;

    font.atlasContext = context;

    return font;
  }

  /**
   * 计算字体图集放置下个字形位图的起始位置
   * @param out 起始位置
   * @param imgSize 字形位图尺寸
   * @param font 字体实例
   * @returns 是否能放下
   */
  private getNextGlyphPosInAtlas(
    out: vec2,
    imgSize: number,
    font: FontInstance,
  ) {
    const [right, top, bottom] = font.atlasMetrics;

    // 同行可以放下，用同行
    if (
      right + imgSize <= FONT_ATLAS_MAX_SIZE &&
      top + imgSize <= FONT_ATLAS_MAX_SIZE
    ) {
      vec2.set(out, right, top);

      return true;
    }

    // 换行可以放下，换行
    if (
      bottom + imgSize <= FONT_ATLAS_MAX_SIZE &&
      imgSize <= FONT_ATLAS_MAX_SIZE
    ) {
      vec2.set(out, 0, bottom);

      return true;
    }

    return false;
  }

  /**
   * 初始化一个texture array，合并所有字体的图集到该texture中
   */
  private createFontsTexture(fonts: FontInstance[]) {
    const arrayLayers = Math.max(fonts.length, MIN_TEXTURE_ARRAY_LAYERS);

    const texture = this.rewgpu.texture({
      label: 'overlay:text:fontAtlas',
      size: [DEFAULT_ATLAS_SIZE, DEFAULT_ATLAS_SIZE, arrayLayers],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    fonts.forEach(({ atlasContext }, idx) => {
      if (!atlasContext) {
        return;
      }

      texture.update(atlasContext.canvas, {
        size: [DEFAULT_ATLAS_SIZE, DEFAULT_ATLAS_SIZE],
        origin: [0, 0, idx],
      });
    });

    return texture;
  }

  /**
   * 更新图集，有两种情况
   * - 更新已有的atlas
   * - 新增atlas，此时会销毁当前的texture（如果有），再重新创建
   */
  private updateFontsTexture(gpuState: GPUState, updatedFonts: FontInstance[]) {
    const {
      overlay: { text },
      linearSampler,
    } = gpuState;

    if (!text.textPipeline || !linearSampler) {
      return;
    }

    const { fontsTexture } = text;

    let toRecreate = !fontsTexture;

    if (!toRecreate) {
      toRecreate = updatedFonts.some((f) => !text.fonts.includes(f));
    }

    // 如果有一个不存在，都要改变texture尺寸
    if (toRecreate) {
      text.fontsTexture?.destroy();

      text.fonts.push(...updatedFonts);

      const texture = this.createFontsTexture(text.fonts);

      text.fontsTexture = texture;

      // 由于所有的图集尺寸都一样，用同一个buffer即可。
      if (!text.texSizeBuffer) {
        const data = new Float32Array([DEFAULT_ATLAS_SIZE, DEFAULT_ATLAS_SIZE]);
        text.texSizeBuffer = this.rewgpu.buffer({
          data,
          size: data.byteLength,
          usage: GPUBufferUsage.UNIFORM,
        });
      }

      text.fontsTextureGroup?.destroy();

      text.fontsTextureGroup = this.rewgpu.group({
        label: 'overlay:fonts:textureGroup',
        layout: text.textPipeline.getBindGroupLayout(1),
        entries: [
          {
            binding: 0,
            resource: linearSampler,
          },
          {
            binding: 1,
            resource: texture,
          },
          {
            binding: 2,
            resource: text.texSizeBuffer,
          },
        ],
      });

      return;
    }

    if (!fontsTexture) {
      return;
    }

    updatedFonts.forEach((f) => {
      if (!f.atlasContext) {
        return;
      }

      const idx = text.fonts.indexOf(f);

      fontsTexture.update(f.atlasContext.canvas, {
        size: [DEFAULT_ATLAS_SIZE, DEFAULT_ATLAS_SIZE],
        origin: [0, 0, idx],
      });
    });
  }
}
