"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogProtocol = exports.CloseDialogSchema = exports.OpenDialogSchema = exports.DialogResultSchema = exports.DialogConfigSchema = exports.SelectDialogConfigSchema = exports.InputDialogConfigSchema = exports.TextDialogConfigSchema = exports.DialogCommonConfigSchema = exports.XYZSchema = exports.RGBASchema = void 0;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const quantized_float_1 = require("@box/mudb/schema/quantized-float");
const struct_1 = require("@box/mudb/schema/struct");
const union_1 = require("@box/mudb/schema/union");
const utf8_1 = require("@box/mudb/schema/utf8");
const varint_1 = require("@box/mudb/schema/varint");
const void_1 = require("@box/mudb/schema/void");
exports.RGBASchema = new struct_1.MuStruct({
    r: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    g: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    b: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
    a: new quantized_float_1.MuQuantizedFloat(1 / 256, 1),
});
exports.XYZSchema = new struct_1.MuStruct({
    x: new quantized_float_1.MuQuantizedFloat(1 / 64, 0),
    y: new quantized_float_1.MuQuantizedFloat(1 / 64, 0),
    z: new quantized_float_1.MuQuantizedFloat(1 / 64, 0),
});
exports.DialogCommonConfigSchema = new struct_1.MuStruct({
    title: new utf8_1.MuUTF8(''),
    content: new utf8_1.MuUTF8(''),
    titleBackgroundColor: exports.RGBASchema,
    titleTextColor: exports.RGBASchema,
    contentBackgroundColor: exports.RGBASchema,
    contentTextColor: exports.RGBASchema,
    lookTargetEnabled: new boolean_1.MuBoolean(),
    lookTargetEntity: new varint_1.MuVarint(0),
    lookTargetOffset: exports.XYZSchema,
    lookUpEnabled: new boolean_1.MuBoolean(),
    lookUp: exports.XYZSchema,
    lookEyeEnabled: new boolean_1.MuBoolean(),
    lookEyeEntity: new varint_1.MuVarint(0),
    lookEyeOffset: exports.XYZSchema,
});
exports.TextDialogConfigSchema = new struct_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    hasArrow: new boolean_1.MuBoolean(false),
});
exports.InputDialogConfigSchema = new struct_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    placeholder: new utf8_1.MuUTF8(),
    confirmText: new utf8_1.MuUTF8(),
});
exports.SelectDialogConfigSchema = new struct_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    options: new array_1.MuArray(new utf8_1.MuUTF8(), Infinity),
});
exports.DialogConfigSchema = new union_1.MuUnion({
    // TODO: you can add more dialog types here
    text: exports.TextDialogConfigSchema,
    input: exports.InputDialogConfigSchema,
    select: exports.SelectDialogConfigSchema,
});
const DialogSelectResultSchema = new struct_1.MuStruct({
    index: new varint_1.MuVarint(),
    value: new utf8_1.MuUTF8(),
});
exports.DialogResultSchema = new union_1.MuUnion({
    close: new void_1.MuVoid(),
    // TODO: you can add more dialog response types here
    // must use same names as in config schema
    text: new utf8_1.MuUTF8(),
    input: new utf8_1.MuUTF8(),
    select: DialogSelectResultSchema,
});
exports.OpenDialogSchema = new struct_1.MuStruct({
    rpcId: new varint_1.MuVarint(),
    config: exports.DialogConfigSchema,
});
exports.CloseDialogSchema = new struct_1.MuStruct({
    rpcId: new varint_1.MuVarint(),
    result: exports.DialogResultSchema,
});
exports.DialogProtocol = {
    name: 'dialog',
    client: {
        open: exports.OpenDialogSchema,
        cancelDialogs: new void_1.MuVoid(),
        cancelDialog: new varint_1.MuVarint(),
    },
    server: {
        close: exports.CloseDialogSchema,
    },
};
