import { decodeUTF8 } from "@box/mudb/stream";

let wasm;

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeUTF8(getUint8Memory0().subarray(ptr, ptr + len));
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
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
* @param {Uint8Array} data
* @param {number} level
* @returns {Uint8Array}
*/
export function optimise(data, level) {
    try {
        const retptr = wasm.__wbindgen_export_0.value - 16;
        wasm.__wbindgen_export_0.value = retptr;
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.optimise(retptr, ptr0, len0, level);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);

        return v1;
    } finally {
        wasm.__wbindgen_export_0.value += 16;
    }
}


export function optimiseNoCopy(data, level) {
    try {
        const retptr = wasm.__wbindgen_export_0.value - 16;
        wasm.__wbindgen_export_0.value = retptr;
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.optimise(retptr, ptr0, len0, level);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return [r0, r1 * 1, getArrayU8FromWasm0(r0, r1)];
    } finally {
        wasm.__wbindgen_export_0.value += 16;
    }
}

export function free (r0, r1) {
    return wasm.__wbindgen_free(r0, r1);
}

async function load(module, imports) {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
        return { instance, module };

    } else {
        return instance;
    }
}

async function init(input) {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    const { instance, module } = await load(input, imports);
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    return wasm;
}

export default init;

