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
exports.resize = resize;
let wasm;
let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null ||
        cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}
let WASM_VECTOR_LEN = 0;
function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null ||
        cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} input_image
 * @param {number} input_width
 * @param {number} input_height
 * @param {number} output_width
 * @param {number} output_height
 * @param {number} typ_idx
 * @param {boolean} premultiply
 * @param {boolean} color_space_conversion
 * @returns {Uint8Array}
 */
function resize(input_image, input_width, input_height, output_width, output_height, typ_idx, premultiply, color_space_conversion) {
    var ptr0 = passArray8ToWasm0(input_image, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.resize(8, ptr0, len0, input_width, input_height, output_width, output_height, typ_idx, premultiply, color_space_conversion);
    var r0 = getInt32Memory0()[8 / 4 + 0];
    var r1 = getInt32Memory0()[8 / 4 + 1];
    var v1 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v1;
}
function load(module, imports) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = yield WebAssembly.instantiate(module, imports);
        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        }
        else {
            return instance;
        }
    });
}
function init(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const imports = {};
        const { instance, module } = yield load(yield input, imports);
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;
        return wasm;
    });
}
exports.default = init;
//# sourceMappingURL=squoosh_resize.js.map