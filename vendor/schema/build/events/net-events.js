"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptNetInputSetSchema = exports.ScriptNetInputSchema = void 0;
const net_schema_1 = require("../net/net-schema");
const schema_1 = require("@box/mudb/schema");
exports.ScriptNetInputSchema = new schema_1.MuStruct(Object.assign({ id: new schema_1.MuVarint(0) }, net_schema_1.NetInputEventSchema.muData));
exports.ScriptNetInputSetSchema = new schema_1.MuArray(exports.ScriptNetInputSchema, Infinity);
//# sourceMappingURL=net-events.js.map