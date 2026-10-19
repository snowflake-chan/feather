"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentStateSchema = exports.EnvironmentParamSchema = void 0;
const project_rda_1 = require("../project/project-rda");
const boolean_1 = require("@box/mudb/schema/boolean");
const float32_1 = require("@box/mudb/schema/float32");
const float64_1 = require("@box/mudb/schema/float64");
const struct_1 = require("@box/mudb/schema/struct");
const math_schema_1 = require("../utils/math-schema");
exports.EnvironmentParamSchema = project_rda_1.EnvironmentRDA.stateSchema;
exports.EnvironmentStateSchema = new struct_1.MuStruct({
    timeOfDay: new float64_1.MuFloat64(0),
    sunUp: new boolean_1.MuBoolean(false),
    globalLight: new float64_1.MuFloat64(0),
    gamma: new float32_1.MuFloat32(1.3),
    drawDistance: new float32_1.MuFloat32(512),
    freezeDrawDistance: new boolean_1.MuBoolean(false),
    sunDirection: math_schema_1.Vec3Schema,
    sunColor: math_schema_1.Vec3Schema,
    skyLeft: math_schema_1.Vec3Schema,
    skyRight: math_schema_1.Vec3Schema,
    skyTop: math_schema_1.Vec3Schema,
    skyBottom: math_schema_1.Vec3Schema,
    skyFront: math_schema_1.Vec3Schema,
    skyBack: math_schema_1.Vec3Schema,
    fogParams: math_schema_1.Vec4Schema,
    fogParams2: math_schema_1.Vec4Schema,
    fogParams3: math_schema_1.Vec4Schema,
});
