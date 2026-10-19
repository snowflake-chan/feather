"use strict";
// FIXME: switch this to use squoosh
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
exports.genThumbnail = genThumbnail;
exports.optimizeAvatar = optimizeAvatar;
exports.applyLUT = applyLUT;
exports.applyLutDir = applyLutDir;
const get_pixels_1 = __importDefault(require("get-pixels"));
const save_pixels_1 = __importDefault(require("save-pixels"));
const ndarray_1 = __importDefault(require("ndarray"));
const ndarray_linear_interpolate_1 = __importDefault(require("ndarray-linear-interpolate"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
let sharp;
if (typeof window === 'undefined') {
    sharp = require('sharp');
}
const MINIMAGELENGTH = 10;
const CHECKLENGTH = 8;
const RETRIEVE_TIMEOUT = 2000;
function typeCheck(data) {
    const typeTable = {
        jpg: [0xff, 0xd8], // see struct detail in wikipidia
        png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // stand for png
        gif: [0x47, 0x49, 0x46, 0x38], // stand for gif
        bmp: [0x42, 0x4d], // stand for bm
        svg: [0x3c, 0x3f, 0x78, 0x6d], // stand for xml
        webp: [0x52, 0x49, 0x46, 0x46], // stand for riff
    };
    const startWith = Buffer.from(data).slice(0, CHECKLENGTH);
    for (const type in typeTable) {
        let flag = true;
        for (let i = 0; i < typeTable[type].length; i++) {
            if (startWith[i] !== typeTable[type][i]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            return type;
        }
    }
    return 'unknow';
}
function loadPixels(data) {
    const type = typeCheck(data);
    if (!['png', 'jpg', 'bmp', 'gif'].includes(type)) {
        throw new Error('TYPE NOT SUPPORTED!');
    }
    return new Promise((resolve, reject) => {
        (0, get_pixels_1.default)(Buffer.from(data), 'image/' + type, (error, genPixels) => {
            if (error) {
                reject(error);
            }
            else {
                resolve([genPixels, type]);
            }
        });
    });
}
function savePixelsPromise(pixels, type) {
    const imgStream = (0, save_pixels_1.default)(pixels, type);
    return new Promise((resolve, reject) => {
        const temp = [];
        imgStream.on('error', reject);
        imgStream.on('data', (streamData) => {
            temp.push(streamData);
        });
        imgStream.on('end', () => {
            resolve(Uint8Array.from(Buffer.concat(temp)));
        });
    });
}
function loadPixelsHash(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const pureHash = hash.match(/^(.*?)(\..*?)?$/)[1];
        const imgData = yield bs.retrieveContent(pureHash);
        return yield loadPixels(imgData);
    });
}
function savePixelsHash(bs, image, type) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bs.storeContent(yield savePixelsPromise(image, type));
    });
}
function thumbnailProcess(data, size) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof window !== 'undefined') {
            return thumbnailProcessWithGetPixels(data, size);
        }
        else {
            return thumbnailProcessWithSharp(data, size);
        }
    });
}
function thumbnailProcessWithGetPixels(data, size) {
    return __awaiter(this, void 0, void 0, function* () {
        let [pixels, type] = yield loadPixels(data);
        if (type === 'gif') {
            pixels = pixels.pick(0, null, null, null);
            type = 'jpg';
        }
        const maxSquareLength = Math.min(pixels.shape[0], pixels.shape[1]);
        if (size > Math.max(pixels.shape[0], pixels.shape[1])) {
            return yield savePixelsPromise(pixels, type);
        }
        if (size > maxSquareLength) {
            return yield savePixelsPromise(pixels
                .lo((pixels.shape[0] - maxSquareLength) / 2, (pixels.shape[1] - maxSquareLength) / 2)
                .hi(Math.min(size, pixels.shape[0]), Math.min(size, pixels.shape[1])), type);
        }
        const stepLength = Math.floor(maxSquareLength / size);
        const squareLength = stepLength * size;
        return yield savePixelsPromise(pixels
            .lo((pixels.shape[0] - squareLength) / 2, (pixels.shape[1] - squareLength) / 2)
            .hi(squareLength, squareLength)
            .step(stepLength, stepLength), type);
    });
}
function thumbnailProcessWithSharp(data, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageData = sharp(Buffer.from(data));
        const metadata = yield imageData.metadata();
        let result;
        if (metadata.width < size && metadata.height < size) {
            result = yield imageData.png().toBuffer();
        }
        else {
            result = yield imageData
                .resize({
                width: size,
                height: size,
            })
                .png()
                .toBuffer();
        }
        return Uint8Array.from(result);
    });
}
function genThumbnail(bs, hash, size) {
    return __awaiter(this, void 0, void 0, function* () {
        if (hash === '') {
            return hash;
        }
        const pureHash = hash.match(/^(.*?)(\..*?)?$/)[1];
        const imgData = yield new Promise((resolve, reject) => {
            bs.retrieveContent(pureHash).then(resolve).catch(reject);
            setTimeout(() => {
                reject('Connection Error');
            }, RETRIEVE_TIMEOUT);
        });
        if (imgData.length < MINIMAGELENGTH) {
            return pureHash;
        }
        try {
            const result = yield thumbnailProcess(imgData, size);
            return yield bs.storeContent(result);
        }
        catch (e) {
            return pureHash;
        }
    });
}
function optimizeAvatar(bs, url, size) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgData = Uint8Array.from(yield new Promise((resolve, reject) => {
            try {
                const req = url.match('https') ? https : http;
                req
                    .get(encodeURI(url), (res) => {
                    const chunkList = [];
                    res.on('error', (e) => {
                        reject(e);
                    });
                    res.on('data', (chunk) => {
                        chunkList.push(chunk);
                    });
                    res.on('end', () => {
                        resolve(Buffer.concat(chunkList));
                    });
                })
                    .on('error', (e) => {
                    reject(e);
                });
            }
            catch (e) {
                reject(e);
            }
        }));
        if (imgData.length < MINIMAGELENGTH) {
            throw new Error('wrong url');
        }
        try {
            const result = yield thumbnailProcess(imgData, size);
            return yield bs.storeContent(result);
        }
        catch (e) {
            if (e.message === 'TYPE NOT SUPPORTED!' && typeCheck(imgData) === 'webp') {
                return yield bs.storeContent(imgData);
            }
            throw e;
        }
    });
}
// apply a color lut to an image
function applyLUT(bs, imageHash, lutHash) {
    return __awaiter(this, void 0, void 0, function* () {
        if (imageHash === '' || lutHash === '') {
            return imageHash;
        }
        const [[imagePixels], [lutPixels]] = yield Promise.all([
            loadPixelsHash(bs, imageHash),
            loadPixelsHash(bs, lutHash),
        ]);
        if (lutPixels.shape[0] < 256 ||
            lutPixels.shape[1] < 16 ||
            lutPixels.shape[2] < 3) {
            throw new Error('invalid color LUT');
        }
        const out = (0, ndarray_1.default)(new Uint8Array(imagePixels.data.length), imagePixels.shape, imagePixels.stride, imagePixels.offset);
        const lut3D = (0, ndarray_1.default)(lutPixels.data, [16, 16, 16, 3], [
            lutPixels.stride[0],
            lutPixels.stride[1],
            lutPixels.stride[0] * 16,
            lutPixels.stride[2],
        ], lutPixels.offset);
        const lutR = lut3D.pick(null, null, null, 0);
        const lutG = lut3D.pick(null, null, null, 1);
        const lutB = lut3D.pick(null, null, null, 2);
        for (let i = 0; i < imagePixels.shape[0]; ++i) {
            for (let j = 0; j < imagePixels.shape[1]; ++j) {
                const r = imagePixels.get(i, j, 0) / 16;
                const g = imagePixels.get(i, j, 1) / 16;
                const b = imagePixels.get(i, j, 2) / 16;
                out.set(i, j, 0, ndarray_linear_interpolate_1.default.d3(lutR, r, g, b));
                out.set(i, j, 1, ndarray_linear_interpolate_1.default.d3(lutG, r, g, b));
                out.set(i, j, 2, ndarray_linear_interpolate_1.default.d3(lutB, r, g, b));
                out.set(i, j, 3, 255);
            }
        }
        return yield savePixelsHash(bs, out, 'png');
    });
}
function applyLutDir(bs, previewImage, luts, mergeDirs) {
    return __awaiter(this, void 0, void 0, function* () {
        const lutDir = yield bs.retrieveJSON(luts);
        const result = {};
        yield Promise.all(Object.keys(lutDir).map((lut) => __awaiter(this, void 0, void 0, function* () {
            if (lut === '.') {
                return;
            }
            if (mergeDirs) {
                const base = lut.replace('.png', '');
                result[base + '.lut.preview'] = yield bs.build('applyLUT', previewImage, lutDir[lut]);
                result[base + '.lut'] = lutDir[lut];
            }
            else {
                result[lut] = yield bs.build('applyLUT', previewImage, lutDir[lut]);
            }
        })));
        return yield bs.storeJSON(result);
    });
}
//# sourceMappingURL=image-process.js.map