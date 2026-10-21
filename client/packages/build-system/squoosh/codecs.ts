import { EmscriptenWasm } from './emscripten-types';
import { Semaphore } from '@box/utils/semaphore';
import { instantiateEmscriptenWasm } from './emscripten-utils';

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// dumb hack for build system -- need these hashes for build system, has circular dependency
// import { SQUOOSH_RES } from '../../assets/squoosh';
export const SQUOOSH_RES: {
  'avif_dec.wasm': string;
  'avif_enc.wasm': string;
  'avif_enc_mt.wasm': string;
  'avif_node_dec.wasm': string;
  'avif_node_enc.wasm': string;
  'imagequant.wasm': string;
  'imagequant_node.wasm': string;
  'jxl_dec.wasm': string;
  'jxl_enc.wasm': string;
  'jxl_enc_mt.wasm': string;
  'jxl_enc_mt_simd.wasm': string;
  'jxl_node_dec.wasm': string;
  'jxl_node_enc.wasm': string;
  'mozjpeg_enc.wasm': string;
  'mozjpeg_node_dec.wasm': string;
  'mozjpeg_node_enc.wasm': string;
  'rotate.wasm': string;
  'squoosh_oxipng_bg.wasm': string;
  'squoosh_png_bg.wasm': string;
  'squoosh_resize_bg.wasm': string;
  'squooshhqx_bg.wasm': string;
  'visdif.wasm': string;
  'webp_dec.wasm': string;
  'webp_enc.wasm': string;
  'webp_enc_simd.wasm': string;
  'webp_node_dec.wasm': string;
  'webp_node_enc.wasm': string;
  'wp2_dec.wasm': string;
  'wp2_enc.wasm': string;
  'wp2_enc_mt.wasm': string;
  'wp2_enc_mt_simd.wasm': string;
  'wp2_node_dec.wasm': string;
  'wp2_node_enc.wasm': string;
} = <any>(
  JSON.parse(
    `{"avif_dec.wasm":"QmRn59RrBeLd9dWbimL6spFHJ5BHExf5UPqmddPQyfYjqM","avif_enc.wasm":"QmfPoyLcgfcv5WwR6qkYppzDoaSELEyTYV3kryPYFr9LnB","avif_enc_mt.wasm":"QmYqQGDGkBJLR9CYkuqRj42YnQ3fXuceav4EF5pbnWeKwW","avif_node_dec.wasm":"QmZkJvBtemZPvKWMEhKpPD6wSohxprMb178HgKWVwDkj45","avif_node_enc.wasm":"QmQkrb4L9HoqUMpttNVsbttoqE6CQR8uxqdP8TrPvZdBbX","imagequant.wasm":"QmTK3F2zXEWy2taRQ6spiAxceSz1674ijMVNzxkcabTCD5","imagequant_node.wasm":"QmTK3F2zXEWy2taRQ6spiAxceSz1674ijMVNzxkcabTCD5","jxl_dec.wasm":"QmTCGpYTG7Wzb7tPqKbYeHWZ9PstSKiTijyZr6eLv3JzCk","jxl_enc.wasm":"QmPCBZ3ZZfEU7KrhnY4Ek52CdUuuh7LTrKj1FM6mN2g6s4","jxl_enc_mt.wasm":"QmfRcV6xN1s1PjZs2buLKe73EeQgkyDbnFMTYjfuVrxwHV","jxl_enc_mt_simd.wasm":"Qme3zAXkmmtVQELietsemcBkxbWV4vpV8HzM19DATmjiHY","jxl_node_dec.wasm":"QmNPa3FCneeg1sXHUkyC8bmwjewmP3y3GvrkhcveZua4Gk","jxl_node_enc.wasm":"QmQGUvt43KctBMV67eSfujiL9BCubwpfbUjkFhRYcECELJ","mozjpeg_enc.wasm":"QmRsfmdzFYXXop1cc7XC2dZGSRJTV2RmrbETt6JvVQhBEp","mozjpeg_node_dec.wasm":"QmWxY7i3NXQCJ1r8U1M4MqRTXFifXTx81JpApNfoxFEovC","mozjpeg_node_enc.wasm":"QmRsfmdzFYXXop1cc7XC2dZGSRJTV2RmrbETt6JvVQhBEp","rotate.wasm":"QmdZSjbhvB5EUFBf6YUhPRKXAG2PL2z6RzEu9b22N8sVXo","squoosh_oxipng_bg.wasm":"QmQjQyMsgtkSDVRtHgSMo3iDiMk2BndYJFa1DaNR2S6Ahc","squoosh_png_bg.wasm":"QmcJgGkNaRGrEYET4igR9F4D8n499FEoPMcStgH1CTQgLG","squoosh_resize_bg.wasm":"QmZtF4LVttu61jYizSz2CduAZwxUujqEadD1WegAVjG4Vy","squooshhqx_bg.wasm":"Qmd2Heu4oZcnku2VmKgLtaUMJsWZae9JCZA6AnYYiHdad3","visdif.wasm":"QmZBvdQi3PfZqK4HPv9JqGcW3tx5gd1XMQQeVK79q3FCc3","webp_dec.wasm":"QmQS4w5a8iHyeecUP6ha1czoN4r2DJqZh5Da12B1Cb2wJR","webp_enc.wasm":"QmUNDNXiKFF4Mn1K5e3JP9F1DwAqmvKzGzPFrMR4Yg8tTr","webp_enc_simd.wasm":"QmNZhXz371zrJU61QxWpZ4zXZiEvboHqQ1XstpBo5KMs9b","webp_node_dec.wasm":"QmQS4w5a8iHyeecUP6ha1czoN4r2DJqZh5Da12B1Cb2wJR","webp_node_enc.wasm":"QmUNDNXiKFF4Mn1K5e3JP9F1DwAqmvKzGzPFrMR4Yg8tTr","wp2_dec.wasm":"QmfBzYeiRMaWTkyqfcpLyhJjU8RemtkxpC76qCGzYfcVCg","wp2_enc.wasm":"QmfVY4z9wdjhpsf9yRhEU3nkayykyn4wzSANLf4ioAFTci","wp2_enc_mt.wasm":"QmWBAaZ3qwJc365dRB34svgxA94x5aauLL7rNmbFmJqmVo","wp2_enc_mt_simd.wasm":"QmRAJmy6yU1wD1GXfdL3JJZ6FrN3HNmLdAwQxYWSmhgj6g","wp2_node_dec.wasm":"QmRhSW1UYFmWEdojJUYErMY7kuKD9Kn6tBCAQiGfWG8Mth","wp2_node_enc.wasm":"QmVzGdLkpj8xkK7FdF3cVveHtpWeDtEBw4vk1qoeRFUuGa"}`,
  )
);
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// Our decoders currently rely on a `ImageData` global.
import ImageData from './image_data';

