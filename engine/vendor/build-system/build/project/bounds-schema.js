"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntBoundsSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.IntBoundsSchema = new schema_1.MuStruct({
    lox: new schema_1.MuVarint(),
    loy: new schema_1.MuVarint(),
    loz: new schema_1.MuVarint(),
    hix: new schema_1.MuVarint(),
    hiy: new schema_1.MuVarint(),
    hiz: new schema_1.MuVarint(),
});
//# sourceMappingURL=bounds-schema.js.map