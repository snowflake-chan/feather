"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bumpDerivative = bumpDerivative;
exports.computeBumpImage = computeBumpImage;
const ndarray_1 = __importDefault(require("ndarray"));
const ndarray_gradient_1 = __importDefault(require("ndarray-gradient"));
const ndarray_ops_1 = __importDefault(require("ndarray-ops"));
const ndarray_resample_1 = __importDefault(require("ndarray-resample"));
function bumpDerivative(img) {
    const height = img.pick(-1, -1, 0);
    const dHeight = (0, ndarray_1.default)(new Float64Array(img.shape[0] * img.shape[1] * 2), [
        img.shape[0],
        img.shape[1],
        2,
    ]);
    (0, ndarray_gradient_1.default)(dHeight, height, 'wrap');
    ndarray_ops_1.default.muls(dHeight, dHeight, 4);
    ndarray_ops_1.default.adds(img.hi(-1, -1, 2), dHeight, 128);
    ndarray_ops_1.default.assigns(img.lo(0, 0, 3), 255);
}
function upsampleImage(img, scale) {
    const output = (0, ndarray_1.default)(new Float64Array(img.shape[0] * img.shape[1] * scale * scale), [img.shape[0] * scale, img.shape[1] * scale]);
    if (scale !== 1) {
        (0, ndarray_resample_1.default)(output, img, 0, 255);
    }
    else {
        ndarray_ops_1.default.assign(output, img);
    }
    return output;
}
function computeBumpGrad(img) {
    const height = img.pick(-1, -1, 0);
    const dHeight = (0, ndarray_1.default)(new Float64Array(img.shape[0] * img.shape[1] * 2), [
        img.shape[0],
        img.shape[1],
        2,
    ]);
    (0, ndarray_gradient_1.default)(dHeight, height, 'wrap');
    return dHeight;
}
function computeCavityMap(height) {
    const nx = height.shape[0];
    const ny = height.shape[1];
    const cavity = (0, ndarray_1.default)(new Float64Array(nx * ny), [nx, ny]);
    for (let i = 0; i < nx; ++i) {
        for (let j = 0; j < ny; ++j) {
            const c = height.get(i, j);
            let crease = 0;
            for (let dx = -1; dx <= 1; ++dx) {
                for (let dy = -1; dy <= 1; ++dy) {
                    const h = height.get((i + dx + nx) % nx, (j + dy + ny) % ny);
                    crease += Math.max(h - c, 0);
                }
            }
            cavity.set(i, j, 255 - crease / 8);
        }
    }
    return cavity;
}
function computeBumpImage(img, scaleFactor, heightScale) {
    const height = upsampleImage(img.pick(-1, -1, 0), scaleFactor);
    const dHeight = computeBumpGrad(height);
    const cavity = computeCavityMap(height);
    const result = (0, ndarray_1.default)(new Uint8Array(height.shape[0] * height.shape[1] * 4), [height.shape[0], height.shape[1], 4]);
    const outHeight = result.pick(-1, -1, 0);
    const outGrad = result.lo(-1, -1, 1).hi(-1, -1, 2);
    const outCavity = result.pick(-1, -1, 3);
    ndarray_ops_1.default.assign(outHeight, height);
    ndarray_ops_1.default.adds(outGrad, dHeight, 128);
    ndarray_ops_1.default.assign(outCavity, cavity);
    return result;
}
//# sourceMappingURL=bump.js.map