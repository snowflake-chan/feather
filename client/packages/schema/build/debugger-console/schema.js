"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedErrorSchema = exports.StackFrameSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.StackFrameSchema = new schema_1.MuStruct({
    function: new schema_1.MuUTF8(),
    file: new schema_1.MuUTF8(),
    line: new schema_1.MuUint32(),
    column: new schema_1.MuUint32(),
    source: new schema_1.MuUTF8(),
    isolate: new schema_1.MuBoolean(false),
});
exports.ParsedErrorSchema = new schema_1.MuStruct({
    name: new schema_1.MuUTF8('Error'),
    message: new schema_1.MuUTF8(),
    stack: new schema_1.MuArray(exports.StackFrameSchema, Infinity),
});
//# sourceMappingURL=schema.js.map