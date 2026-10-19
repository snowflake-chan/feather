"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRDA = exports.ProjectFeatureRDA = exports.ProjectMetaRDA = exports.GamepadRDA = exports.GamepadButtonsTextureRDA = exports.GamepadFlyTextureRDA = exports.JoystickTextureRDA = exports.ZoneSetRDA = exports.ZoneRDA = exports.PhysicsRDA = exports.CollisionFilterRDA = exports.CollisionRuleRDA = exports.EntitiesTreeRDA = exports.EntitySeedRDA = exports.PlayerRDA = exports.MovementBoundsRDA = exports.InitialPositionRDA = exports.PlayerSoundEnum = exports.PlayerSoundRDA = exports.EntitySoundEnum = exports.EntitySoundRDA = exports.AmbientSoundEnum = exports.AmbientSoundRDA = exports.ParticleConfigRDA = exports.DamageConfigRDA = exports.EnvironmentRDA = exports.BakedShadowRDA = exports.RainRDA = exports.SnowRDA = exports.FogRDA = exports.SkyRDA = exports.EnvironmentSkyType = exports.AudioSampleEnum = exports.AudioSampleRDA = exports.DimsSchema = exports.XYZSchema = exports.RGBASchema = exports.RGBSchema = exports.XYSchema = exports.VoxelRDA = exports.VoxelShape = exports.DeleteAssetsRDA = exports.AssetsRDA = exports.AssetEntryRDA = void 0;
exports.sizeLimitedStringRDA = sizeLimitedStringRDA;
const rda_1 = require("@box/mudb/rda");
const schema_1 = require("@box/mudb/schema");
const index_1 = require("../content-server/index");
const gl_matrix_1 = require("gl-matrix");
const quantized_schema_1 = require("../utils/quantized-schema");
const math_schema_1 = require("../utils/math-schema");
const database_type_1 = require("../backend/database-type");
const murda_tree_1 = require("./murda-tree");
const defs_1 = require("./ui-rda/defs");
const rda_2 = require("../group-project/rda");
__exportStar(require("../group-project/rda"), exports);
function sizeLimitedStringRDA(defaultValue, len) {
    return new rda_1.MuRDARegister(new schema_1.MuUTF8(defaultValue), (x) => {
        if (x.length < len) {
            return x;
        }
        return x.substr(0, len);
    });
}
exports.AssetEntryRDA = new rda_1.MuRDAStruct(Object.assign({ ownerId: new rda_1.MuRDAConstant(new schema_1.MuVarint(0)), 
    /**
     * 上传音频时，会将 contentId 设置为上传时间戳
     * 因此 contentId 也可以作为 createTime 使用
     */
    contentId: new rda_1.MuRDAConstant(new schema_1.MuFloat64(0)), bounds: new rda_1.MuRDARegister(math_schema_1.Vec3Schema), animated: new rda_1.MuRDAConstant(new schema_1.MuBoolean(false)) }, rda_2.CommonAssets));
