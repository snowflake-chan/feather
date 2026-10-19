"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorDictSchema = exports.CursorSchema = exports.FileDictSchema = exports.FileSchema = exports.FileDictRDA = exports.FileRDA = void 0;
const schema_1 = require("@box/mudb/schema");
const rda_1 = require("@box/mudb/rda");
const murda_text_1 = require("./murda-text");
exports.FileRDA = new rda_1.MuRDAStruct({
    fileId: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    name: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    text: murda_text_1.MuRDAText,
    order: new rda_1.MuRDARegister(new schema_1.MuFloat32()),
    isClient: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    // 是否共享文件
    isShare: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    // 文件是否正在开启共享
    isUploading: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    lockedMapTitle: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    lockedMapId: new rda_1.MuRDARegister(new schema_1.MuVarint(0)),
    size: new rda_1.MuRDARegister(new schema_1.MuVarint(0)),
});
// fileId: file
exports.FileDictRDA = new rda_1.MuRDAMap(new schema_1.MuUTF8(), exports.FileRDA);
exports.FileSchema = exports.FileRDA.stateSchema;
exports.FileDictSchema = exports.FileDictRDA.stateSchema;
exports.CursorSchema = new schema_1.MuStruct({
    sessionId: new schema_1.MuUTF8(),
    name: new schema_1.MuUTF8(),
    fileId: new schema_1.MuUTF8(),
    startPosId: new schema_1.MuUTF8(),
    endPosId: new schema_1.MuUTF8(),
});
exports.CursorDictSchema = new schema_1.MuDictionary(exports.CursorSchema, Infinity);
//# sourceMappingURL=code-editor-common-state.js.map