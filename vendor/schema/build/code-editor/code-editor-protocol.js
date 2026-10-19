"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeEditorProtocol = exports.ShareScriptResSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const code_editor_common_state_1 = require("./code-editor-common-state");
exports.ShareScriptResSchema = new schema_1.MuStruct({
    success: new schema_1.MuBoolean(false),
    errorCode: new schema_1.MuFloat32(),
});
exports.CodeEditorProtocol = {
    name: 'code-editor-protocol',
    client: {
        getSession: new schema_1.MuUTF8(),
        syncFile: code_editor_common_state_1.FileSchema,
        removeFile: new schema_1.MuUTF8(),
        syncCursor: code_editor_common_state_1.CursorSchema,
        syncCursorName: code_editor_common_state_1.CursorSchema,
        removeCursor: new schema_1.MuUTF8(),
        syncCursorDict: code_editor_common_state_1.CursorDictSchema,
        addFileSuccess: new schema_1.MuUTF8(),
        onShareAutoSave: new schema_1.MuUTF8(),
    },
    server: {
        copyFile: new schema_1.MuUTF8(),
        renameFile: new schema_1.MuStruct({
            name: new schema_1.MuUTF8(),
            fileId: new schema_1.MuUTF8(),
        }),
        recoverFile: new schema_1.MuStruct({
            isClient: new schema_1.MuBoolean(),
            name: new schema_1.MuUTF8(),
            hash: new schema_1.MuUTF8(),
        }),
        addFile: new schema_1.MuBoolean(),
        addFileForce: new schema_1.MuStruct({
            fileId: new schema_1.MuUTF8(),
            name: new schema_1.MuUTF8(),
            hash: new schema_1.MuUTF8(),
            isClient: new schema_1.MuBoolean(),
        }),
        selectFile: new schema_1.MuUTF8(),
        blurFile: new schema_1.MuVoid(),
        removeFile: new schema_1.MuUTF8(),
        syncCursorName: new schema_1.MuUTF8(),
        syncCursor: code_editor_common_state_1.CursorSchema,
    },
};
//# sourceMappingURL=code-editor-protocol.js.map