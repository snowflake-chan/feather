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
exports.alloc = alloc;
exports.readPixels = readPixels;
exports.writePixels = writePixels;
const ndarray_1 = __importDefault(require("ndarray"));
const get_pixels_1 = __importDefault(require("get-pixels"));
function alloc(w, h) {
    return (0, ndarray_1.default)(new Uint8Array(w * h * 4), [w, h, 4]);
}
function readPixels(imgPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, get_pixels_1.default)(imgPath, (err, data) => {
                if (err) {
                    resolve(void 0);
                }
                else {
                    resolve(data);
                }
            });
        });
    });
}
function writePixels(imgPath, pixels) {
    // savePixels(pixels, 'png').pipe(fs.createWriteStream(imgPath));
}
//# sourceMappingURL=pixels.js.map