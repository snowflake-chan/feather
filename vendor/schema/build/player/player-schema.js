"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerIndexSchema = exports.PlayerSetSchema = exports.PlayerSchema = exports.PlayerOccupancyFlags = exports.PlayerFlags = exports.PLAYER_CONFIG_PRECISION = exports.PlayerDisplaySetSchema = exports.PlayerDisplaySchema = exports.InputDirectionState = exports.PlayerDisplayFlags = exports.PlayerInputSetSchema = exports.PlayerInputSchema = exports.PlayerJumpState = exports.PlayerButtonState = exports.PlayerWalkState = exports.PlayerFlyState = exports.PlayerSkinInvisibleSchema = exports.PlayerSkinIdSchema = exports.PlayerSkinNameSchema = exports.PlayerSkinHashSchema = exports.PlayerAttachmentStateSchema = exports.PlayerMeshBoundSchema = exports.MeshBoundSchema = exports.BODY_PART_DEFAULT_ROTATIONS = exports.BODY_PART_DEFAULT_SCALE = exports.BodyPart = exports.PlayerAttachmentSetSchema = exports.PlayerAttachmentSchema = exports.PlayerLoginState = void 0;
exports.playerStateBits = playerStateBits;
exports.playerFlyState = playerFlyState;
exports.playerWalkState = playerWalkState;
exports.playerJumpState = playerJumpState;
exports.playerButtonState = playerButtonState;
const schema_1 = require("@box/mudb/schema");
const id_1 = require("@box/utils/id");
const quantized_schema_1 = require("../utils/quantized-schema");
const permission_rda_1 = require("../permissions/permission-rda");
const gl_matrix_1 = require("gl-matrix");
const math_schema_1 = require("../utils/math-schema");
var PlayerLoginState;
(function (PlayerLoginState) {
    PlayerLoginState[PlayerLoginState["UNKNOWN"] = 0] = "UNKNOWN";
    PlayerLoginState[PlayerLoginState["USER"] = 1] = "USER";
    PlayerLoginState[PlayerLoginState["GUEST"] = 2] = "GUEST";
    // we may need to support later:
    // ADMIN,
})(PlayerLoginState || (exports.PlayerLoginState = PlayerLoginState = {}));
exports.PlayerAttachmentSchema = new schema_1.MuStruct({
    // mesh
    meshId: new schema_1.MuVarint(),
    // material modifiers
    red: new schema_1.MuQuantizedFloat(1 / 256, 1),
    green: new schema_1.MuQuantizedFloat(1 / 256, 1),
    blue: new schema_1.MuQuantizedFloat(1 / 256, 1),
    emissive: new schema_1.MuQuantizedFloat(1 / 256, 0),
    shininess: new schema_1.MuQuantizedFloat(1 / 256, 0),
    metalness: new schema_1.MuQuantizedFloat(1 / 256, 0),
    // bind matrix
    offset: new quantized_schema_1.QuantizedVec3Schema(1 / 256),
    scale: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1)),
    orientation: new quantized_schema_1.QuantizedVec4Schema(1 / 256, gl_matrix_1.vec4.fromValues(1, 0, 0, 0)),
});
exports.PlayerAttachmentSetSchema = new schema_1.MuArray(exports.PlayerAttachmentSchema, Infinity);
var BodyPart;
(function (BodyPart) {
    BodyPart[BodyPart["hips"] = 0] = "hips";
    BodyPart[BodyPart["torso"] = 1] = "torso";
    BodyPart[BodyPart["neck"] = 2] = "neck";
    BodyPart[BodyPart["head"] = 3] = "head";
    BodyPart[BodyPart["leftShoulder"] = 4] = "leftShoulder";
    BodyPart[BodyPart["leftUpperArm"] = 5] = "leftUpperArm";
    BodyPart[BodyPart["leftLowerArm"] = 6] = "leftLowerArm";
    BodyPart[BodyPart["leftHand"] = 7] = "leftHand";
    BodyPart[BodyPart["rightShoulder"] = 8] = "rightShoulder";
    BodyPart[BodyPart["rightUpperArm"] = 9] = "rightUpperArm";
    BodyPart[BodyPart["rightLowerArm"] = 10] = "rightLowerArm";
    BodyPart[BodyPart["rightHand"] = 11] = "rightHand";
    BodyPart[BodyPart["leftUpperLeg"] = 12] = "leftUpperLeg";
    BodyPart[BodyPart["leftLowerLeg"] = 13] = "leftLowerLeg";
    BodyPart[BodyPart["leftFoot"] = 14] = "leftFoot";
    BodyPart[BodyPart["rightUpperLeg"] = 15] = "rightUpperLeg";
    BodyPart[BodyPart["rightLowerLeg"] = 16] = "rightLowerLeg";
    BodyPart[BodyPart["rightFoot"] = 17] = "rightFoot";
})(BodyPart || (exports.BodyPart = BodyPart = {}));
/**
 * 美术规定皮肤文件默认缩放值
 */
