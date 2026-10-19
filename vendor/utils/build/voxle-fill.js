"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillArray = void 0;
function fillArrayAPI(array, value) {
    array.fill(value);
}
function fillArrayPolyfill(array, value) {
    for (let i = 0; i < array.length; ++i) {
        array[i] = value;
    }
}
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array).prototype;
exports.fillArray = typedArrayPrototype && typedArrayPrototype.fill !== undefined
    ? fillArrayAPI
    : fillArrayPolyfill;
