"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogProtocol = exports.CloseDialogSchema = exports.OpenDialogSchema = exports.DialogResultSchema = exports.DialogConfigSchema = exports.SelectDialogConfigSchema = exports.InputDialogConfigSchema = exports.TextDialogConfigSchema = exports.DialogCommonConfigSchema = exports.XYZSchema = exports.RGBASchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.RGBASchema = new schema_1.MuStruct({
    r: new schema_1.MuQuantizedFloat(1 / 256, 1),
    g: new schema_1.MuQuantizedFloat(1 / 256, 1),
    b: new schema_1.MuQuantizedFloat(1 / 256, 1),
    a: new schema_1.MuQuantizedFloat(1 / 256, 1),
});
exports.XYZSchema = new schema_1.MuStruct({
    x: new schema_1.MuQuantizedFloat(1 / 64, 0),
    y: new schema_1.MuQuantizedFloat(1 / 64, 0),
    z: new schema_1.MuQuantizedFloat(1 / 64, 0),
});
exports.DialogCommonConfigSchema = new schema_1.MuStruct({
    title: new schema_1.MuUTF8(''),
    content: new schema_1.MuUTF8(''),
    titleBackgroundColor: exports.RGBASchema,
    titleTextColor: exports.RGBASchema,
    contentBackgroundColor: exports.RGBASchema,
    contentTextColor: exports.RGBASchema,
    lookTargetEnabled: new schema_1.MuBoolean(),
    lookTargetEntity: new schema_1.MuVarint(0),
    lookTargetOffset: exports.XYZSchema,
    lookUpEnabled: new schema_1.MuBoolean(),
    lookUp: exports.XYZSchema,
    lookEyeEnabled: new schema_1.MuBoolean(),
    lookEyeEntity: new schema_1.MuVarint(0),
    lookEyeOffset: exports.XYZSchema,
});
exports.TextDialogConfigSchema = new schema_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    hasArrow: new schema_1.MuBoolean(false),
});
exports.InputDialogConfigSchema = new schema_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    placeholder: new schema_1.MuUTF8(),
    confirmText: new schema_1.MuUTF8(),
});
exports.SelectDialogConfigSchema = new schema_1.MuStruct({
    common: exports.DialogCommonConfigSchema,
    options: new schema_1.MuArray(new schema_1.MuUTF8(), Infinity),
});
exports.DialogConfigSchema = new schema_1.MuUnion({
    // TODO: you can add more dialog types here
    text: exports.TextDialogConfigSchema,
    input: exports.InputDialogConfigSchema,
    select: exports.SelectDialogConfigSchema,
});
const DialogSelectResultSchema = new schema_1.MuStruct({
    index: new schema_1.MuVarint(),
    value: new schema_1.MuUTF8(),
});
exports.DialogResultSchema = new schema_1.MuUnion({
    close: new schema_1.MuVoid(),
    // TODO: you can add more dialog response types here
    // must use same names as in config schema
    text: new schema_1.MuUTF8(),
    input: new schema_1.MuUTF8(),
    select: DialogSelectResultSchema,
});
exports.OpenDialogSchema = new schema_1.MuStruct({
    rpcId: new schema_1.MuVarint(),
    config: exports.DialogConfigSchema,
});
exports.CloseDialogSchema = new schema_1.MuStruct({
    rpcId: new schema_1.MuVarint(),
    result: exports.DialogResultSchema,
});
exports.DialogProtocol = {
    name: 'dialog',
    client: {
        open: exports.OpenDialogSchema,
        cancelDialogs: new schema_1.MuVoid(),
        cancelDialog: new schema_1.MuVarint(),
    },
    server: {
        close: exports.CloseDialogSchema,
    },
};
//# sourceMappingURL=dialog-protocol.js.map