exports.BODY_PART_DEFAULT_SCALE = 0.042;
/**
 * 美术规定皮肤文件默认旋转度数
 */
exports.BODY_PART_DEFAULT_ROTATIONS = {
    rightHand: [0, 0, 90],
    leftHand: [0, 0, 270],
};
/**
 * skin相关的schema生成器,返回的schema中key为部件名(BodyPart)
 * @param valueSchema
 * @returns
 */
function playerSkinSchemaGenerator(valueSchema) {
    return new schema_1.MuStruct({
        hips: valueSchema,
        torso: valueSchema,
        neck: valueSchema,
        head: valueSchema,
        leftShoulder: valueSchema,
        leftUpperArm: valueSchema,
        leftLowerArm: valueSchema,
        leftHand: valueSchema,
        rightShoulder: valueSchema,
        rightUpperArm: valueSchema,
        rightLowerArm: valueSchema,
        rightHand: valueSchema,
        leftUpperLeg: valueSchema,
        leftLowerLeg: valueSchema,
        leftFoot: valueSchema,
        rightUpperLeg: valueSchema,
        rightLowerLeg: valueSchema,
        rightFoot: valueSchema,
    });
}
exports.MeshBoundSchema = new schema_1.MuStruct({
    lo: math_schema_1.Vec3Schema,
    hi: math_schema_1.Vec3Schema,
});
exports.PlayerMeshBoundSchema = playerSkinSchemaGenerator(exports.MeshBoundSchema);
// "装备"(attachment)schema, 覆盖于skin之上的部分, PlayerDisplaySchema的属性
exports.PlayerAttachmentStateSchema = playerSkinSchemaGenerator(exports.PlayerAttachmentSetSchema);
// 皮肤schema, 值为hash
exports.PlayerSkinHashSchema = playerSkinSchemaGenerator(new schema_1.MuASCII());
// 皮肤schema, 值为皮肤名
exports.PlayerSkinNameSchema = playerSkinSchemaGenerator(new schema_1.MuASCII());
// 皮肤id schema, id为modelInfo.invSkinIndex中该部件的hash对应的id值
exports.PlayerSkinIdSchema = playerSkinSchemaGenerator(new schema_1.MuVarint(0));
// 控制皮肤各部分是否隐藏的schema，为true时该部件的皮肤mesh隐藏，不影响attachment的显示
exports.PlayerSkinInvisibleSchema = playerSkinSchemaGenerator(new schema_1.MuBoolean(false));
// Player input state bit fields
var PlayerFlyState;
(function (PlayerFlyState) {
    PlayerFlyState[PlayerFlyState["SHIFT"] = 0] = "SHIFT";
    PlayerFlyState[PlayerFlyState["BITS"] = 1] = "BITS";
    PlayerFlyState[PlayerFlyState["MASK"] = 1] = "MASK";
    PlayerFlyState[PlayerFlyState["NOT_FLYING"] = 0] = "NOT_FLYING";
    PlayerFlyState[PlayerFlyState["FLYING"] = 1] = "FLYING";
})(PlayerFlyState || (exports.PlayerFlyState = PlayerFlyState = {}));
var PlayerWalkState;
(function (PlayerWalkState) {
    PlayerWalkState[PlayerWalkState["SHIFT"] = 2] = "SHIFT";
    PlayerWalkState[PlayerWalkState["BITS"] = 2] = "BITS";
    PlayerWalkState[PlayerWalkState["MASK"] = 12] = "MASK";
    PlayerWalkState[PlayerWalkState["CROUCH"] = 0] = "CROUCH";
    PlayerWalkState[PlayerWalkState["WALK"] = 4] = "WALK";
    PlayerWalkState[PlayerWalkState["RUN"] = 8] = "RUN";
})(PlayerWalkState || (exports.PlayerWalkState = PlayerWalkState = {}));
var PlayerButtonState;
(function (PlayerButtonState) {
    PlayerButtonState[PlayerButtonState["NONE"] = 0] = "NONE";
    PlayerButtonState[PlayerButtonState["SHIFT"] = 4] = "SHIFT";
    PlayerButtonState[PlayerButtonState["BITS"] = 5] = "BITS";
    PlayerButtonState[PlayerButtonState["MASK"] = 496] = "MASK";
    PlayerButtonState[PlayerButtonState["WALK"] = 16] = "WALK";
    PlayerButtonState[PlayerButtonState["JUMP"] = 32] = "JUMP";
    PlayerButtonState[PlayerButtonState["CROUCH"] = 64] = "CROUCH";
    PlayerButtonState[PlayerButtonState["ACTION_0"] = 128] = "ACTION_0";
    PlayerButtonState[PlayerButtonState["ACTION_1"] = 256] = "ACTION_1";
})(PlayerButtonState || (exports.PlayerButtonState = PlayerButtonState = {}));
var PlayerJumpState;
(function (PlayerJumpState) {
    PlayerJumpState[PlayerJumpState["SHIFT"] = 9] = "SHIFT";
    PlayerJumpState[PlayerJumpState["BITS"] = 3] = "BITS";
    PlayerJumpState[PlayerJumpState["MASK"] = 3584] = "MASK";
    PlayerJumpState[PlayerJumpState["GROUND"] = 0] = "GROUND";
    PlayerJumpState[PlayerJumpState["SWIM"] = 512] = "SWIM";
    PlayerJumpState[PlayerJumpState["JUMP"] = 1024] = "JUMP";
    PlayerJumpState[PlayerJumpState["FALL"] = 1536] = "FALL";
    PlayerJumpState[PlayerJumpState["DOUBLE_JUMP"] = 2048] = "DOUBLE_JUMP";
})(PlayerJumpState || (exports.PlayerJumpState = PlayerJumpState = {}));
function playerStateBits(move, walk, jump, buttons) {
    return move | walk | jump | buttons;
}
function playerFlyState(bits) {
    return bits & PlayerFlyState.MASK;
}
function playerWalkState(bits) {
    return bits & PlayerWalkState.MASK;
}
function playerJumpState(bits) {
    return bits & PlayerJumpState.MASK;
}
function playerButtonState(bits) {
    return bits & PlayerButtonState.MASK;
}
exports.PlayerInputSchema = new schema_1.MuStruct({
    id: new schema_1.MuUint32(0),
    state: new schema_1.MuUint16(playerStateBits(PlayerFlyState.NOT_FLYING, PlayerWalkState.WALK, PlayerJumpState.FALL, 0)),
    angle: new schema_1.MuUint8(0), // input key/joystick angle.  rounded to increments of 255
    cameraAngle: new schema_1.MuUint8(0),
    pitch: new schema_1.MuUint8(0),
});
exports.PlayerInputSetSchema = new schema_1.MuSortedArray(exports.PlayerInputSchema, Infinity, id_1.compareId);
var PlayerDisplayFlags;
(function (PlayerDisplayFlags) {
    PlayerDisplayFlags[PlayerDisplayFlags["INVISIBLE"] = 1] = "INVISIBLE";
    PlayerDisplayFlags[PlayerDisplayFlags["HACKING"] = 2] = "HACKING";
    PlayerDisplayFlags[PlayerDisplayFlags["DEAD"] = 4] = "DEAD";
    PlayerDisplayFlags[PlayerDisplayFlags["SHOW_NAME"] = 8] = "SHOW_NAME";
    PlayerDisplayFlags[PlayerDisplayFlags["SHOW_INDICATOR"] = 16] = "SHOW_INDICATOR";
})(PlayerDisplayFlags || (exports.PlayerDisplayFlags = PlayerDisplayFlags = {}));
var InputDirectionState;
(function (InputDirectionState) {
    InputDirectionState[InputDirectionState["SWAP_DIRECTION"] = 1] = "SWAP_DIRECTION";
    InputDirectionState[InputDirectionState["REVERSE_VERTICAL"] = 2] = "REVERSE_VERTICAL";
    InputDirectionState[InputDirectionState["REVERSE_HORIZONTAL"] = 4] = "REVERSE_HORIZONTAL";
    InputDirectionState[InputDirectionState["DISABLE_VERTICAL"] = 8] = "DISABLE_VERTICAL";
    InputDirectionState[InputDirectionState["DISABLE_HORIZONTAL"] = 16] = "DISABLE_HORIZONTAL";
})(InputDirectionState || (exports.InputDirectionState = InputDirectionState = {}));
exports.PlayerDisplaySchema = new schema_1.MuStruct({
    id: new schema_1.MuVarint(),
    // display flags
    flags: (new schema_1.MuVarint(PlayerDisplayFlags.SHOW_NAME)),
    // skin and display info
    name: new schema_1.MuUTF8('player'),
    tag: new schema_1.MuVarint(0),
    avatarSkin: exports.PlayerSkinIdSchema,
    userId: permission_rda_1.UserIdSchema,
    avatar_hash: new schema_1.MuASCII(),
    skinInvisible: exports.PlayerSkinInvisibleSchema,
    mapSkin: exports.PlayerSkinIdSchema,
    // tint
    color: new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1)),
    metalness: new schema_1.MuQuantizedFloat(1 / 256, 0),
    emissive: new schema_1.MuQuantizedFloat(1 / 256, 0),
    shininess: new schema_1.MuQuantizedFloat(1 / 256, 0),
    // scale
    scale: new schema_1.MuQuantizedFloat(1 / 256, 1),
    // attachments
    attachments: exports.PlayerAttachmentStateSchema,
});
exports.PlayerDisplaySetSchema = new schema_1.MuSortedArray(exports.PlayerDisplaySchema, Infinity, id_1.compareId);
exports.PLAYER_CONFIG_PRECISION = 1 / 1024;
var PlayerFlags;
(function (PlayerFlags) {
    PlayerFlags[PlayerFlags["NONE"] = 0] = "NONE";
    /**
     * 可穿墙的幽灵👻
     */
    PlayerFlags[PlayerFlags["SPECTATOR"] = 1] = "SPECTATOR";
    PlayerFlags[PlayerFlags["ALLOW_FLIGHT"] = 2] = "ALLOW_FLIGHT";
    PlayerFlags[PlayerFlags["ALLOW_MOVE"] = 4] = "ALLOW_MOVE";
    PlayerFlags[PlayerFlags["ALLOW_ACTION_0"] = 8] = "ALLOW_ACTION_0";
    PlayerFlags[PlayerFlags["ALLOW_ACTION_1"] = 16] = "ALLOW_ACTION_1";
    PlayerFlags[PlayerFlags["ALLOW_JUMP"] = 32] = "ALLOW_JUMP";
    PlayerFlags[PlayerFlags["ALLOW_DOUBLE_JUMP"] = 64] = "ALLOW_DOUBLE_JUMP";
    PlayerFlags[PlayerFlags["ALLOW_CROUCH"] = 128] = "ALLOW_CROUCH";
})(PlayerFlags || (exports.PlayerFlags = PlayerFlags = {}));
// step flags
var PlayerOccupancyFlags;
(function (PlayerOccupancyFlags) {
    PlayerOccupancyFlags[PlayerOccupancyFlags["EDGE_BIT"] = 1] = "EDGE_BIT";
    PlayerOccupancyFlags[PlayerOccupancyFlags["X_NEG_SHIFT"] = 0] = "X_NEG_SHIFT";
    PlayerOccupancyFlags[PlayerOccupancyFlags["X_POS_SHIFT"] = 1] = "X_POS_SHIFT";
    PlayerOccupancyFlags[PlayerOccupancyFlags["Z_NEG_SHIFT"] = 2] = "Z_NEG_SHIFT";
    PlayerOccupancyFlags[PlayerOccupancyFlags["Z_POS_SHIFT"] = 3] = "Z_POS_SHIFT";
    PlayerOccupancyFlags[PlayerOccupancyFlags["EDGE_X_NEG"] = 1] = "EDGE_X_NEG";
    PlayerOccupancyFlags[PlayerOccupancyFlags["EDGE_X_POS"] = 2] = "EDGE_X_POS";
    PlayerOccupancyFlags[PlayerOccupancyFlags["EDGE_Z_NEG"] = 4] = "EDGE_Z_NEG";
    PlayerOccupancyFlags[PlayerOccupancyFlags["EDGE_Z_POS"] = 8] = "EDGE_Z_POS";
})(PlayerOccupancyFlags || (exports.PlayerOccupancyFlags = PlayerOccupancyFlags = {}));
exports.PlayerSchema = new schema_1.MuStruct({
    // entity id
    id: new schema_1.MuVarint(),
    // contact info from physics engine
    physGround: new schema_1.MuBoolean(false),
    physFluid: new schema_1.MuQuantizedFloat(1 / 32, 0),
    // platform frame of reference info
    platformX: new schema_1.MuQuantizedFloat(1 / 256, 0),
    platformY: new schema_1.MuQuantizedFloat(1 / 256, 0),
    platformZ: new schema_1.MuQuantizedFloat(1 / 256, 0),
    // adjacent occupancy flags (for climbing)
    occupancy: new schema_1.MuUint8(0),
    // movement state flags
    flags: (new schema_1.MuVarint(PlayerFlags.ALLOW_FLIGHT |
        PlayerFlags.ALLOW_ACTION_0 |
        PlayerFlags.ALLOW_ACTION_1 |
        PlayerFlags.ALLOW_JUMP |
        PlayerFlags.ALLOW_DOUBLE_JUMP |
        PlayerFlags.ALLOW_CROUCH |
        PlayerFlags.ALLOW_MOVE)),
    // server authoritative movement parameters
    walkSpeed: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.22),
    walkAcceleration: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.19),
    runSpeed: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.4),
    runAcceleration: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.35),
    crouchSpeed: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.1),
    crouchAcceleration: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.09),
    swimSpeed: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.4),
    swimAcceleration: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.1),
    flySpeed: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 2),
    flyAcceleration: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 2),
    jumpSpeedFactor: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.85),
    jumpAccelerationFactor: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.55),
    jumpPower: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.96),
    doubleJumpPower: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 0.9),
    freezedForwardAngle: new schema_1.MuUint16(0),
    inputDirectionState: new schema_1.MuUint8(0),
    // step height
    stepHeight: new schema_1.MuQuantizedFloat(exports.PLAYER_CONFIG_PRECISION, 1.25),
});
exports.PlayerSetSchema = new schema_1.MuSortedArray(exports.PlayerSchema, Infinity, id_1.compareId);
exports.PlayerIndexSchema = new schema_1.MuDictionary(new schema_1.MuVarint(), Infinity);
//# sourceMappingURL=player-schema.js.map