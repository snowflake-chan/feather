"use strict";
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
exports.img = img;
exports.squooshThumbnail = squooshThumbnail;
const codecs_1 = require("../squoosh/codecs");
const squoosh_1 = require("../squoosh/squoosh");
const image_data_1 = __importDefault(require("../squoosh/image_data"));
const heavy_mutex_1 = require("./heavy_mutex");
function img(bs, queryStr) {
    return __awaiter(this, void 0, void 0, function* () {
        // `${originHash}_100_100_${fit}.${format}`;
        const [base, format] = queryStr.split('.');
        let codec;
        switch (format.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
            case 'mozjpeg':
                codec = 'mozjpeg';
                break;
            case 'webp':
                codec = 'webp';
                break;
            case 'avif':
                codec = 'avif';
                break;
            case 'jxl':
                codec = 'jxl';
                break;
            case 'wp2':
            case 'webp2':
                codec = 'wp2';
                break;
            case 'png':
            case 'oxipng':
                codec = 'oxipng';
                break;
            default:
                throw new Error('unknow format');
        }
        const [hash, width, height, fit = 'fill'] = base.split('_');
        if (!hash || !width || !height) {
            throw new Error('param error');
        }
        return yield squooshThumbnail(bs, hash, Math.floor(+width), Math.floor(+height), codec, fit);
    });
}
// Example squoosh thumbnail
function squooshThumbnail(bs, hash, width, height, codec, fit) {
    return __awaiter(this, void 0, void 0, function* () {
        yield heavy_mutex_1.BUILD_HEAVY_LOCK.p();
        const t = Date.now();
        try {
            // handle default output codecs
            let c = codec;
            if (!(c in codecs_1.codecs)) {
                c = codecs_1.DEFAULT_CODEC[codec.toLowerCase()];
            }
            if (!c) {
                throw new Error('Invalid image codec: ' + c);
            }
            const image = yield (0, squoosh_1.decodeImage)({
                content: bs.contentServer,
                hash,
            });
            if (!image) {
                throw new Error(`Error decoding image: ${hash}`);
            }
            const hlOption = {
                width: +width || 0,
                height: +height || 0,
            };
            let baseLine = 'w';
            switch (fit) {
                case 'contain': {
                    baseLine = image.width / width > image.height / height ? 'w' : 'h';
                    Object.assign(hlOption, {
                        width: baseLine === 'w'
                            ? width
                            : Math.floor((height * image.width) / image.height),
                        height: baseLine === 'h'
                            ? height
                            : Math.floor((width / image.width) * image.height),
                        fitMethod: 'contain',
                    });
                    break;
                }
                case 'cover': {
                    baseLine = image.width / width > image.height / height ? 'h' : 'w';
                    Object.assign(hlOption, {
                        width: baseLine === 'w'
                            ? width
                            : Math.floor((height * image.width) / image.height),
                        height: baseLine === 'h'
                            ? height
                            : Math.floor((width / image.width) * image.height),
                        fitMethod: 'contain',
                    });
                    break;
                }
                case 'fill':
                default:
            }
            const resized = yield (0, squoosh_1.preprocessImage)({
                content: bs.contentServer,
                data: image.data,
                width: image.width,
                height: image.height,
                preprocessor: 'resize',
                options: hlOption,
            });
            if (!resized) {
                throw new Error(`Error resizing image: ${hash} from ${image.width}x${image.height} to ${width}x${height}`);
            }
            if (fit === 'cover') {
                const croppedImage = new image_data_1.default(new Uint8ClampedArray(width * height * 4), width, height);
                if (baseLine === 'w') {
                    for (let i = 0; i < croppedImage.data.length; i++) {
                        croppedImage.data[i] =
                            resized.data[i +
                                Math.floor((resized.height - croppedImage.height) / 2) *
                                    croppedImage.width *
                                    4];
                    }
                }
                else {
                    for (let h = 0; h < croppedImage.height * 4; h++) {
                        for (let w = 0; w < croppedImage.width * 4; w++) {
                            croppedImage.data[w + h * croppedImage.width * 4] =
                                resized.data[w +
                                    h * resized.width * 4 +
                                    Math.floor((resized.width - croppedImage.width) / 2) * 4];
                        }
                    }
                }
                return yield (0, squoosh_1.encodeImage)({
                    content: bs.contentServer,
                    data: croppedImage.data,
                    width: croppedImage.width,
                    height: croppedImage.height,
                    codec: c,
                });
            }
            else {
                return yield (0, squoosh_1.encodeImage)({
                    content: bs.contentServer,
                    data: resized.data,
                    width: resized.width,
                    height: resized.height,
                    codec: c,
                });
            }
        }
        finally {
            bs.logger.info(`squoosh ${hash} ${width}x${height} ${codec} elapsed time = ${Date.now() - t}ms`);
            heavy_mutex_1.BUILD_HEAVY_LOCK.v();
        }
    });
}
//# sourceMappingURL=thumbnail.js.map