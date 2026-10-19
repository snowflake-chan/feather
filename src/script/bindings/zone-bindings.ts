import { MuVarint } from '@box/mudb/schema';
import { GameAssetType, GameZone } from '@box/schema/api/js/api';
import { GameVector3 } from '@box/schema/api/js/math';
import { CodeGenBlock } from '../codegen';
import { PhysicsZone, PhysicsZoneSchema } from '@box/schema/zone/zone-schema';
import {
  ServerEnvironmentZone,
  ServerEnvironmentZoneSchema,
} from '../../zone/zone-server-state';
import { BindingFactory, safePropExpr } from './binding-factory';
import { ScriptSynchronizer } from './synchronizer';
import { ScriptZoneWrapper } from './zone-synchronizer';

export const ZONE_INDEX = new WeakMap<GameZone, ScriptZoneWrapper>();

const zoneBinding = {
  name: 'selector-group',
  schema: new MuVarint(),

  checkPostTick: (script: GameZone, engine: { selectorGroup: Number }) => {
    const wrapper = ZONE_INDEX.get(script);
    if (!wrapper) {
      return false;
    }
    const g = wrapper.physicsSelector;
    if (!g) {
      return false;
    }
    return g.id !== engine.selectorGroup;
  },

  deltaPostTick: (script: GameZone) => {
    const wrapper = ZONE_INDEX.get(script);
    if (!wrapper) {
      return 0;
    }
    const g = wrapper.physicsSelector;
    if (!g) {
      return 0;
    }
    return g.id;
  },

  emitSynchronize: (block, engineObj, patchTok) => {
    block.push(`${engineObj}.selectorGroup = ${patchTok}`);
  },
};

const bindPhysicsZone = new BindingFactory<GameZone, PhysicsZone>();
export const PhysicsZoneBinding = new ScriptSynchronizer(
  'PhysicsZone',
  PhysicsZoneSchema,
  [
    zoneBinding,
    bindPhysicsZone.zoneBounds(
      'bounds',
      'minX',
      'minY',
      'minZ',
      'maxX',
      'maxY',
      'maxZ',
    ),
    bindPhysicsZone.num('massScale', 'massScale'),
    bindPhysicsZone.propVec3('force', ['fx', 'fy', 'fz']),
  ],
  (zone) => {
    if (zone.force instanceof GameVector3) {
      return !!(zone.force.x || zone.force.y || zone.force.z);
    }
    if (Array.isArray(zone.force)) {
      return !!(zone.force[0] || zone.force[1] || zone.force[2]);
    }
    return false;
  },
  null,
);

function checkFlag<Prop extends keyof GameZone>(prop: Prop) {
  return function (
    check: CodeGenBlock,
    scriptObj: string,
    _: string,
    flag: string,
  ) {
    check.push(`${flag} = !!(${safePropExpr(scriptObj, prop)});`);
  };
}

const bindEnvironmentZone = new BindingFactory<
  GameZone,
  ServerEnvironmentZone
>();
export const EnvironmentZoneBinding = new ScriptSynchronizer(
  'EnvironmentZone',
  ServerEnvironmentZoneSchema,
  [
    bindEnvironmentZone.zoneBounds(
      'bounds',
      'minX',
      'minY',
      'minZ',
      'maxX',
      'maxY',
      'maxZ',
    ),
    zoneBinding,

    bindEnvironmentZone.bool('fogEnabled', 'overrideFog'),
    ...bindEnvironmentZone.nestEngine(
      'fog',
      (bindFog) => [
        bindFog.rgb2rgb('fogColor', 'fogColor'),
        bindFog.num('fogStartDistance', 'fogStartDistance'),
        bindFog.num('fogHeightOffset', 'fogHeightOffset'),
        bindFog.num('fogHeightFalloff', 'fogHeightFalloff'),
        bindFog.num('fogDensity', 'fogDensity'),
        bindFog.num('fogMax', 'maxFog'),
      ],
      checkFlag('fogEnabled'),
    ),

    bindEnvironmentZone.bool('snowEnabled', 'overrideSnow'),
    ...bindEnvironmentZone.nestEngine(
      'snow',
      (bindSnow) => [
        bindSnow.num('snowDensity', 'density'),
        bindSnow.nestedEngineNum('snowSizeLo', 'size', 'w'),
        bindSnow.nestedEngineNum('snowSizeHi', 'size', 'h'),
        bindSnow.num('snowFallSpeed', 'fallSpeed'),
        bindSnow.num('snowSpinSpeed', 'spinSpeed'),
        bindSnow.rgba2rgba('snowColor', 'color'),
        bindSnow.asset(
          'snowTexture',
          'texture',
          GameAssetType.PARTICLE_TEXTURE,
        ),
      ],
      checkFlag('snowEnabled'),
    ),

    bindEnvironmentZone.bool('rainEnabled', 'overrideRain'),
    ...bindEnvironmentZone.nestEngine(
      'rain',
      (bindRain) => [
        bindRain.num('rainDensity', 'density'),
        bindRain.xyz('rainDirection', 'direction'),
        bindRain.num('rainSpeed', 'speed'),
        bindRain.nestedEngineNum('rainSizeLo', 'size', 'w'),
        bindRain.nestedEngineNum('rainSizeHi', 'size', 'h'),
        bindRain.num('rainInterference', 'interference'),
        bindRain.rgba2rgba('rainColor', 'color'),
      ],
      checkFlag('rainEnabled'),
    ),

    bindEnvironmentZone.bool('skyEnabled', 'overrideSky'),
    ...bindEnvironmentZone.nestEngine(
      'sky',
      (bindSky) => [
        bindSky.enum('skyMode', 'skyType', {
          natural: 0,
          manual: 1,
        }),
        bindSky.num('skySunPhase', 'sunPhase'),
        bindSky.num('skySunFrequency', 'sunFrequency'),
        bindSky.num('skyLunarPhase', 'lunarPhase'),
        bindSky.xyz('skySunDirection', 'sunDirection'),
        bindSky.light('skySunLight', 'sunColor'),
        bindSky.light('skyLeftLight', 'skyLeft'),
        bindSky.light('skyRightLight', 'skyRight'),
        bindSky.light('skyTopLight', 'skyTop'),
        bindSky.light('skyBottomLight', 'skyBottom'),
        bindSky.light('skyFrontLight', 'skyFront'),
        bindSky.light('skyBackLight', 'skyBack'),
      ],
      checkFlag('skyEnabled'),
    ),
  ],
  (zone) => {
    return (
      zone.fogEnabled || zone.rainEnabled || zone.skyEnabled || zone.snowEnabled
    );
  },
  null,
);
