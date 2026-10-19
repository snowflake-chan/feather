"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IKAnimationListSchema = exports.IKInputSchema = exports.IKStateSchema = exports.IKPaletteSchema = exports.IKConfigurationSchema = exports.IKPointSchema = exports.IKPoseArraySchema = exports.IKPoseSchema = exports.IKRigSchema = exports.SpringParametersSchema = exports.SpringStateSchema = exports.GroundEmote = void 0;
exports.getTicksBySecond = getTicksBySecond;
exports.rateKey = rateKey;
exports.cycleKey = cycleKey;
const array_1 = require("@box/mudb/schema/array");
const boolean_1 = require("@box/mudb/schema/boolean");
const float32_1 = require("@box/mudb/schema/float32");
const float64_1 = require("@box/mudb/schema/float64");
const sorted_array_1 = require("@box/mudb/schema/sorted-array");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const uint8_1 = require("@box/mudb/schema/uint8");
const math_schema_1 = require("../utils/math-schema");
const id_1 = require("@box/utils/id");
const player_schema_1 = require("../player/player-schema");
const clock_schema_1 = require("../clock/clock-schema");
var GroundEmote;
(function (GroundEmote) {
    GroundEmote[GroundEmote["none"] = 0] = "none";
    GroundEmote[GroundEmote["dead"] = 1] = "dead";
    GroundEmote[GroundEmote["wave"] = 2] = "wave";
    GroundEmote[GroundEmote["thomas"] = 3] = "thomas";
    GroundEmote[GroundEmote["swing"] = 4] = "swing";
    GroundEmote[GroundEmote["cheer"] = 5] = "cheer";
    GroundEmote[GroundEmote["collapse"] = 6] = "collapse";
    GroundEmote[GroundEmote["applaud"] = 7] = "applaud";
})(GroundEmote || (exports.GroundEmote = GroundEmote = {}));
exports.SpringStateSchema = new struct_1.MuStruct({
    x: new float32_1.MuFloat32(),
    dx: new float32_1.MuFloat32(),
});
exports.SpringParametersSchema = new struct_1.MuStruct({
    stiffness: new float32_1.MuFloat32(0.05),
    damping: new float32_1.MuFloat32(2.09),
});
exports.IKRigSchema = new struct_1.MuStruct({
    footLength: new float32_1.MuFloat32(),
    hipWidth: new float32_1.MuFloat32(),
    neckLength: new float32_1.MuFloat32(),
    shoulderWidth: new float32_1.MuFloat32(),
    upperTorsoLength: new float32_1.MuFloat32(),
    lowerTorsoLength: new float32_1.MuFloat32(),
    upperLegLength: new float32_1.MuFloat32(),
    lowerLegLength: new float32_1.MuFloat32(),
    upperArmLength: new float32_1.MuFloat32(),
    lowerArmLength: new float32_1.MuFloat32(),
});
exports.IKPoseSchema = new struct_1.MuStruct({
    // left leg
    leftPlant: new float32_1.MuFloat32(0),
    leftFootPosition: math_schema_1.Vec3Schema,
    leftToePosition: math_schema_1.Vec3Schema,
    leftKneeDirection: math_schema_1.Vec3Schema,
    // right leg
    rightPlant: new float32_1.MuFloat32(0),
    rightFootPosition: math_schema_1.Vec3Schema,
    rightToePosition: math_schema_1.Vec3Schema,
    rightKneeDirection: math_schema_1.Vec3Schema,
    // left arm
    leftHandPosition: math_schema_1.Vec3Schema,
    leftHandOrientation: math_schema_1.QuatSchema,
    leftElbowDirection: math_schema_1.Vec3Schema,
    leftShoulderPosition: math_schema_1.Vec3Schema,
    // right arm
    rightHandPosition: math_schema_1.Vec3Schema,
    rightHandOrientation: math_schema_1.QuatSchema,
    rightElbowDirection: math_schema_1.Vec3Schema,
    rightShoulderPosition: math_schema_1.Vec3Schema,
    // torso and hips
    hipPosition: math_schema_1.Vec3Schema,
    hipOrientation: math_schema_1.QuatSchema,
    spineDirection: math_schema_1.Vec3Schema,
    // head
    headPosition: math_schema_1.Vec3Schema,
    headOrientation: math_schema_1.QuatSchema,
});
exports.IKPoseArraySchema = new array_1.MuArray(exports.IKPoseSchema, Infinity);
exports.IKPointSchema = new struct_1.MuStruct({
    leftHip: math_schema_1.Vec3Schema,
    leftKnee: math_schema_1.Vec3Schema,
    leftFoot: math_schema_1.Vec3Schema,
    leftToe: math_schema_1.Vec3Schema,
    rightHip: math_schema_1.Vec3Schema,
    rightKnee: math_schema_1.Vec3Schema,
    rightFoot: math_schema_1.Vec3Schema,
    rightToe: math_schema_1.Vec3Schema,
    leftShoulder: math_schema_1.Vec3Schema,
    leftElbow: math_schema_1.Vec3Schema,
    leftHand: math_schema_1.Vec3Schema,
    rightShoulder: math_schema_1.Vec3Schema,
    rightElbow: math_schema_1.Vec3Schema,
    rightHand: math_schema_1.Vec3Schema,
    hips: math_schema_1.Vec3Schema,
    spine: math_schema_1.Vec3Schema,
    neck: math_schema_1.Vec3Schema,
    head: math_schema_1.Vec3Schema,
});
exports.IKConfigurationSchema = new struct_1.MuStruct({
    hips: math_schema_1.Mat4Schema,
    torso: math_schema_1.Mat4Schema,
    neck: math_schema_1.Mat4Schema,
    head: math_schema_1.Mat4Schema,
    leftShoulder: math_schema_1.Mat4Schema,
    leftUpperArm: math_schema_1.Mat4Schema,
    leftLowerArm: math_schema_1.Mat4Schema,
    leftHand: math_schema_1.Mat4Schema,
    rightShoulder: math_schema_1.Mat4Schema,
    rightUpperArm: math_schema_1.Mat4Schema,
    rightLowerArm: math_schema_1.Mat4Schema,
    rightHand: math_schema_1.Mat4Schema,
    leftUpperLeg: math_schema_1.Mat4Schema,
    leftLowerLeg: math_schema_1.Mat4Schema,
    leftFoot: math_schema_1.Mat4Schema,
    rightUpperLeg: math_schema_1.Mat4Schema,
    rightLowerLeg: math_schema_1.Mat4Schema,
    rightFoot: math_schema_1.Mat4Schema,
});
function getTicksBySecond(second) {
    return (second * 1000) / clock_schema_1.MS_PER_TICK;
}
function rateKey(motionName) {
    return `${motionName}Rate`;
}
function cycleKey(motionName) {
    return `${motionName}Cycle`;
}
exports.IKPaletteSchema = new struct_1.MuStruct({
    skeleton: exports.IKRigSchema,
    idle: exports.IKPoseSchema,
    crouchIdle: exports.IKPoseSchema,
    // walk cycles
    walk: exports.IKPoseArraySchema,
    walkStride: new float32_1.MuFloat32(4.36),
    walkCycle: new float32_1.MuFloat32(13.45),
    walkVelocity: new float32_1.MuFloat32(0.324),
    run: exports.IKPoseArraySchema,
    runStride: new float32_1.MuFloat32(4.06),
    runCycle: new float32_1.MuFloat32(5.75),
    runVelocity: new float32_1.MuFloat32(0.706),
    // falling and jumping
    jump: exports.IKPoseSchema,
    fall: exports.IKPoseSchema,
    land: exports.IKPoseSchema,
    roll: exports.IKPoseSchema,
    fly: exports.IKPoseSchema,
    landRate: new float32_1.MuFloat32(0.12),
    rollRate: new float32_1.MuFloat32(0.15),
    // swim
    swimIdle: exports.IKPoseArraySchema,
    swimIdleCycle: new float32_1.MuFloat32(0.0625),
    // swim movement cycle
    swim: exports.IKPoseArraySchema,
    swimStride: new float32_1.MuFloat32(9.63),
    swimCycle: new float32_1.MuFloat32(1),
    // emotes
    dead: exports.IKPoseArraySchema,
    deadRate: new float32_1.MuFloat32(0.1),
    wave: exports.IKPoseArraySchema,
    waveRate: new float32_1.MuFloat32(1 / getTicksBySecond(2)),
    thomas: exports.IKPoseArraySchema,
    thomasRate: new float32_1.MuFloat32(1 / getTicksBySecond(1)),
    // 托马斯动画重复播放3次
    thomasCycle: new float32_1.MuFloat32(3),
    swing: exports.IKPoseArraySchema,
    swingRate: new float32_1.MuFloat32(1 / getTicksBySecond(3)),
    cheer: exports.IKPoseArraySchema,
    cheerRate: new float32_1.MuFloat32(1 / getTicksBySecond(0.6)),
    // 欢呼动画重复播放4次
    cheerCycle: new float32_1.MuFloat32(4),
    collapse: exports.IKPoseArraySchema,
    collapseRate: new float32_1.MuFloat32(1 / getTicksBySecond(0.7)),
    // 倒地动画播放完成后在最后一帧停留3秒
    collapsePause: new float32_1.MuFloat32(3),
    applaud: exports.IKPoseArraySchema,
    applaudRate: new float32_1.MuFloat32(1 / getTicksBySecond(1.2)),
    // squash/stretch damping factor
    stretchSpring: exports.SpringParametersSchema,
    // interpolation
    interpolateStiffness: new float32_1.MuFloat32(37.5),
    // acceleration weights
    accelerationDecay: new float32_1.MuFloat32(1),
    accelerationScale: new float32_1.MuFloat32(0.77),
    accelerationCap: new float32_1.MuFloat32(0.1),
    // minimum velocity for walking to play
    walkThreshold: new float32_1.MuFloat32(0.1),
    // foot offset
    footOffset: new float32_1.MuFloat32(0.02),
    // foot correction weight
    turnCorrection: new float32_1.MuFloat32(0.125),
    // turn rate
    turnStiffness: new float32_1.MuFloat32(4),
    // breathing
    breathRate: new float32_1.MuFloat32(0.05),
    breathMagnitude: new float32_1.MuFloat32(0.005),
    // hand movement in the air
    jitterScale: new float32_1.MuFloat32(0.02),
    jitterRate: new float32_1.MuFloat32(0.1),
    // minimum y velocity for land animation
    landThreshold: new float32_1.MuFloat32(0.7),
});
exports.IKStateSchema = new struct_1.MuStruct({
    id: new uint32_1.MuUint32(),
    // tick accumulator
    tickAccumulator: new float64_1.MuFloat64(),
    priorityAccumulator: new float64_1.MuFloat64(),
    // animation state
    pose: exports.IKPoseSchema,
    points: exports.IKPointSchema,
    configuration: exports.IKConfigurationSchema,
    meshBound: player_schema_1.PlayerMeshBoundSchema,
    // if crouching set
    crouch: new boolean_1.MuBoolean(),
    swimming: new boolean_1.MuBoolean(),
    flying: new boolean_1.MuBoolean(),
    // x/z facing vector for player
    facing: math_schema_1.Vec2Schema,
    walkPhase: new float32_1.MuFloat32(),
    swimPhase: new float32_1.MuFloat32(),
    breathPhase: new float32_1.MuFloat32(),
    jitterPhase: new float32_1.MuFloat32(),
    rollPhase: new float32_1.MuFloat32(),
    landPhase: new float32_1.MuFloat32(),
    groundEmotePhase: new float32_1.MuFloat32(),
    pushPhase: new float32_1.MuFloat32(),
    leftHandStick: math_schema_1.Vec3Schema,
    rightHandStick: math_schema_1.Vec3Schema,
    hitBound: new struct_1.MuStruct({
        lo: math_schema_1.Vec3Schema,
        hi: math_schema_1.Vec3Schema,
    }),
    hitVector: math_schema_1.Vec3Schema,
    // pain animation modifiers
    damageTwitch: math_schema_1.Vec3Schema,
    hurtFlash: new float32_1.MuFloat32(0),
    turnCorrection: new float32_1.MuFloat32(0),
    hipCorrection: new float32_1.MuFloat32(0),
    stretchSpring: exports.SpringStateSchema,
    ground: new float32_1.MuFloat32(0),
    groundEmote: new uint8_1.MuUint8(GroundEmote.none),
    // dynamics variables
    position: math_schema_1.Vec3Schema,
    velocity: math_schema_1.Vec3Schema,
    acceleration: math_schema_1.Vec3Schema,
    landVelocity: new float32_1.MuFloat32(0),
});
exports.IKInputSchema = new struct_1.MuStruct({
    // rig
    rig: exports.IKRigSchema,
    // scale
    scale: new float64_1.MuFloat64(1),
    // rigid body bounds
    bounds: math_schema_1.Vec3Schema,
    // input stuff
    inputAxis: math_schema_1.Vec3Schema,
    inputState: new uint8_1.MuUint8(0),
    // physics parameters
    position: math_schema_1.Vec3Schema,
    velocity: math_schema_1.Vec3Schema,
    // moving platform info
    platformVelocity: math_schema_1.Vec3Schema,
    // state parameters
    crouch: new boolean_1.MuBoolean(false),
    ground: new boolean_1.MuBoolean(true),
    water: new boolean_1.MuBoolean(false),
    fly: new boolean_1.MuBoolean(false),
    dead: new boolean_1.MuBoolean(false),
    jumpState: new uint8_1.MuUint8(0),
    hitVector: math_schema_1.Vec3Schema,
    hitBound: new struct_1.MuStruct({
        lo: math_schema_1.Vec3Schema,
        hi: math_schema_1.Vec3Schema,
    }),
});
exports.IKAnimationListSchema = new sorted_array_1.MuSortedArray(exports.IKStateSchema, Infinity, id_1.compareId);