import { ContentServer } from '@box/content-server';

// MozJPEG
import mozEnc from './codecs/mozjpeg/enc/mozjpeg_enc';
import mozDec from './codecs/mozjpeg/dec/mozjpeg_dec';

// WebP
import webpEnc from './codecs/webp/enc/webp_enc';
import webpDec from './codecs/webp/dec/webp_dec';

// AVIF
import avifEnc from './codecs/avif/enc/avif_enc';
import avifDec from './codecs/avif/dec/avif_dec';

// JXL
import jxlEnc from './codecs/jxl/enc/jxl_enc';
import jxlDec from './codecs/jxl/dec/jxl_dec';

// WP2
import wp2Enc from './codecs/wp2/enc/wp2_enc';
import wp2Dec from './codecs/wp2/dec/wp2_dec';

// PNG
import * as pngEncDec from './codecs/png/pkg/squoosh_png';

// OxiPNG
import * as oxipng from './codecs/oxipng/pkg/squoosh_oxipng';

// Resize
import * as resize from './codecs/resize/pkg/squoosh_resize';

// ImageQuant
import imageQuant from './codecs/imagequant/imagequant';

function lazyInit<T>(factory: (content: ContentServer) => Promise<T>) {
  const mutex = new Semaphore();
  let instance: T | null = null;
  return async (content: ContentServer) => {
    if (instance) {
      return instance;
    }
    await mutex.p();
    try {
      if (instance) {
        return instance;
      }
      instance = await factory(content);
      return instance;
    } finally {
      mutex.v();
    }
  };
}

const imageQuantPromise = instantiateEmscriptenWasm<any>(
  imageQuant,
  SQUOOSH_RES['imagequant_node.wasm'],
);

