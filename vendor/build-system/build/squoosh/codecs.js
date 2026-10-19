"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CODEC = exports.codecs = exports.preprocessors = exports.SQUOOSH_RES = void 0;
exports.squooshOxipng = squooshOxipng;
const semaphore_1 = require("@box/utils/semaphore");
const emscripten_utils_1 = require("./emscripten-utils");
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// dumb hack for build system -- need these hashes for build system, has circular dependency
// import { SQUOOSH_RES } from '../../assets/squoosh';
exports.SQUOOSH_RES = (JSON.parse(`{"avif_dec.wasm":"QmRn59RrBeLd9dWbimL6spFHJ5BHExf5UPqmddPQyfYjqM","avif_enc.wasm":"QmfPoyLcgfcv5WwR6qkYppzDoaSELEyTYV3kryPYFr9LnB","avif_enc_mt.wasm":"QmYqQGDGkBJLR9CYkuqRj42YnQ3fXuceav4EF5pbnWeKwW","avif_node_dec.wasm":"QmZkJvBtemZPvKWMEhKpPD6wSohxprMb178HgKWVwDkj45","avif_node_enc.wasm":"QmQkrb4L9HoqUMpttNVsbttoqE6CQR8uxqdP8TrPvZdBbX","imagequant.wasm":"QmTK3F2zXEWy2taRQ6spiAxceSz1674ijMVNzxkcabTCD5","imagequant_node.wasm":"QmTK3F2zXEWy2taRQ6spiAxceSz1674ijMVNzxkcabTCD5","jxl_dec.wasm":"QmTCGpYTG7Wzb7tPqKbYeHWZ9PstSKiTijyZr6eLv3JzCk","jxl_enc.wasm":"QmPCBZ3ZZfEU7KrhnY4Ek52CdUuuh7LTrKj1FM6mN2g6s4","jxl_enc_mt.wasm":"QmfRcV6xN1s1PjZs2buLKe73EeQgkyDbnFMTYjfuVrxwHV","jxl_enc_mt_simd.wasm":"Qme3zAXkmmtVQELietsemcBkxbWV4vpV8HzM19DATmjiHY","jxl_node_dec.wasm":"QmNPa3FCneeg1sXHUkyC8bmwjewmP3y3GvrkhcveZua4Gk","jxl_node_enc.wasm":"QmQGUvt43KctBMV67eSfujiL9BCubwpfbUjkFhRYcECELJ","mozjpeg_enc.wasm":"QmRsfmdzFYXXop1cc7XC2dZGSRJTV2RmrbETt6JvVQhBEp","mozjpeg_node_dec.wasm":"QmWxY7i3NXQCJ1r8U1M4MqRTXFifXTx81JpApNfoxFEovC","mozjpeg_node_enc.wasm":"QmRsfmdzFYXXop1cc7XC2dZGSRJTV2RmrbETt6JvVQhBEp","rotate.wasm":"QmdZSjbhvB5EUFBf6YUhPRKXAG2PL2z6RzEu9b22N8sVXo","squoosh_oxipng_bg.wasm":"QmQjQyMsgtkSDVRtHgSMo3iDiMk2BndYJFa1DaNR2S6Ahc","squoosh_png_bg.wasm":"QmcJgGkNaRGrEYET4igR9F4D8n499FEoPMcStgH1CTQgLG","squoosh_resize_bg.wasm":"QmZtF4LVttu61jYizSz2CduAZwxUujqEadD1WegAVjG4Vy","squooshhqx_bg.wasm":"Qmd2Heu4oZcnku2VmKgLtaUMJsWZae9JCZA6AnYYiHdad3","visdif.wasm":"QmZBvdQi3PfZqK4HPv9JqGcW3tx5gd1XMQQeVK79q3FCc3","webp_dec.wasm":"QmQS4w5a8iHyeecUP6ha1czoN4r2DJqZh5Da12B1Cb2wJR","webp_enc.wasm":"QmUNDNXiKFF4Mn1K5e3JP9F1DwAqmvKzGzPFrMR4Yg8tTr","webp_enc_simd.wasm":"QmNZhXz371zrJU61QxWpZ4zXZiEvboHqQ1XstpBo5KMs9b","webp_node_dec.wasm":"QmQS4w5a8iHyeecUP6ha1czoN4r2DJqZh5Da12B1Cb2wJR","webp_node_enc.wasm":"QmUNDNXiKFF4Mn1K5e3JP9F1DwAqmvKzGzPFrMR4Yg8tTr","wp2_dec.wasm":"QmfBzYeiRMaWTkyqfcpLyhJjU8RemtkxpC76qCGzYfcVCg","wp2_enc.wasm":"QmfVY4z9wdjhpsf9yRhEU3nkayykyn4wzSANLf4ioAFTci","wp2_enc_mt.wasm":"QmWBAaZ3qwJc365dRB34svgxA94x5aauLL7rNmbFmJqmVo","wp2_enc_mt_simd.wasm":"QmRAJmy6yU1wD1GXfdL3JJZ6FrN3HNmLdAwQxYWSmhgj6g","wp2_node_dec.wasm":"QmRhSW1UYFmWEdojJUYErMY7kuKD9Kn6tBCAQiGfWG8Mth","wp2_node_enc.wasm":"QmVzGdLkpj8xkK7FdF3cVveHtpWeDtEBw4vk1qoeRFUuGa"}`));
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Our decoders currently rely on a `ImageData` global.
const image_data_1 = __importDefault(require("./image_data"));
// MozJPEG
const mozjpeg_enc_1 = __importDefault(require("./codecs/mozjpeg/enc/mozjpeg_enc"));
const mozjpeg_dec_1 = __importDefault(require("./codecs/mozjpeg/dec/mozjpeg_dec"));
// WebP
const webp_enc_1 = __importDefault(require("./codecs/webp/enc/webp_enc"));
const webp_dec_1 = __importDefault(require("./codecs/webp/dec/webp_dec"));
// AVIF
const avif_enc_1 = __importDefault(require("./codecs/avif/enc/avif_enc"));
const avif_dec_1 = __importDefault(require("./codecs/avif/dec/avif_dec"));
// JXL
const jxl_enc_1 = __importDefault(require("./codecs/jxl/enc/jxl_enc"));
const jxl_dec_1 = __importDefault(require("./codecs/jxl/dec/jxl_dec"));
// WP2
const wp2_enc_1 = __importDefault(require("./codecs/wp2/enc/wp2_enc"));
const wp2_dec_1 = __importDefault(require("./codecs/wp2/dec/wp2_dec"));
// PNG
const pngEncDec = __importStar(require("./codecs/png/pkg/squoosh_png"));
// OxiPNG
const oxipng = __importStar(require("./codecs/oxipng/pkg/squoosh_oxipng"));
// Resize
const resize = __importStar(require("./codecs/resize/pkg/squoosh_resize"));
// ImageQuant
const imagequant_1 = __importDefault(require("./codecs/imagequant/imagequant"));
function lazyInit(factory) {
    const mutex = new semaphore_1.Semaphore();
    let instance = null;
    return (content) => __awaiter(this, void 0, void 0, function* () {
        if (instance) {
            return instance;
        }
        yield mutex.p();
        try {
            if (instance) {
                return instance;
            }
            instance = yield factory(content);
            return instance;
        }
        finally {
            mutex.v();
        }
    });
}
const imageQuantPromise = (0, emscripten_utils_1.instantiateEmscriptenWasm)(imagequant_1.default, exports.SQUOOSH_RES['imagequant_node.wasm']);
const pngEncDecPromise = (() => {
    const mutex = new semaphore_1.Semaphore(1);
    let instance = null;
    function fetchPngEncDec(content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (instance) {
                return instance;
            }
            yield mutex.p();
            try {
                if (instance) {
                    return instance;
                }
                const bytes = yield content.retrieve(exports.SQUOOSH_RES['squoosh_png_bg.wasm']);
                if (!bytes) {
                    throw new Error('Error retrieving bytes for wasm png enc/dec module.  hash = ' +
                        exports.SQUOOSH_RES['squoosh_png_bg.wasm']);
                }
                instance = yield pngEncDec.default(bytes);
                return instance;
            }
            finally {
                mutex.v();
            }
        });
    }
    return fetchPngEncDec;
})();
const oxipngPromise = (() => {
    const mutex = new semaphore_1.Semaphore(1);
    let instance = null;
    function fetchOxipng(content) {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.p();
            try {
                if (instance) {
                    return instance;
                }
                const bytes = yield content.retrieve(exports.SQUOOSH_RES['squoosh_oxipng_bg.wasm']);
                if (!bytes) {
                    throw new Error('Error retrieving bytes for wasm oxipng module.  hash = ' +
                        exports.SQUOOSH_RES['squoosh_oxipng_bg.wasm']);
                }
                instance = yield oxipng.default(bytes);
                return instance;
            }
            finally {
                mutex.v();
            }
        });
    }
    return fetchOxipng;
})();
function resizeNameToIndex(name) {
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
function resizeWithAspect({ input_width, input_height, target_width, target_height, }) {
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
exports.preprocessors = {
    resize: {
        name: 'Resize',
        description: 'Resize the image before compressing',
        instantiate: lazyInit((content) => __awaiter(void 0, void 0, void 0, function* () {
            // initialize the resize module
            const resizeWasm = yield content.retrieve(exports.SQUOOSH_RES['squoosh_resize_bg.wasm']);
            if (!resizeWasm) {
                throw new Error('error initializing resize module');
            }
            yield resize.default(resizeWasm.buffer);
            return (buffer, input_width, input_height, { width, height, method, premultiply, linearRGB }) => {
                ({ width, height } = resizeWithAspect({
                    input_width,
                    input_height,
                    target_width: width,
                    target_height: height,
                }));
                return new image_data_1.default(resize.resize(buffer, input_width, input_height, width, height, resizeNameToIndex(method), premultiply, linearRGB), width, height);
            };
        })),
        defaultOptions: {
            method: 'lanczos3',
            fitMethod: 'stretch',
            premultiply: true,
            linearRGB: true,
        },
    },
    quant: {
        name: 'ImageQuant',
        description: 'Reduce the number of colors used (aka. paletting)',
        instantiate: lazyInit((content) => __awaiter(void 0, void 0, void 0, function* () {
            const quant = yield imageQuantPromise(content);
            return (buffer, width, height, { numColors, dither }) => new image_data_1.default(quant.quantize(buffer, width, height, numColors, dither), width, height);
        })),
        defaultOptions: {
            numColors: 255,
            dither: 1.0,
        },
    },
    rotate: {
        name: 'Rotate',
        description: 'Rotate image',
        instantiate: lazyInit((content) => __awaiter(void 0, void 0, void 0, function* () {
            const bytes = yield content.retrieve(exports.SQUOOSH_RES['rotate.wasm']);
            if (!bytes) {
                throw new Error('error instantiating rotate');
            }
            const { instance } = yield WebAssembly.instantiate(bytes.buffer);
            return (buffer, width, height, { numRotations }) => {
                const degrees = (numRotations * 90) % 360;
                const sameDimensions = degrees == 0 || degrees == 180;
                const size = width * height * 4;
                const { memory } = instance.exports;
                const additionalPagesNeeded = Math.ceil((size * 2 - memory.buffer.byteLength + 8) / (64 * 1024));
                if (additionalPagesNeeded > 0) {
                    memory.grow(additionalPagesNeeded);
                }
                const view = new Uint8ClampedArray(memory.buffer);
                view.set(buffer, 8);
                instance.exports.rotate(width, height, degrees);
                return new image_data_1.default(view.slice(size + 8, size * 2 + 8), sameDimensions ? width : height, sameDimensions ? height : width);
            };
        })),
        defaultOptions: {
            numRotations: 0,
        },
    },
};
function squooshOxipng(content, hash, level) {
    return __awaiter(this, void 0, void 0, function* () {
        const [_, bytes] = yield Promise.all([
            oxipngPromise(content),
            content.retrieve(hash),
        ]);
        if (!bytes) {
            throw new Error('could not find hash ' + hash);
        }
        const [ptr, len, result] = oxipng.optimiseNoCopy(bytes, level);
        const resultHash = yield content.store(result);
        oxipng.free(ptr, len);
        return resultHash;
    });
}
exports.codecs = {
    mozjpeg: {
        name: 'MozJPEG',
        extension: 'jpg',
        detectors: [/^\xFF\xD8\xFF/],
        dec: (0, emscripten_utils_1.instantiateEmscriptenWasm)(mozjpeg_dec_1.default, exports.SQUOOSH_RES['mozjpeg_node_dec.wasm']),
        enc: (0, emscripten_utils_1.instantiateEmscriptenWasm)(mozjpeg_enc_1.default, exports.SQUOOSH_RES['mozjpeg_node_enc.wasm']),
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
    webp: {
        name: 'WebP',
        extension: 'webp',
        detectors: [/^RIFF....WEBPVP8[LX ]/],
        dec: (0, emscripten_utils_1.instantiateEmscriptenWasm)(webp_dec_1.default, exports.SQUOOSH_RES['webp_node_dec.wasm']),
        enc: (0, emscripten_utils_1.instantiateEmscriptenWasm)(webp_enc_1.default, exports.SQUOOSH_RES['webp_node_enc.wasm']),
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
    avif: {
        name: 'AVIF',
        extension: 'avif',
        detectors: [/^\x00\x00\x00 ftypavif\x00\x00\x00\x00/],
        dec: (0, emscripten_utils_1.instantiateEmscriptenWasm)(avif_dec_1.default, exports.SQUOOSH_RES['avif_node_dec.wasm']),
        enc: (0, emscripten_utils_1.instantiateEmscriptenWasm)(avif_enc_1.default, exports.SQUOOSH_RES['avif_node_enc.wasm']),
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
    jxl: {
        name: 'JPEG-XL',
        extension: 'jxl',
        detectors: [/^\xff\x0a/],
        dec: (0, emscripten_utils_1.instantiateEmscriptenWasm)(jxl_dec_1.default, exports.SQUOOSH_RES['jxl_node_dec.wasm']),
        enc: (0, emscripten_utils_1.instantiateEmscriptenWasm)(jxl_enc_1.default, exports.SQUOOSH_RES['jxl_node_enc.wasm']),
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
    wp2: {
        name: 'WebP2',
        extension: 'wp2',
        detectors: [/^\xF4\xFF\x6F/],
        dec: (0, emscripten_utils_1.instantiateEmscriptenWasm)(wp2_dec_1.default, exports.SQUOOSH_RES['wp2_node_dec.wasm']),
        enc: (0, emscripten_utils_1.instantiateEmscriptenWasm)(wp2_enc_1.default, exports.SQUOOSH_RES['wp2_node_enc.wasm']),
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
    oxipng: {
        name: 'OxiPNG',
        extension: 'png',
        detectors: [/^\x89PNG\x0D\x0A\x1A\x0A/],
        dec: lazyInit((content) => __awaiter(void 0, void 0, void 0, function* () {
            yield pngEncDecPromise(content);
            return { decode: pngEncDec.decode };
        })),
        enc: lazyInit((content) => __awaiter(void 0, void 0, void 0, function* () {
            yield Promise.all([pngEncDecPromise(content), oxipngPromise(content)]);
            return {
                encode: (buffer, width, height, opts) => {
                    const simplePng = pngEncDec.encode(new Uint8Array(buffer), width, height);
                    return oxipng.optimise(simplePng, opts.level);
                },
            };
        })),
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
exports.DEFAULT_CODEC = {};
Object.keys(exports.codecs).forEach((c) => {
    exports.DEFAULT_CODEC[exports.codecs[c].extension] = c;
});
//# sourceMappingURL=codecs.js.map