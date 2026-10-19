"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptPerfCounterSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.ScriptPerfCounterSchema = new schema_1.MuStruct({
    pqAllocCount: new schema_1.MuVarint(),
    pqFreeCount: new schema_1.MuVarint(),
    pqScheduled: new schema_1.MuVarint(),
    pqTimeouts: new schema_1.MuVarint(),
});
