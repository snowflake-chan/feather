"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedErrorSchema = exports.StackFrameSchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const utf8_1 = require("@box/mudb/schema/utf8");
exports.StackFrameSchema = new struct_1.MuStruct({
    function: new utf8_1.MuUTF8(),
    file: new utf8_1.MuUTF8(),
    line: new uint32_1.MuUint32(),
    column: new uint32_1.MuUint32(),
    source: new utf8_1.MuUTF8(),
    isolate: new boolean_1.MuBoolean(false),
});
exports.ParsedErrorSchema = new struct_1.MuStruct({
    name: new utf8_1.MuUTF8('Error'),
    message: new utf8_1.MuUTF8(),
    stack: new array_1.MuArray(exports.StackFrameSchema, Infinity),
});