const pngEncDecPromise = (() => {
  const mutex = new Semaphore(1);
  let instance: any = null;
  async function fetchPngEncDec(content: ContentServer) {
    if (instance) {
      return instance;
    }
    await mutex.p();
    try {
      if (instance) {
        return instance;
      }
      const bytes = await content.retrieve(SQUOOSH_RES['squoosh_png_bg.wasm']);
      if (!bytes) {
        throw new Error(
          'Error retrieving bytes for wasm png enc/dec module.  hash = ' +
            SQUOOSH_RES['squoosh_png_bg.wasm'],
        );
      }
      instance = await pngEncDec.default(bytes);
      return instance;
    } finally {
      mutex.v();
    }
  }
  return fetchPngEncDec;
})();

const oxipngPromise = (() => {
  const mutex = new Semaphore(1);
  let instance: any = null;
  async function fetchOxipng(content: ContentServer) {
    await mutex.p();
    try {
      if (instance) {
        return instance;
      }
      const bytes = await content.retrieve(
        SQUOOSH_RES['squoosh_oxipng_bg.wasm'],
      );
      if (!bytes) {
        throw new Error(
          'Error retrieving bytes for wasm oxipng module.  hash = ' +
            SQUOOSH_RES['squoosh_oxipng_bg.wasm'],
        );
      }
      instance = await oxipng.default(bytes);
      return instance;
    } finally {
      mutex.v();
    }
  }
  return fetchOxipng;
})();

function resizeNameToIndex(
  name: 'triangle' | 'catrom' | 'lanczos3' | 'mitchell',
) {
  switch (name) {
    case 'triangle':
      return 0;
    case 'catrom':
      return 1;
    case 'mitchell':
      return 2;
    case 'lanczos3':
      return 3;
    default:
      throw Error(`Unknown resize algorithm "${name}"`);
  }
}

function resizeWithAspect({
  input_width,
  input_height,
  target_width,
  target_height,
}: {
  input_width: number;
  input_height: number;
  target_width?: number;
  target_height?: number;
}) {
  if (target_width && target_height) {
    return { width: target_width, height: target_height };
  }
  if (!target_width && target_height) {
    return {
      width: Math.round((input_width / input_height) * target_height),
      height: target_height,
    };
  }
  if (!target_height && target_width) {
    return {
      width: target_width,
      height: Math.round((input_height / input_width) * target_width),
    };
  }
  return {
    width: input_width,
    height: input_height,
  };
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  method: 'triangle' | 'catrom' | 'mitchell' | 'lanczos3';
  premultiply: boolean;
  linearRGB: boolean;
  fitMethod: string;
}

export interface QuantOptions {
  numColors: number;
  dither: number;
}

export interface RotateOptions {
  numRotations: number;
}

export type ImagePreprocessor<T> = {
  name: string;
  description: string;
  instantiate: (
    content: ContentServer,
  ) => Promise<
    (
      buffer: Uint8ClampedArray,
      width: number,
      height: number,
      options: T,
    ) => ImageData
  >;
  defaultOptions: T;
};

