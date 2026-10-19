"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSkinPartSchema = void 0;
const schema_1 = require("@box/mesher/schema");
const schema_2 = require("@box/mudb/schema");
const math_schema_1 = require("../utils/math-schema");
exports.PlayerSkinPartSchema = new schema_2.MuStruct({
    partId: new schema_2.MuUint8(0), // part id
    bindMat: math_schema_1.Mat4Schema,
    mesh: schema_1.MeshDataSchema,
    texture: schema_1.MeshTextureSchema,
});
//# sourceMappingURL=skin-schema.js.map