"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initArray = initArray;
exports.initArrayConstant = initArrayConstant;
function initArray(size, content) {
    const result = new Array(size);
    for (let i = 0; i < size; ++i) {
        result[i] = content(i);
    }
    return result;
}
function initArrayConstant(size, x) {
    const result = new Array(size);
    for (let i = 0; i < size; ++i) {
        result[i] = x;
    }
    return result;
}
