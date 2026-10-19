import { BindingFactory } from './binding-factory';
import { GameWorld, GameAssetType } from '@box/schema/api/js/api';
import {
  PhysicsRDA,
  SkyRDA,
  SnowRDA,
  RainRDA,
  AmbientSoundRDA,
  FogRDA,
} from '@box/schema/project/project-rda';
import { ScriptSynchronizer } from './synchronizer';

const bindPhys = new BindingFactory<
  GameWorld,
  typeof PhysicsRDA['stateSchema']['identity']
>();
export const WorldPhysicsBinding = new ScriptSynchronizer<
  GameWorld,
  typeof PhysicsRDA['stateSchema']
>(
  'physics',
  PhysicsRDA.stateSchema,
  [
    bindPhys.num('gravity', 'gravity'),
    bindPhys.num('airFriction', 'velocityDamping', 0, 256),
    bindPhys.bool('useOBB', 'useOBB'),
  ],
  null,
  null,
);

const bindSky = new BindingFactory<
  GameWorld,
  typeof SkyRDA.stateSchema.identity
>();
export const WorldSkyBinding = new ScriptSynchronizer<
  GameWorld,
  typeof SkyRDA.stateSchema
>(
  'sky',
  SkyRDA.stateSchema,
  [
    // Render-safe shader parameters. These update existing global uniforms;
    // map scripts never receive shader source or pipeline access.
    bindSky.num('globalLight', 'globalLight', 0, 0.6),
    bindSky.num('gamma', 'gamma', 0.1, 3),
    bindSky.num('sunPhase', 'sunPhase', 0, 1),
    bindSky.num('sunFrequency', 'sunFrequency'),
    bindSky.num('lunarPhase', 'lunarPhase', 0, 1),

    bindSky.xyz('sunDirection', 'sunDirection'),
    bindSky.light('sunLight', 'sunColor'),
    bindSky.light('skyLeftLight', 'skyLeft'),
    bindSky.light('skyRightLight', 'skyRight'),
    bindSky.light('skyTopLight', 'skyTop'),
    bindSky.light('skyBottomLight', 'skyBottom'),
    bindSky.light('skyFrontLight', 'skyFront'),
    bindSky.light('skyBackLight', 'skyBack'),

    bindSky.enum('lightMode', 'skyType', {
      natural: 0,
      manual: 1,
    }),
  ],
  null,
  null,
);

const bindFog = new BindingFactory<
  GameWorld,
  typeof FogRDA.stateSchema.identity
>();
export const WorldFogBinding = new ScriptSynchronizer<
  GameWorld,
  typeof FogRDA.stateSchema
>(
  'fog',
  FogRDA.stateSchema,
  [
    bindFog.rgb2rgb('fogColor', 'fogColor'),
    bindFog.num('fogStartDistance', 'fogStartDistance', 0),
    bindFog.num('fogHeightOffset', 'fogHeightOffset'),
    bindFog.num('fogHeightFalloff', 'fogHeightFalloff', 0, 1),
    bindFog.num('fogUniformDensity', 'fogDensity', 0, 1),
    bindFog.num('maxFog', 'maxFog', 0, 1),
  ],
  null,
  null,
);

const bindSnow = new BindingFactory<
  GameWorld,
  typeof SnowRDA.stateSchema.identity
>();
export const WorldSnowBinding = new ScriptSynchronizer<
  GameWorld,
  typeof SnowRDA.stateSchema
>(
  'snow',
  SnowRDA.stateSchema,
  [
    bindSnow.num('snowDensity', 'density'),
    bindSnow.nestedEngineNum('snowSizeLo', 'size', 'w'),
    bindSnow.nestedEngineNum('snowSizeHi', 'size', 'h'),
    bindSnow.num('snowFallSpeed', 'fallSpeed'),
    bindSnow.num('snowSpinSpeed', 'spinSpeed'),
    bindSnow.rgba2rgba('snowColor', 'color'),
    bindSnow.asset('snowTexture', 'texture', GameAssetType.PARTICLE_TEXTURE),
  ],
  null,
  null,
);

const bindRain = new BindingFactory<
  GameWorld,
  typeof RainRDA.stateSchema.identity
>();
export const WorldRainBinding = new ScriptSynchronizer<
  GameWorld,
  typeof RainRDA.stateSchema
>(
  'rain',
  RainRDA.stateSchema,
  [
    bindRain.num('rainDensity', 'density'),
    bindRain.xyz('rainDirection', 'direction'),
    bindRain.num('rainSpeed', 'speed'),
    bindRain.nestedEngineNum('rainSizeLo', 'size', 'w'),
    bindRain.nestedEngineNum('rainSizeHi', 'size', 'h'),
    bindRain.num('rainInterference', 'interference'),
    bindRain.rgba2rgba('rainColor', 'color'),
  ],
  null,
  null,
);

const bindSound = new BindingFactory<
  GameWorld,
  typeof AmbientSoundRDA.stateSchema.identity
>();
export const WorldSoundBinding = new ScriptSynchronizer<
  GameWorld,
  typeof AmbientSoundRDA.stateSchema
>(
  'ambient_sound',
  AmbientSoundRDA.stateSchema,
  [
    bindSound.sound('ambientSound', 'ambient'),
    bindSound.sound('breakVoxelSound', 'breakVoxel'),
    bindSound.sound('placeVoxelSound', 'placeVoxel'),
    bindSound.sound('playerJoinSound', 'playerJoin'),
    bindSound.sound('playerLeaveSound', 'playerLeave'),
  ],
  null,
  null,
);
