"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerEventSchema = exports.PlayerInputEventSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const math_schema_1 = require("../utils/math-schema");
exports.PlayerInputEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    button: new schema_1.MuVarint(),
    press: new schema_1.MuBoolean(),
    position: math_schema_1.Vec3Schema,
});
exports.PlayerEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
//# sourceMappingURL=player-event-schema.js.map