export const preprocessors = {
  resize: <ImagePreprocessor<ResizeOptions>>{
    name: 'Resize',
    description: 'Resize the image before compressing',
    instantiate: lazyInit(async (content: ContentServer) => {
      // initialize the resize module
      const resizeWasm = await content.retrieve(
        SQUOOSH_RES['squoosh_resize_bg.wasm'],
      );
      if (!resizeWasm) {
        throw new Error('error initializing resize module');
      }
      await resize.default(resizeWasm.buffer);
      return (
        buffer: Uint8ClampedArray,
        input_width: number,
        input_height: number,
        { width, height, method, premultiply, linearRGB }: ResizeOptions,
      ) => {
        ({ width, height } = resizeWithAspect({
          input_width,
          input_height,
          target_width: width,
          target_height: height,
        }));
        return new ImageData(
          resize.resize(
            buffer,
            input_width,
            input_height,
            width,
            height,
            resizeNameToIndex(method),
            premultiply,
            linearRGB,
          ),
          width,
          height,
        );
      };
    }),
    defaultOptions: {
      method: 'lanczos3',
      fitMethod: 'stretch',
      premultiply: true,
      linearRGB: true,
    },
  },
  quant: <ImagePreprocessor<QuantOptions>>{
    name: 'ImageQuant',
    description: 'Reduce the number of colors used (aka. paletting)',
    instantiate: lazyInit(async (content: ContentServer) => {
      const quant = await imageQuantPromise(content);
      return (
        buffer: Uint8ClampedArray,
        width: number,
        height: number,
        { numColors, dither }: QuantOptions,
      ) =>
        new ImageData(
          quant.quantize(buffer, width, height, numColors, dither),
          width,
          height,
        );
    }),
    defaultOptions: {
      numColors: 255,
      dither: 1.0,
    },
  },
  rotate: <ImagePreprocessor<RotateOptions>>{
    name: 'Rotate',
    description: 'Rotate image',
    instantiate: lazyInit(async (content: ContentServer) => {
      const bytes = await content.retrieve(SQUOOSH_RES['rotate.wasm']);
      if (!bytes) {
        throw new Error('error instantiating rotate');
      }
      const { instance } = <any>await WebAssembly.instantiate(bytes.buffer);
      return (
        buffer: Uint8ClampedArray,
        width: number,
        height: number,
        { numRotations }: RotateOptions,
      ) => {
        const degrees = (numRotations * 90) % 360;
        const sameDimensions = degrees == 0 || degrees == 180;
        const size = width * height * 4;
        const { memory } = instance.exports;
        const additionalPagesNeeded = Math.ceil(
          (size * 2 - memory.buffer.byteLength + 8) / (64 * 1024),
        );
        if (additionalPagesNeeded > 0) {
          memory.grow(additionalPagesNeeded);
        }
        const view = new Uint8ClampedArray(memory.buffer);
        view.set(buffer, 8);
        instance.exports.rotate(width, height, degrees);
        return new ImageData(
          view.slice(size + 8, size * 2 + 8),
          sameDimensions ? width : height,
          sameDimensions ? height : width,
        );
      };
    }),
    defaultOptions: {
      numRotations: 0,
    },
  },
};

export type Preprocessors = typeof preprocessors;
export type PreprocessorName = keyof Preprocessors;
export type PreprocessorOption = {
  [name in keyof Preprocessors]: Preprocessors[name] extends ImagePreprocessor<
    infer T
  >
    ? T
    : never;
};

export interface ImageDecoder {
  decode(buffer: BufferSource): ImageData | null;
}

export interface ImageEncoder<T> {
  encode(
    data: BufferSource,
    width: number,
    height: number,
    options: T,
  ): Uint8Array | null;
}

export const enum MozJpegColorSpace {
  GRAYSCALE = 1,
  RGB,
  YCbCr,
}

export interface MozJpegOptions {
  quality: number;
  baseline: boolean;
  arithmetic: boolean;
  progressive: boolean;
  optimize_coding: boolean;
  smoothing: number;
  color_space: MozJpegColorSpace;
  quant_table: number;
  trellis_multipass: boolean;
  trellis_opt_zero: boolean;
  trellis_opt_table: boolean;
  trellis_loops: number;
  auto_subsample: boolean;
  chroma_subsample: number;
  separate_chroma_quality: boolean;
  chroma_quality: number;
}

export interface MozJpegEncoder extends EmscriptenWasm.Module {
  encode(
    data: BufferSource,
    width: number,
    height: number,
    options: MozJpegOptions,
  ): Uint8Array | null;
}

export interface WebPOptions {
  quality: number;
  target_size: number;
  target_PSNR: number;
  method: number;
  sns_strength: number;
  filter_strength: number;
  filter_sharpness: number;
  filter_type: number;
  partitions: number;
  segments: number;
  pass: number;
  show_compressed: number;
  preprocessing: number;
  autofilter: number;
  partition_limit: number;
  alpha_compression: number;
  alpha_filtering: number;
  alpha_quality: number;
  lossless: boolean;
  exact: number;
  image_hint: number;
  emulate_jpeg_size: number;
  thread_level: number;
  low_memory: number;
  near_lossless: number;
  use_delta_palette: number;
  use_sharp_yuv: number;
}

export interface WebPEncoder extends EmscriptenWasm.Module {
  encode(
    data: BufferSource,
    width: number,
    height: number,
    options: WebPOptions,
  ): Uint8Array | null;
}

