"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitArraySchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.BitArraySchema = new schema_1.MuStruct({
    size: new schema_1.MuVarint(),
    data: new schema_1.MuArray(new schema_1.MuUint32(), Infinity),
});
//# sourceMappingURL=bitarray-schema.js.map