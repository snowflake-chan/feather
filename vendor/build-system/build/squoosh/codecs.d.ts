import { EmscriptenWasm } from './emscripten-types';
export declare const SQUOOSH_RES: {
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
};
import ImageData from './image_data';
import { ContentServer } from '@box/content-server';
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
    instantiate: (content: ContentServer) => Promise<(buffer: Uint8ClampedArray, width: number, height: number, options: T) => ImageData>;
    defaultOptions: T;
};
export declare const preprocessors: {
    resize: ImagePreprocessor<ResizeOptions>;
    quant: ImagePreprocessor<QuantOptions>;
    rotate: ImagePreprocessor<RotateOptions>;
};
export type Preprocessors = typeof preprocessors;
export type PreprocessorName = keyof Preprocessors;
export type PreprocessorOption = {
    [name in keyof Preprocessors]: Preprocessors[name] extends ImagePreprocessor<infer T> ? T : never;
};
export interface ImageDecoder {
    decode(buffer: BufferSource): ImageData | null;
}
export interface ImageEncoder<T> {
    encode(data: BufferSource, width: number, height: number, options: T): Uint8Array | null;
}
export declare const enum MozJpegColorSpace {
    GRAYSCALE = 1,
    RGB = 2,
    YCbCr = 3
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
    encode(data: BufferSource, width: number, height: number, options: MozJpegOptions): Uint8Array | null;
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
    encode(data: BufferSource, width: number, height: number, options: WebPOptions): Uint8Array | null;
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
export declare const enum WP2UVMode {
    UVModeAdapt = 0,// Mix of 420 and 444 (per block)
    UVMode420 = 1,// All blocks 420
    UVMode444 = 2,// All blocks 444
    UVModeAuto = 3
}
export declare const enum WP2Csp {
    kYCoCg = 0,
    kYCbCr = 1,
    kCustom = 2,
    kYIQ = 3
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
    autoOptimize: {
        option: keyof T;
        min: number;
        max: number;
    };
};
export declare function squooshOxipng(content: ContentServer, hash: string, level: number): Promise<string>;
export declare const codecs: {
    mozjpeg: ImageCodec<MozJpegOptions>;
    webp: ImageCodec<WebPOptions>;
    avif: ImageCodec<AVIFOptions>;
    jxl: ImageCodec<JXLOptions>;
    wp2: ImageCodec<WP2Options>;
    oxipng: ImageCodec<PNGOptions>;
};
export type Codecs = typeof codecs;
export type CodecName = keyof Codecs;
export type CodecOption = {
    [name in keyof Codecs]: Codecs[name] extends ImageCodec<infer T> ? T : never;
};
export declare const DEFAULT_CODEC: {
    [ext: string]: CodecName;
};
//# sourceMappingURL=codecs.d.ts.map