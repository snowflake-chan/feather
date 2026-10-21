"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationEventSchema = exports.FlyEventSchema = exports.CrouchEventSchema = exports.LeaveWaterEventSchema = exports.EnterWaterEventSchema = exports.SwimStrokeEventSchema = exports.LandEventSchema = exports.DoubleJumpEventSchema = exports.JumpEventSchema = exports.FootStepEventSchema = exports.FootType = void 0;
const schema_1 = require("@box/mudb/schema");
const math_schema_1 = require("../utils/math-schema");
var FootType;
(function (FootType) {
    FootType[FootType["LEFT"] = 0] = "LEFT";
    FootType[FootType["RIGHT"] = 1] = "RIGHT";
})(FootType || (exports.FootType = FootType = {}));
exports.FootStepEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuUint32(),
    blockType: new schema_1.MuUint16(),
    position: math_schema_1.Vec3Schema,
    foot: new schema_1.MuUint8(FootType.LEFT),
});
exports.JumpEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
    scale: new schema_1.MuFloat32(1),
});
exports.DoubleJumpEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
    scale: new schema_1.MuFloat32(1),
});
exports.LandEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.SwimStrokeEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.EnterWaterEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.LeaveWaterEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.CrouchEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.FlyEventSchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    position: math_schema_1.Vec3Schema,
});
exports.AnimationEventSchema = new schema_1.MuStruct({
    footStep: new schema_1.MuArray(exports.FootStepEventSchema, Infinity),
    jump: new schema_1.MuArray(exports.JumpEventSchema, Infinity),
    doubleJump: new schema_1.MuArray(exports.DoubleJumpEventSchema, Infinity),
    land: new schema_1.MuArray(exports.LandEventSchema, Infinity),
    swim: new schema_1.MuArray(exports.SwimStrokeEventSchema, Infinity),
    enterWater: new schema_1.MuArray(exports.EnterWaterEventSchema, Infinity),
    leaveWater: new schema_1.MuArray(exports.LeaveWaterEventSchema, Infinity),
    crouch: new schema_1.MuArray(exports.CrouchEventSchema, Infinity),
    startFly: new schema_1.MuArray(exports.FlyEventSchema, Infinity),
    stopFly: new schema_1.MuArray(exports.FlyEventSchema, Infinity),
});
//# sourceMappingURL=animation-event-schema.js.map