export interface AVIFOptions {
  minQuantizer: number;
  maxQuantizer: number;
  minQuantizerAlpha: number;
  maxQuantizerAlpha: number;
  tileRowsLog2: number;
  tileColsLog2: number;
  speed: number;
  subsample: number;
}

export interface JXLOptions {
  speed: number;
  quality: number;
  progressive: boolean;
  epf: number;
  nearLossless: number;
  lossyPalette: boolean;
}

export interface WP2Options {
  quality: number;
  alpha_quality: number;
  effort: number;
  pass: number;
  sns: number;
  uv_mode: WP2UVMode;
  csp_type: WP2Csp;
  error_diffusion: number;
  use_random_matrix: boolean;
}

export const enum WP2UVMode {
  UVModeAdapt = 0, // Mix of 420 and 444 (per block)
  UVMode420, // All blocks 420
  UVMode444, // All blocks 444
  UVModeAuto, // Choose any of the above automatically
}

export const enum WP2Csp {
  kYCoCg,
  kYCbCr,
  kCustom,
  kYIQ,
}

export interface PNGOptions {
  level: number;
}

export type ImageCodec<T> = {
  name: string;
  extension: string;
  detectors: RegExp[];
  dec: (content: ContentServer) => Promise<ImageDecoder>;
  enc: (content: ContentServer) => Promise<ImageEncoder<T>>;
  defaultEncoderOptions: T;

  // currently unused, but maybe in future could auto optimize encoding
  autoOptimize: {
    option: keyof T;
    min: number;
    max: number;
  };
};

export async function squooshOxipng(
  content: ContentServer,
  hash: string,
  level: number,
) {
  const [_, bytes] = await Promise.all([
    oxipngPromise(content),
    content.retrieve(hash),
  ]);
  if (!bytes) {
    throw new Error('could not find hash ' + hash);
  }
  const [ptr, len, result] = oxipng.optimiseNoCopy(bytes, level);
  const resultHash = await content.store(result);
  oxipng.free(ptr, len);
  return resultHash;
}

