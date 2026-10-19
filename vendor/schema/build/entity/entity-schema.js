"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityStateSchema = exports.DeletedEntitiesSchema = exports.EntitySetSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.EntitySetSchema = new schema_1.MuSortedArray(new schema_1.MuVarint(), Infinity, (a, b) => a - b);
exports.DeletedEntitiesSchema = new schema_1.MuDictionary(new schema_1.MuBoolean(false), Infinity);
exports.EntityStateSchema = new schema_1.MuStruct({
    counter: new schema_1.MuUint32(1),
    entities: exports.EntitySetSchema,
    pendingDelete: exports.EntitySetSchema,
    deletedEntities: exports.DeletedEntitiesSchema,
});
//# sourceMappingURL=entity-schema.js.map