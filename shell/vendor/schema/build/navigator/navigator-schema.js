"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigatorSchema = exports.MessageEventSchema = exports.ClipboardSchema = exports.PostMessageSchema = exports.PostMessageScriptSchema = void 0;
const boolean_1 = require("@box/mudb/schema/boolean");
const json_1 = require("@box/mudb/schema/json");
const struct_1 = require("@box/mudb/schema/struct");
const utf8_1 = require("@box/mudb/schema/utf8");
exports.PostMessageScriptSchema = new struct_1.MuStruct({
    type: new utf8_1.MuUTF8(''),
    value: new struct_1.MuStruct({}),
    isOld: new boolean_1.MuBoolean(false),
});
exports.PostMessageSchema = new struct_1.MuStruct({
    type: new utf8_1.MuUTF8(''),
    value: new utf8_1.MuUTF8(''),
    isOld: new boolean_1.MuBoolean(false),
});
exports.ClipboardSchema = new struct_1.MuStruct({
    text: new utf8_1.MuUTF8(''),
});
// 参照window的MessageEvent，只保留了data属性
exports.MessageEventSchema = new struct_1.MuStruct({
    data: new json_1.MuJSON({}),
});
exports.NavigatorSchema = new struct_1.MuStruct({
    postMessage: exports.PostMessageSchema,
});
