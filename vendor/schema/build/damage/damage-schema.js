"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageSetSchema = exports.DamageSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
exports.DamageSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    // display style
    showHealthBar: new schema_1.MuBoolean(true),
    // damage level
    hp: new schema_1.MuQuantizedFloat(1 / 256, 100),
    maxHp: new schema_1.MuQuantizedFloat(1 / 256, 100),
});
exports.DamageSetSchema = new schema_1.MuSortedArray(exports.DamageSchema, Infinity, id_1.compareId);
//# sourceMappingURL=damage-schema.js.map