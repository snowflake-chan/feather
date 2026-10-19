"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebuggerProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
const schema_2 = require("./schema");
exports.DebuggerProtocol = {
    name: 'debugger',
    client: {
        updateLog: new schema_1.MuStruct({
            level: new schema_1.MuUint8(),
            message: new schema_1.MuUTF8(),
        }),
        scriptException: schema_2.ParsedErrorSchema,
        scriptEvalResult: new schema_1.MuStruct({
            token: new schema_1.MuVarint(),
            error: new schema_1.MuBoolean(true),
            result: new schema_1.MuUTF8(),
        }),
        clearLog: new schema_1.MuVoid(),
    },
    server: {
        scriptEval: new schema_1.MuStruct({
            token: new schema_1.MuVarint(),
            expr: new schema_1.MuUTF8(),
        }),
        /** Browser-side script output, relayed to the editor and Creator CLI. */
        clientLog: new schema_1.MuStruct({
            level: new schema_1.MuUint8(),
            message: new schema_1.MuUTF8(),
        }),
        clientException: schema_2.ParsedErrorSchema,
        clientClearLog: new schema_1.MuVoid(),
    },
};
//# sourceMappingURL=protocol.js.map