exports.AssetsRDA = new rda_1.MuRDAMap(new schema_1.MuUTF8(), exports.AssetEntryRDA);
exports.DeleteAssetsRDA = new rda_1.MuRDAList(new rda_1.MuRDAStruct({
    key: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    value: exports.AssetEntryRDA,
}));
exports.VoxelShape = new schema_1.MuStruct({
    x: new schema_1.MuUint16(128),
    y: new schema_1.MuUint16(128),
    z: new schema_1.MuUint16(128),
});
exports.VoxelRDA = new rda_1.MuRDARegister(new schema_1.MuStruct({
    shape: exports.VoxelShape,
    chunks: new schema_1.MuArray(index_1.HashSchema, Infinity),
}));
exports.XYSchema = new rda_1.MuRDAStruct({
    x: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    y: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
});
exports.RGBSchema = new schema_1.MuStruct({
    r: new schema_1.MuFloat64(0),
    g: new schema_1.MuFloat64(0),
    b: new schema_1.MuFloat64(0),
});
exports.RGBASchema = new schema_1.MuStruct({
    r: new schema_1.MuFloat64(0),
    g: new schema_1.MuFloat64(0),
    b: new schema_1.MuFloat64(0),
    a: new schema_1.MuFloat64(1),
});
exports.XYZSchema = new schema_1.MuStruct({
    x: new schema_1.MuFloat64(0),
    y: new schema_1.MuFloat64(0),
    z: new schema_1.MuFloat64(0),
});
exports.DimsSchema = new schema_1.MuStruct({
    w: new schema_1.MuFloat64(0),
    h: new schema_1.MuFloat64(0),
});
exports.AudioSampleRDA = new rda_1.MuRDAStruct({
    sample: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    radius: new rda_1.MuRDARegister(new schema_1.MuFloat32(32)),
    pitch: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    pitchRange: new rda_1.MuRDARegister(new schema_1.MuFloat32(0)),
    gain: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    gainRange: new rda_1.MuRDARegister(new schema_1.MuFloat32(0)),
});
var AudioSampleEnum;
(function (AudioSampleEnum) {
    AudioSampleEnum["Sample"] = "track";
    AudioSampleEnum["Radius"] = "radius";
    AudioSampleEnum["Pitch"] = "pitch";
    AudioSampleEnum["PitchRange"] = "pitchRange";
    AudioSampleEnum["Gain"] = "gain";
    AudioSampleEnum["GainRange"] = "gainRange";
})(AudioSampleEnum || (exports.AudioSampleEnum = AudioSampleEnum = {}));
var EnvironmentSkyType;
(function (EnvironmentSkyType) {
    EnvironmentSkyType[EnvironmentSkyType["NATURAL"] = 0] = "NATURAL";
    EnvironmentSkyType[EnvironmentSkyType["COLORS"] = 1] = "COLORS";
})(EnvironmentSkyType || (exports.EnvironmentSkyType = EnvironmentSkyType = {}));
exports.SkyRDA = new rda_1.MuRDAStruct({
    skyType: new rda_1.MuRDARegister(new schema_1.MuVarint(EnvironmentSkyType.NATURAL)),
    /**
     * 0-0.6, determines shaded color, camera exposure and voxel light map.
     * Voxel light map will turn off inner AO when set globalLight 0
     */
    globalLight: new rda_1.MuRDARegister(new schema_1.MuFloat64(0.3)),
    // natural sky parameters (only used if skyType = NATURAL)
    sunPhase: new rda_1.MuRDARegister(new schema_1.MuFloat64(4 / 24)),
    sunFrequency: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    /**
     * @deprecated
     * temporarily useless, may be useful in the future.
     */
    lunarPhase: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    // light parameters (only used if skyType = COLORS)
    sunDirection: new rda_1.MuRDARegister(exports.XYZSchema),
    sunColor: new rda_1.MuRDARegister(exports.RGBSchema),
    skyLeft: new rda_1.MuRDARegister(exports.RGBSchema),
    skyRight: new rda_1.MuRDARegister(exports.RGBSchema),
    skyTop: new rda_1.MuRDARegister(exports.RGBSchema),
    skyBottom: new rda_1.MuRDARegister(exports.RGBSchema),
    skyFront: new rda_1.MuRDARegister(exports.RGBSchema),
    skyBack: new rda_1.MuRDARegister(exports.RGBSchema),
    // gamma
    gamma: new rda_1.MuRDARegister(new schema_1.MuFloat32(1.3)),
});
// fog parameters (density, height offset, height fall off, max opacity)
exports.FogRDA = new rda_1.MuRDAStruct({
    fogColor: new rda_1.MuRDAStruct({
        r: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
        g: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
        b: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    }),
    fogStartDistance: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)), // start distance in voxel units
    fogHeightOffset: new rda_1.MuRDARegister(new schema_1.MuFloat64(-8)), // start voxel of fog height
    fogHeightFalloff: new rda_1.MuRDARegister(new schema_1.MuFloat64(0.8)), // 0-1 determines fall off rate of height fog, small numbers = more fog
    fogDensity: new rda_1.MuRDARegister(new schema_1.MuFloat64(0.0)), // 0-1, uniform fog field density, big numbers = more fog
    maxFog: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)), // 0-1, maximum fog density.  big numbers = mode fog
});
exports.SnowRDA = new rda_1.MuRDAStruct({
    texture: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    density: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    size: new rda_1.MuRDARegister(exports.DimsSchema),
    fallSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    spinSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    color: new rda_1.MuRDARegister(new schema_1.MuStruct({
        r: new schema_1.MuFloat64(1),
        g: new schema_1.MuFloat64(1),
        b: new schema_1.MuFloat64(1),
        a: new schema_1.MuFloat64(1),
    })),
});
exports.RainRDA = new rda_1.MuRDAStruct({
    density: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    direction: new rda_1.MuRDARegister(new schema_1.MuStruct({
        x: new schema_1.MuFloat64(0),
        y: new schema_1.MuFloat64(1),
        z: new schema_1.MuFloat64(0),
    })),
    speed: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    size: new rda_1.MuRDARegister(new schema_1.MuStruct({
        w: new schema_1.MuFloat64(0.5),
        h: new schema_1.MuFloat64(0.5),
    })),
    interference: new rda_1.MuRDARegister(new schema_1.MuFloat64(0.04)),
    color: new rda_1.MuRDARegister(new schema_1.MuStruct({
        r: new schema_1.MuFloat64(1),
        g: new schema_1.MuFloat64(1),
        b: new schema_1.MuFloat64(1),
        a: new schema_1.MuFloat64(1),
    })),
});
exports.BakedShadowRDA = new rda_1.MuRDARegister(new schema_1.MuStruct({
    texture: index_1.HashSchema,
    data: index_1.HashSchema,
    chunkShift: new schema_1.MuVarint(6),
}));
exports.EnvironmentRDA = new rda_1.MuRDAStruct({
    fog: exports.FogRDA,
    sky: exports.SkyRDA,
    snow: exports.SnowRDA,
    rain: exports.RainRDA,
    drawDistance: new rda_1.MuRDARegister(new schema_1.MuFloat32(512)),
    bakedShadow: exports.BakedShadowRDA,
});
exports.DamageConfigRDA = new rda_1.MuRDAStruct({
    // hp and damage configuration
    enabled: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    // health display
    showHealth: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    showDamage: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    // health levels
    hp: new rda_1.MuRDARegister(new schema_1.MuVarint(100)),
    maxHp: new rda_1.MuRDARegister(new schema_1.MuVarint(100)),
});
exports.ParticleConfigRDA = new rda_1.MuRDAStruct({
    // emit parameters
    rate: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    rateSpread: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    limit: new rda_1.MuRDARegister(new schema_1.MuVarint(0)),
    lifetime: new rda_1.MuRDARegister(new schema_1.MuFloat64(10)),
    lifetimeSpread: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    // color
    color0: new rda_1.MuRDARegister(exports.RGBSchema),
    color1: new rda_1.MuRDARegister(exports.RGBSchema),
    color2: new rda_1.MuRDARegister(exports.RGBSchema),
    color3: new rda_1.MuRDARegister(exports.RGBSchema),
    color4: new rda_1.MuRDARegister(exports.RGBSchema),
    // size
    size0: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    size1: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    size2: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    size3: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    size4: new rda_1.MuRDARegister(new schema_1.MuFloat32(1)),
    sizeSpread: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    // dynamics
    velocity: new rda_1.MuRDARegister(exports.XYZSchema),
    velocitySpread: new rda_1.MuRDARegister(exports.XYZSchema),
    acceleration: new rda_1.MuRDARegister(exports.XYZSchema),
    damping: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    noiseAmpl: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    noiseFreq: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
});
exports.AmbientSoundRDA = new rda_1.MuRDAStruct({
    ambient: exports.AudioSampleRDA,
    // other sound effects
    breakVoxel: exports.AudioSampleRDA,
    placeVoxel: exports.AudioSampleRDA,
    playerJoin: exports.AudioSampleRDA,
    playerLeave: exports.AudioSampleRDA,
});
var AmbientSoundEnum;
(function (AmbientSoundEnum) {
    AmbientSoundEnum["ambient"] = "ambient";
    AmbientSoundEnum["breakVoxel"] = "breakVoxel";
    AmbientSoundEnum["placeVoxel"] = "placeVoxel";
    AmbientSoundEnum["playerJoin"] = "playerJoin";
    AmbientSoundEnum["playerLeave"] = "playerLeave";
})(AmbientSoundEnum || (exports.AmbientSoundEnum = AmbientSoundEnum = {}));
exports.EntitySoundRDA = new rda_1.MuRDAStruct({
    chat: exports.AudioSampleRDA,
    hurt: exports.AudioSampleRDA,
    die: exports.AudioSampleRDA,
    interact: exports.AudioSampleRDA,
});
var EntitySoundEnum;
(function (EntitySoundEnum) {
    EntitySoundEnum["chat"] = "chat";
    EntitySoundEnum["hurt"] = "hurt";
    EntitySoundEnum["die"] = "die";
    EntitySoundEnum["interact"] = "interact";
})(EntitySoundEnum || (exports.EntitySoundEnum = EntitySoundEnum = {}));
exports.PlayerSoundRDA = new rda_1.MuRDAStruct({
    spawn: exports.AudioSampleRDA,
    jump: exports.AudioSampleRDA,
    doubleJump: exports.AudioSampleRDA,
    land: exports.AudioSampleRDA,
    crouch: exports.AudioSampleRDA,
    step: exports.AudioSampleRDA,
    action0: exports.AudioSampleRDA,
    action1: exports.AudioSampleRDA,
    swim: exports.AudioSampleRDA,
    enterWater: exports.AudioSampleRDA,
    leaveWater: exports.AudioSampleRDA,
    startFly: exports.AudioSampleRDA,
    endFly: exports.AudioSampleRDA,
    music: exports.AudioSampleRDA,
});
var PlayerSoundEnum;
(function (PlayerSoundEnum) {
    PlayerSoundEnum["spawn"] = "spawn";
    PlayerSoundEnum["jump"] = "jump";
    PlayerSoundEnum["doubleJump"] = "doubleJump";
    PlayerSoundEnum["land"] = "land";
    PlayerSoundEnum["crouch"] = "crouch";
    PlayerSoundEnum["step"] = "step";
    PlayerSoundEnum["action0"] = "action0";
    PlayerSoundEnum["action1"] = "action1";
    PlayerSoundEnum["swim"] = "swim";
    PlayerSoundEnum["enterWater"] = "enterWater";
    PlayerSoundEnum["leaveWater"] = "leaveWater";
    PlayerSoundEnum["startFly"] = "startFly";
    PlayerSoundEnum["endFly"] = "endFly";
    PlayerSoundEnum["music"] = "music";
})(PlayerSoundEnum || (exports.PlayerSoundEnum = PlayerSoundEnum = {}));
exports.InitialPositionRDA = new schema_1.MuStruct({
    x: new schema_1.MuFloat64(64),
    y: new schema_1.MuFloat64(140),
    z: new schema_1.MuFloat64(64),
});
exports.MovementBoundsRDA = new rda_1.MuRDAStruct({
    lo: new rda_1.MuRDAStruct({
        x: new rda_1.MuRDARegister(new schema_1.MuFloat64(-50)),
        y: new rda_1.MuRDARegister(new schema_1.MuFloat64(-50)),
        z: new rda_1.MuRDARegister(new schema_1.MuFloat64(-50)),
    }),
    hi: new rda_1.MuRDAStruct({
        x: new rda_1.MuRDARegister(new schema_1.MuFloat64(178)),
        y: new rda_1.MuRDARegister(new schema_1.MuFloat64(178)),
        z: new rda_1.MuRDARegister(new schema_1.MuFloat64(178)),
    }),
});
// All player configuration stuff goes in here
exports.PlayerRDA = new rda_1.MuRDAStruct({
    // Camera info
    cameraType: new rda_1.MuRDARegister(new schema_1.MuASCII('follow')),
    scale: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    // Color LUT
    colorLUT: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    // spawn pount info
    initialPosition: new rda_1.MuRDARegister(exports.InitialPositionRDA),
    initialYaw: new rda_1.MuRDARegister(new schema_1.MuFloat32(0)),
    movementBounds: exports.MovementBoundsRDA,
    // movement parameters
    allowFlight: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    allowMove: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    allowAction0: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    allowAction1: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    allowJump: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    allowDoubleJump: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    allowCrouch: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    noClip: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    walkSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.22)),
    walkAcceleration: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.19)),
    runSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.4)),
    runAcceleration: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.35)),
    crouchSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.1)),
    crouchAcceleration: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.09)),
    swimSpeed: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.4)),
    swimAcceleration: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.1)),
    flySpeed: new rda_1.MuRDARegister(new schema_1.MuFloat32(2)),
    flyAcceleration: new rda_1.MuRDARegister(new schema_1.MuFloat32(2)),
    jumpSpeedFactor: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.85)),
    jumpAccelerationFactor: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.55)),
    jumpPower: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.96)),
    doubleJumpPower: new rda_1.MuRDARegister(new schema_1.MuFloat32(0.9)),
    // body parameters
    mass: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    friction: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    restitution: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    // player material properties
    color: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1 / 256, gl_matrix_1.vec3.fromValues(1, 1, 1))),
    emissive: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(1 / 256)),
    shininess: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(1 / 256)),
    metalness: new rda_1.MuRDARegister(new schema_1.MuQuantizedFloat(1 / 256)),
    // display stuff
    invisible: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    showName: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    showIndicator: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    // player damage
    damage: exports.DamageConfigRDA,
    // entity sounds
    sounds: exports.EntitySoundRDA,
    playerSounds: exports.PlayerSoundRDA,
});
exports.EntitySeedRDA = new rda_1.MuRDAStruct({
    // tags
    name: sizeLimitedStringRDA('', 32),
    tags: new rda_1.MuRDAList(sizeLimitedStringRDA('', 32)),
    // edit lock state, default value = false
    editLock: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    // whether the entity is in the scene when baking shadows, default value = true
    staticShadow: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
    // rigid body properties
    position: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1 / 256)),
    collision: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    gravity: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    fixed: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    mass: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    friction: new rda_1.MuRDARegister(new schema_1.MuFloat64(1)),
    restitution: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    bounds: new rda_1.MuRDARegister(math_schema_1.Vec3Schema),
    // model properties
    meshId: new rda_1.MuRDAConstant(new schema_1.MuFloat64()),
    mesh: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    scale: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec3Schema(1 / 256)),
    orientation: new rda_1.MuRDARegister(new quantized_schema_1.QuantizedVec4Schema(1 / 256)),
    tint: new rda_1.MuRDARegister(math_schema_1.Vec4Schema),
    metalness: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    shininess: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    emissive: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    defaultMotionId: new rda_1.MuRDARegister(new schema_1.MuASCII()),
    // particles
    particle: exports.ParticleConfigRDA,
    // damage
    damage: exports.DamageConfigRDA,
    // sound
    sound: exports.EntitySoundRDA,
});
exports.EntitiesTreeRDA = new murda_tree_1.MuRDATree(exports.EntitySeedRDA);
exports.CollisionRuleRDA = new rda_1.MuRDAStruct({
    selectorA: new rda_1.MuRDARegister(new schema_1.MuUTF8('*')),
    selectorB: new rda_1.MuRDARegister(new schema_1.MuUTF8('*')),
});
exports.CollisionFilterRDA = new rda_1.MuRDAList(exports.CollisionRuleRDA);
exports.PhysicsRDA = new rda_1.MuRDAStruct({
    gravity: new rda_1.MuRDARegister(new schema_1.MuFloat64(-0.1)),
    velocityDamping: new rda_1.MuRDARegister(new schema_1.MuFloat64(0.01)),
    useOBB: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
});
exports.ZoneRDA = new rda_1.MuRDAStruct({
    bounds: new rda_1.MuRDAStruct({
        lox: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        loy: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        loz: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        hix: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        hiy: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        hiz: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    }),
    // zone selector
    selector: new rda_1.MuRDARegister(new schema_1.MuUTF8('*')),
    // force field
    massScale: new rda_1.MuRDARegister(new schema_1.MuFloat64(0), (x) => Math.min(Math.max(0, +x || 0), 1)),
    force: new rda_1.MuRDAStruct({
        x: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        y: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
        z: new rda_1.MuRDARegister(new schema_1.MuFloat64(0)),
    }),
    // weather zone overrides
    overrideFog: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    fog: exports.FogRDA,
    overrideSky: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    sky: exports.SkyRDA,
    overrideSnow: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    snow: exports.SnowRDA,
    overrideRain: new rda_1.MuRDARegister(new schema_1.MuBoolean(false)),
    rain: exports.RainRDA,
});
exports.ZoneSetRDA = new rda_1.MuRDAList(exports.ZoneRDA);
exports.JoystickTextureRDA = new rda_1.MuRDAStruct({
    background: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    controller: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
});
exports.GamepadFlyTextureRDA = new rda_1.MuRDAStruct({
    button: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    flyingController: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    flyingBackground: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
});
exports.GamepadButtonsTextureRDA = new rda_1.MuRDAStruct({
    jump: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    crouch: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    actionA: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
    actionB: new rda_1.MuRDARegister(new schema_1.MuUTF8()),
});
exports.GamepadRDA = new rda_1.MuRDAStruct({
    joystick: exports.JoystickTextureRDA,
    fly: exports.GamepadFlyTextureRDA,
    buttons: exports.GamepadButtonsTextureRDA,
});
exports.ProjectMetaRDA = new rda_1.MuRDAStruct({
    // Project display and preview imageinfo
    displayName: sizeLimitedStringRDA('Blank Map', database_type_1.DB.Limitations.contentNameBytes),
    description: sizeLimitedStringRDA('', database_type_1.DB.Limitations.contentDescriptionBytes),
    previewImage: new rda_1.MuRDARegister(new schema_1.MuASCII('')),
    bannerImages: new rda_1.MuRDAList(new rda_1.MuRDARegister(new schema_1.MuASCII(''))),
    notice: sizeLimitedStringRDA('', database_type_1.DB.Limitations.contentUpdateNoticeBytes),
    // is user never change displayName
    isNeverChangeDisplayName: new rda_1.MuRDARegister(new schema_1.MuBoolean(true)),
});
// feature flags
exports.ProjectFeatureRDA = new rda_1.MuRDAStruct({
    enableTriggerAPI: new rda_1.MuRDAConstant(new schema_1.MuBoolean(false)),
});
exports.ProjectRDA = new rda_1.MuRDAStruct(Object.assign({ 
    // Project meta data
    type: new rda_1.MuRDAConstant(new schema_1.MuUTF8('project')), version: new rda_1.MuRDAConstant(new schema_1.MuUTF8('0.3.31')), prevHash: new rda_1.MuRDARegister(index_1.HashSchema), timestamp: new rda_1.MuRDARegister(new schema_1.MuDate(new Date(0))), storageMode: new rda_1.MuRDARegister(new schema_1.MuUTF8('sqlite')), 
    // feature flags
    features: exports.ProjectFeatureRDA, 
    // project meta data, image, name, etc.
    info: exports.ProjectMetaRDA, 
    // Game engine data structures and configuration
    voxels: exports.VoxelRDA, environment: exports.EnvironmentRDA, ambientSound: exports.AmbientSoundRDA, physics: exports.PhysicsRDA, collisionFilter: exports.CollisionFilterRDA, player: exports.PlayerRDA, entitiesTree: exports.EntitiesTreeRDA, scriptIndex: new rda_1.MuRDARegister(new schema_1.MuUTF8('index.js')), zones: exports.ZoneSetRDA, gamepad: exports.GamepadRDA, 
    // Asset system
    assets: exports.AssetsRDA, deleteAssets: exports.DeleteAssetsRDA, 
    // committer ID
    committerId: new rda_1.MuRDARegister(new schema_1.MuVarint(0)), 
    // GameUI
    defaultScreenId: new rda_1.MuRDARegister(new schema_1.MuUTF8(defs_1.DEFAULT_SCREEN_ID)) }, rda_2.GroupProjectRDA));
//# sourceMappingURL=project-rda.js.map