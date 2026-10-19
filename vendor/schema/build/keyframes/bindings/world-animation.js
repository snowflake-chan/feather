"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldAnimationIndexSchema = exports.WorldAnimationSetSchema = exports.WorldAnimationSchema = exports.WORLD_ANIM_BINDING = void 0;
const api_1 = require("../../api/js/api");
const float32_1 = require("@box/mudb/schema/float32");
const project_rda_1 = require("../../project/project-rda");
const environment_schema_1 = require("../../environment/environment-schema");
const physics_schema_1 = require("../../physics/physics-schema");
const keyframe_binding_1 = require("../keyframe-binding");
const WORLD = new keyframe_binding_1.AnimationBindingFactory('world');
const PHYS = WORLD.component('physics', physics_schema_1.PhysicsParamsSchema.identity);
const ENV = WORLD.component('environment', environment_schema_1.EnvironmentParamSchema.identity);
exports.WORLD_ANIM_BINDING = WORLD.create({
    singleton: true,
    keyframe: {
        components: WORLD.keyframe(ENV.bind(...ENV.nestEngine('fog', (fog) => [
            fog.num('fogUniformDensity', 'fogDensity'),
            fog.num('fogStartDistance', 'fogStartDistance'),
            fog.num('fogHeightFalloff', 'fogHeightFalloff'),
            fog.num('fogHeightOffset', 'fogHeightOffset'),
            fog.num('maxFog', 'maxFog'),
            ...fog.nestEngine('fogColor', (fogColor) => [
                fogColor.propRGB('fogColor', ['r', 'g', 'b']),
            ]),
        ]), ...ENV.nestEngine('sky', (sky) => [
            sky.enum('lightMode', 'skyType', {
                natural: project_rda_1.EnvironmentSkyType.NATURAL,
                manual: project_rda_1.EnvironmentSkyType.COLORS,
            }),
            sky.num('lunarPhase', 'lunarPhase'),
            sky.num('sunFrequency', 'sunFrequency', 1 / 1024, 0, Infinity, new float32_1.MuFloat32(1)),
            sky.num('sunPhase', 'sunPhase', 1 / 1024),
            ...sky.nestEngine('sunColor', (sunColor) => [
                sunColor.propLight('sunLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('sunDirection', (sunDir) => [
                sunDir.propVec3('sunDirection', ['x', 'y', 'z']),
            ]),
            ...sky.nestEngine('skyBack', (skyBack) => [
                skyBack.propLight('skyBackLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('skyFront', (skyFront) => [
                skyFront.propLight('skyFrontLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('skyLeft', (skyLeft) => [
                skyLeft.propLight('skyLeftLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('skyRight', (skyRight) => [
                skyRight.propLight('skyRightLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('skyTop', (skyTop) => [
                skyTop.propLight('skyTopLight', ['r', 'g', 'b']),
            ]),
            ...sky.nestEngine('skyBottom', (skyBottom) => [
                skyBottom.propLight('skyBottomLight', ['r', 'g', 'b']),
            ]),
        ]), ...ENV.nestEngine('rain', (rain) => [
            rain.num('rainDensity', 'density', 1 / 256, 0, Infinity),
            rain.num('rainInterference', 'interference'),
            rain.num('rainSpeed', 'speed'),
            ...rain.nestEngine('color', (rainColor) => [
                rainColor.propRGBA('rainColor', ['r', 'g', 'b', 'a']),
            ]),
            ...rain.nestEngine('size', (rainSize) => [
                rainSize.num('rainSizeLo', 'w'),
                rainSize.num('rainSizeHi', 'h'),
            ]),
            ...rain.nestEngine('direction', (dir) => [
                dir.propVec3('rainDirection', ['x', 'y', 'z']),
            ]),
        ]), ...ENV.nestEngine('snow', (snow) => [
            snow.num('snowDensity', 'density', 1 / 16, 0),
            snow.num('snowFallSpeed', 'fallSpeed'),
            snow.num('snowSpinSpeed', 'spinSpeed'),
            ...snow.nestEngine('size', (snowSize) => [
                snowSize.num('snowSizeLo', 'w'),
                snowSize.num('snowSizeHi', 'h'),
            ]),
            ...snow.nestEngine('color', (snowColor) => [
                snowColor.propRGBA('snowColor', ['r', 'g', 'b', 'a']),
            ]),
            snow.asset('snowTexture', 'texture', api_1.GameAssetType.PARTICLE_TEXTURE),
        ])), PHYS.bind(PHYS.num('gravity', 'gravity'), PHYS.num('airFriction', 'velocityDamping'))),
        props: {},
    },
    props: {},
});
exports.WorldAnimationSchema = exports.WORLD_ANIM_BINDING.schema;
exports.WorldAnimationSetSchema = exports.WORLD_ANIM_BINDING.setSchema;
exports.WorldAnimationIndexSchema = exports.WORLD_ANIM_BINDING.indexSchema;
