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
exports.genImageFromUploader = genImageFromUploader;
function genImageFromUploader(bs, hash, type, width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageHash = yield genOptimiImageHash(bs, hash, type);
        const imageModel = {
            width,
            height,
            data: imageHash,
        };
        return bs.storeJSON(imageModel);
    });
}
function genOptimiImageHash(bs, hash, type) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (type) {
            case 'png':
                return bs.build('optimizePNG', hash);
            case 'jpg':
            case 'jpeg':
                return bs.build('optimizeJPG', hash);
            default:
                throw new Error(`cannot read img type ${type}`);
        }
    });
}
//# sourceMappingURL=img-process.js.map