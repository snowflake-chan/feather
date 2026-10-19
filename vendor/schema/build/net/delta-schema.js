"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeltaListSchema = DeltaListSchema;
exports.DeltaSchema = DeltaSchema;
const schema_1 = require("@box/mudb/schema");
function DeltaListSchema(schema) {
    return new schema_1.MuStruct({
        upserts: schema,
        remove: new schema_1.MuArray(new schema_1.MuUint32(0), Infinity),
    });
}
function DeltaSchema(schema) {
    return new schema_1.MuStruct({
        patch: schema,
        changed: new schema_1.MuBoolean(false),
    });
}
//# sourceMappingURL=delta-schema.js.map