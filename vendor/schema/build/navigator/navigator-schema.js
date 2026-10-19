"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigatorSchema = exports.MessageEventSchema = exports.ClipboardSchema = exports.PostMessageSchema = exports.PostMessageScriptSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.PostMessageScriptSchema = new schema_1.MuStruct({
    type: new schema_1.MuUTF8(''),
    value: new schema_1.MuStruct({}),
    isOld: new schema_1.MuBoolean(false),
});
exports.PostMessageSchema = new schema_1.MuStruct({
    type: new schema_1.MuUTF8(''),
    value: new schema_1.MuUTF8(''),
    isOld: new schema_1.MuBoolean(false),
});
exports.ClipboardSchema = new schema_1.MuStruct({
    text: new schema_1.MuUTF8(''),
});
// 参照window的MessageEvent，只保留了data属性
exports.MessageEventSchema = new schema_1.MuStruct({
    data: new schema_1.MuJSON({}),
});
exports.NavigatorSchema = new schema_1.MuStruct({
    postMessage: exports.PostMessageSchema,
});
//# sourceMappingURL=navigator-schema.js.map