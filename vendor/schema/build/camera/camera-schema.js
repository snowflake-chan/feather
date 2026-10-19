"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraSchema = exports.CameraConfigurationSchema = exports.CameraFreezedAxis = exports.CameraMode = exports.MIN_CAMERA_DISTANCE = exports.EMISSIVE_SCALE = exports.UP = void 0;
const gl_matrix_1 = require("gl-matrix");
const boolean_1 = require("@box/mudb/schema/boolean");
const float64_1 = require("@box/mudb/schema/float64");
const struct_1 = require("@box/mudb/schema/struct");
const uint8_1 = require("@box/mudb/schema/uint8");
const varint_1 = require("@box/mudb/schema/varint");
const math_schema_1 = require("../utils/math-schema");
const frustum_schema_1 = require("../utils/frustum-schema");
const quantized_schema_1 = require("../utils/quantized-schema");
exports.UP = gl_matrix_1.vec3.fromValues(0, 1, 0);
exports.EMISSIVE_SCALE = 100;
exports.MIN_CAMERA_DISTANCE = 0.01;
var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["FOLLOW"] = 0] = "FOLLOW";
    CameraMode[CameraMode["FIXED"] = 1] = "FIXED";
    CameraMode[CameraMode["FPS"] = 2] = "FPS";
    CameraMode[CameraMode["RELATIVE"] = 3] = "RELATIVE";
})(CameraMode || (exports.CameraMode = CameraMode = {}));
var CameraFreezedAxis;
(function (CameraFreezedAxis) {
    CameraFreezedAxis[CameraFreezedAxis["NONE"] = 0] = "NONE";
    CameraFreezedAxis[CameraFreezedAxis["X"] = 1] = "X";
    CameraFreezedAxis[CameraFreezedAxis["Y"] = 2] = "Y";
    CameraFreezedAxis[CameraFreezedAxis["Z"] = 4] = "Z";
})(CameraFreezedAxis || (exports.CameraFreezedAxis = CameraFreezedAxis = {}));
exports.CameraConfigurationSchema = new struct_1.MuStruct({
    mode: new uint8_1.MuUint8(CameraMode.FOLLOW),
    targetId: new varint_1.MuVarint(),
    eye: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(0, 0, 0)),
    up: new quantized_schema_1.QuantizedVec3Schema(1 / 1024, gl_matrix_1.vec3.fromValues(0, 1, 0)),
    target: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(0, 0, 0)),
    freezedAxis: new uint8_1.MuUint8(0),
    fovY: new quantized_schema_1.QuantizedScalar(1 / 256, 0.25),
    distance: new quantized_schema_1.QuantizedScalar(1 / 256, 8.5),
});
exports.CameraSchema = new struct_1.MuStruct({
    // Screen pixel ratio
    viewport: math_schema_1.Vec2Schema,
    // Cursor position in screen coordinates
    cursor: math_schema_1.Vec2Schema,
    cursorRay: math_schema_1.Vec3Schema,
    axis: math_schema_1.Vec3Schema,
    // View-projection transform
    view: math_schema_1.Mat4Schema,
    projection: math_schema_1.Mat4Schema,
    // Computed transforms
    viewProjection: math_schema_1.Mat4Schema,
    invView: math_schema_1.Mat4Schema,
    invProjection: math_schema_1.Mat4Schema,
    invViewProjection: math_schema_1.Mat4Schema,
    // Frustum
    frustum: frustum_schema_1.FrustumSchema,
    // animation stuff
    eye: math_schema_1.Vec3Schema,
    eyeVelocity: math_schema_1.Vec3Schema,
    rotation: math_schema_1.QuatSchema,
    distance: new float64_1.MuFloat64(8.5),
    currentDistance: new float64_1.MuFloat64(8.5),
    // eye target stuff
    targetEye: math_schema_1.Vec3Schema,
    targetLook: math_schema_1.Vec3Schema,
    targetRotation: math_schema_1.QuatSchema,
    // projection matrix configuration
    fovY: new float64_1.MuFloat64(Math.PI / 4),
    zNear: new float64_1.MuFloat64(0.25),
    zFar: new float64_1.MuFloat64(512),
    freezeFovY: new boolean_1.MuBoolean(false),
    // Camera eye types
    eyeVoxel: new varint_1.MuVarint(0),
    underwater: new boolean_1.MuBoolean(false),
    // Focal distance
    focalDistance: new float64_1.MuFloat64(8),
    crosshairSeparation: new float64_1.MuFloat64(0),
    // Exposure
    targetExposure: new float64_1.MuFloat64(1 / 100),
    currentExposure: new float64_1.MuFloat64(1 / 100),
    logExposureVelocity: new float64_1.MuFloat64(0),
    // crepuscular ray stuff
    screenLightPos: math_schema_1.Vec3Schema,
    eyeFogAmount: new float64_1.MuFloat64(0),
    // FPS id (skip rendering this player)
    fpsID: new varint_1.MuVarint(0),
});
