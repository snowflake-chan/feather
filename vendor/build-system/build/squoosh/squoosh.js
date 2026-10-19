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
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessImage = preprocessImage;
exports.decodeImage = decodeImage;
exports.encodeImage = encodeImage;
// Minimal API from Squoosh
const codecs_1 = require("./codecs");
function preprocessImage(spec) {
    return __awaiter(this, void 0, void 0, function* () {
        const preprocessor = codecs_1.preprocessors[spec.preprocessor];
        const instance = yield preprocessor.instantiate(spec.content);
        const options = Object.assign({}, preprocessor.defaultOptions);
        if (spec.options) {
            Object.assign(options, spec.options);
        }
        return instance(spec.data, spec.width, spec.height, options);
    });
}
function decodeImage(spec) {
    return __awaiter(this, void 0, void 0, function* () {
        const bytes = yield spec.content.retrieve(spec.hash);
        if (!bytes) {
            throw new Error(`Error retrieving image ${spec.hash}`);
        }
        let firstChunkString = '';
        for (let i = 0; i < Math.min(16, bytes.length); ++i) {
            firstChunkString += String.fromCodePoint(bytes[i]);
        }
        const formats = Object.keys(codecs_1.codecs);
        for (let i = 0; i < formats.length; ++i) {
            const key = formats[i];
            const codec = codecs_1.codecs[key];
            if (codec.detectors.some((detector) => detector.exec(firstChunkString))) {
                return (yield codec.dec(spec.content)).decode(bytes);
            }
        }
        throw new Error('Unrecognized image format for ' + spec.hash);
    });
}
function encodeImage(spec) {
    return __awaiter(this, void 0, void 0, function* () {
        const codec = codecs_1.codecs[spec.codec];
        if (!codec) {
            throw new Error('Invalid codec: ' + spec.codec);
        }
        const encoder = yield codec.enc(spec.content);
        const options = Object.assign({}, codec.defaultEncoderOptions);
        if (spec.options) {
            Object.assign(options, spec.options);
        }
        const buffer = encoder.encode(spec.data, spec.width, spec.height, options);
        if (!buffer) {
            throw new Error(`Error encoding image with codec ${spec.codec}`);
        }
        return yield spec.content.store(buffer);
    });
}
//# sourceMappingURL=squoosh.js.map