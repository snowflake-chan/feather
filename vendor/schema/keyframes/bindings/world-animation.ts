import { GameAssetType, GameWorldKeyframe } from '../../api/js/api';
import { MuFloat32 } from '@box/mudb/schema';
import { EnvironmentSkyType } from '../../project/project-rda';
import { EnvironmentParamSchema } from '../../environment/environment-schema';
import { PhysicsParamsSchema } from '../../physics/physics-schema';
import { AnimationBindingFactory } from '../keyframe-binding';

const WORLD = new AnimationBindingFactory<GameWorldKeyframe>('world');

const PHYS = WORLD.component<typeof PhysicsParamsSchema.identity, 'physics'>(
  'physics',
  PhysicsParamsSchema.identity,
);
const ENV = WORLD.component<
  typeof EnvironmentParamSchema.identity,
  'environment'
>('environment', EnvironmentParamSchema.identity);

export const WORLD_ANIM_BINDING = WORLD.create({
  singleton: true,
  keyframe: {
    components: WORLD.keyframe(
      ENV.bind(
        ...ENV.nestEngine('fog', (fog) => [
          fog.num('fogUniformDensity', 'fogDensity'),
          fog.num('fogStartDistance', 'fogStartDistance'),
          fog.num('fogHeightFalloff', 'fogHeightFalloff'),
          fog.num('fogHeightOffset', 'fogHeightOffset'),
          fog.num('maxFog', 'maxFog'),
          ...fog.nestEngine('fogColor', (fogColor) => [
            fogColor.propRGB('fogColor', ['r', 'g', 'b']),
          ]),
        ]),
        ...ENV.nestEngine('sky', (sky) => [
          sky.enum('lightMode', 'skyType', {
            natural: EnvironmentSkyType.NATURAL,
            manual: EnvironmentSkyType.COLORS,
          }),
          sky.num('lunarPhase', 'lunarPhase'),
          sky.num(
            'sunFrequency',
            'sunFrequency',
            1 / 1024,
            0,
            Infinity,
            new MuFloat32(1),
          ),
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
        ]),
        ...ENV.nestEngine('rain', (rain) => [
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
        ]),
        ...ENV.nestEngine('snow', (snow) => [
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
          snow.asset('snowTexture', 'texture', GameAssetType.PARTICLE_TEXTURE),
        ]),
      ),
      PHYS.bind(
        PHYS.num('gravity', 'gravity'),
        PHYS.num('airFriction', 'velocityDamping'),
      ),
    ),
    props: {},
  },
  props: {},
});

export const WorldAnimationSchema = WORLD_ANIM_BINDING.schema;
export type WorldAnimation = typeof WorldAnimationSchema.identity;
export const WorldAnimationSetSchema = WORLD_ANIM_BINDING.setSchema;
export const WorldAnimationIndexSchema = WORLD_ANIM_BINDING.indexSchema;
export type WorldAnimationIndex = typeof WorldAnimationIndexSchema.identity;