export const codecs = {
  mozjpeg: <ImageCodec<MozJpegOptions>>{
    name: 'MozJPEG',
    extension: 'jpg',
    detectors: [/^\xFF\xD8\xFF/],
    dec: instantiateEmscriptenWasm<ImageDecoder>(
      mozDec,
      SQUOOSH_RES['mozjpeg_node_dec.wasm'],
    ),
    enc: instantiateEmscriptenWasm<ImageEncoder<MozJpegOptions>>(
      mozEnc,
      SQUOOSH_RES['mozjpeg_node_enc.wasm'],
    ),
    defaultEncoderOptions: {
      quality: 75,
      baseline: false,
      arithmetic: false,
      progressive: true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 3 /*YCbCr*/,
      quant_table: 3,
      trellis_multipass: false,
      trellis_opt_zero: false,
      trellis_opt_table: false,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: 75,
    },
    autoOptimize: {
      option: 'quality',
      min: 0,
      max: 100,
    },
  },
  webp: <ImageCodec<WebPOptions>>{
    name: 'WebP',
    extension: 'webp',
    detectors: [/^RIFF....WEBPVP8[LX ]/],
    dec: instantiateEmscriptenWasm<ImageDecoder>(
      webpDec,
      SQUOOSH_RES['webp_node_dec.wasm'],
    ),
    enc: instantiateEmscriptenWasm<ImageEncoder<WebPOptions>>(
      webpEnc,
      SQUOOSH_RES['webp_node_enc.wasm'],
    ),
    defaultEncoderOptions: {
      quality: 75,
      target_size: 0,
      target_PSNR: 0,
      method: 4,
      sns_strength: 50,
      filter_strength: 60,
      filter_sharpness: 0,
      filter_type: 1,
      partitions: 0,
      segments: 4,
      pass: 1,
      show_compressed: 0,
      preprocessing: 0,
      autofilter: 0,
      partition_limit: 0,
      alpha_compression: 1,
      alpha_filtering: 1,
      alpha_quality: 100,
      lossless: false,
      exact: 0,
      image_hint: 0,
      emulate_jpeg_size: 0,
      thread_level: 0,
      low_memory: 0,
      near_lossless: 100,
      use_delta_palette: 0,
      use_sharp_yuv: 0,
    },
    autoOptimize: {
      option: 'quality',
      min: 75,
      max: 100,
    },
  },
  avif: <ImageCodec<AVIFOptions>>{
    name: 'AVIF',
    extension: 'avif',
    detectors: [/^\x00\x00\x00 ftypavif\x00\x00\x00\x00/],
    dec: instantiateEmscriptenWasm<ImageDecoder>(
      avifDec,
      SQUOOSH_RES['avif_node_dec.wasm'],
    ),
    enc: instantiateEmscriptenWasm<ImageEncoder<AVIFOptions>>(
      avifEnc,
      SQUOOSH_RES['avif_node_enc.wasm'],
    ),
    defaultEncoderOptions: {
      minQuantizer: 33,
      maxQuantizer: 63,
      minQuantizerAlpha: 33,
      maxQuantizerAlpha: 63,
      tileColsLog2: 0,
      tileRowsLog2: 0,
      speed: 8,
      subsample: 1,
      lossless: true,
    },
    autoOptimize: {
      option: 'maxQuantizer',
      min: 0,
      max: 62,
    },
  },
  jxl: <ImageCodec<JXLOptions>>{
    name: 'JPEG-XL',
    extension: 'jxl',
    detectors: [/^\xff\x0a/],
    dec: instantiateEmscriptenWasm<ImageDecoder>(
      jxlDec,
      SQUOOSH_RES['jxl_node_dec.wasm'],
    ),
    enc: instantiateEmscriptenWasm<ImageEncoder<JXLOptions>>(
      jxlEnc,
      SQUOOSH_RES['jxl_node_enc.wasm'],
    ),
    defaultEncoderOptions: {
      speed: 4,
      quality: 75,
      progressive: false,
      epf: -1,
      nearLossless: 0,
      lossyPalette: false,
    },
    autoOptimize: {
      option: 'quality',
      min: 0,
      max: 100,
    },
  },
  wp2: <ImageCodec<WP2Options>>{
    name: 'WebP2',
    extension: 'wp2',
    detectors: [/^\xF4\xFF\x6F/],
    dec: instantiateEmscriptenWasm<ImageDecoder>(
      wp2Dec,
      SQUOOSH_RES['wp2_node_dec.wasm'],
    ),
    enc: instantiateEmscriptenWasm<ImageEncoder<WP2Options>>(
      wp2Enc,
      SQUOOSH_RES['wp2_node_enc.wasm'],
    ),
    defaultEncoderOptions: {
      quality: 75,
      alpha_quality: 75,
      effort: 5,
      pass: 1,
      sns: 50,
      uv_mode: 0 /*UVMode.UVModeAuto*/,
      csp_type: 0 /*Csp.kYCoCg*/,
      error_diffusion: 0,
      use_random_matrix: false,
    },
    autoOptimize: {
      option: 'quality',
      min: 0,
      max: 100,
    },
  },
  oxipng: <ImageCodec<PNGOptions>>{
    name: 'OxiPNG',
    extension: 'png',
    detectors: [/^\x89PNG\x0D\x0A\x1A\x0A/],
    dec: lazyInit(async (content: ContentServer) => {
      await pngEncDecPromise(content);
      return <ImageDecoder>{ decode: pngEncDec.decode };
    }),
    enc: lazyInit(async (content: ContentServer) => {
      await Promise.all([pngEncDecPromise(content), oxipngPromise(content)]);
      return <ImageEncoder<PNGOptions>>{
        encode: (
          buffer: BufferSource,
          width: number,
          height: number,
          opts: PNGOptions,
        ) => {
          const simplePng = pngEncDec.encode(
            new Uint8Array(<any>buffer),
            width,
            height,
          );
          return oxipng.optimise(simplePng, opts.level);
        },
      };
    }),
    defaultEncoderOptions: {
      level: 2,
    },
    autoOptimize: {
      option: 'level',
      min: 6,
      max: 1,
    },
  },
};

export type Codecs = typeof codecs;
export type CodecName = keyof Codecs;
export type CodecOption = {
  [name in keyof Codecs]: Codecs[name] extends ImageCodec<infer T> ? T : never;
};

export const DEFAULT_CODEC: { [ext: string]: CodecName } = {};
Object.keys(codecs).forEach((c) => {
  DEFAULT_CODEC[codecs[c].extension] = <any>c;
});
