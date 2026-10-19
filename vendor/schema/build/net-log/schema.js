"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetLogSchema = exports.NetLogEventSchema = void 0;
const logger_1 = require("@box/utils/logger");
const schema_1 = require("@box/mudb/schema");
exports.NetLogEventSchema = new schema_1.MuJSON();
exports.NetLogSchema = {
    name: 'net-log',
    client: {
        log: logger_1.LogMessageSchema,
    },
    server: {
        log: new schema_1.MuStruct({
            level: new schema_1.MuVarint(),
            prefix: new schema_1.MuArray(new schema_1.MuASCII(), Infinity),
            message: new schema_1.MuUTF8(),
        }),
        logASCII: new schema_1.MuStruct({
            level: new schema_1.MuVarint(),
            prefix: new schema_1.MuArray(new schema_1.MuASCII(), Infinity),
            message: new schema_1.MuASCII(),
        }),
        logPino: exports.NetLogEventSchema,
    },
};
//# sourceMappingURL=schema.js.map