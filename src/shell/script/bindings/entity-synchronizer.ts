import {
  GameEntityConfig,
  GameEntity,
  GameEntityContactEvent,
  GameVoxelContactEvent,
  GameFluidContactEvent,
  GameEntityEvent,
  GamePlayer,
  GameChatEvent,
  GameInputEvent,
  GameClickEvent,
  GameDamageEvent,
  GameHurtOptions,
  GameRespawnEvent,
  GameDieEvent,
  GameDialogParams,
  GameDialogResponse,
  GameAssetType,
  GameWearable,
  GameWearableSpec as GameWearableConfig,
  GameBodyPart,
  GameInteractEvent,
  GameEntityKeyframe,
  GamePlayerKeyframe,
  NavigatorEventType,
  Sound,
  GameKeyBoardEvent,
} from '@box/schema/api/js/api';
import {
  coerceObject,
  coerceVec3,
  coerceQuat,
  coerceNum,
  coerceBool,
  coerceRGBA,
  coerceString,
  coerceColorSpline,
  coerceSizeSpline,
  coerceEntityRef,
  coerceTags,
  coerceRGB,
  coerceSound,
} from './coerce';
import { ScriptSynchronizer, ScriptSyncPatch } from './synchronizer';
import {
  MuSchema,
  MuStruct,
  MuSortedArray,
  MuVarint,
  MuUint8,
  MuArray,
  MuQuantizedFloat,
  MuBoolean,
} from '@box/mudb/schema';
import { TaggedId, compareId, zipId } from '@box/utils/id';
import { ScriptStateSnapshot } from '../script-state-schema';
import { ScriptDispatcher } from '@box/schema/script/dispatcher';
import { Logger } from '@box/utils/logger';
import { GameQuaternion, GameVector3 } from '@box/schema/api/js/math';
import {
  RigidBodyBinding,
  ModelBinding,
  PlayerBinding,
  PlayerDisplayBinding,
  PlayerServerBinding,
  PlayerReplicaBinding,
  PlayerInputBinding,
  DamageBinding,
  ContactBinding,
  ParticleBinding,
  InteractBinding,
  SoundBinding,
  PlayerSoundBinding,
  EntityNameBinding,
} from './entity-bindings';
import {
  ScriptSeedInfo,
  ScriptConfig,
  ScriptPostTick,
  ScriptPerfCounter,
} from '../script-protocol';
import { ParsedSelector } from './selectors';
import { ScriptResourceSync } from './resource';
import {
  WRAPPER_INDEX,
  WRAPPER_PLAYER_INDEX,
  ENTITY_INDEX,
} from './binding-factory';
import { BodyPart } from '@box/schema/player/player-schema';
import { HashSchema } from '@box/schema/content-server/index';
import { Vec3Schema, QuatSchema } from '@box/schema/utils/math-schema';
import { PlaySoundPosition } from '@box/schema/sound/sound-protocol';
import { ServerPlayer } from '../../player/player-server-schema';
import {
  ScriptPhysicsSelectorManager,
  ScriptPhysicsSelectorGroup,
} from './physics-selector';
import { CollisionFilterSchema } from '@box/schema/physics/collision-filter';
import {
  ScriptAnimationManager,
  ScriptAnimationTarget,
  ScriptParserAPI,
} from './animations';
import { ScriptMotionManager, ScriptMotionTarget } from './motions';
import { ENTITY_ANIM_BINDING } from '@box/schema/keyframes/bindings/entity-animation';
import { PLAYER_ANIM_BINDING } from '@box/schema/keyframes/bindings/player-animation';
import { ScriptScheduler } from '@box/utils/script/script-scheduler';
import {
  NavigatorEventListener,
  PostMessageScriptType,
} from '@box/schema/navigator/navigator-schema';
import { mat4, quat, vec3, mat3 } from 'gl-matrix';

// Numeric ids
export function compareNum(a: number, b: number) {
  return a - b;
}
export const NumSetSchema = new MuSortedArray(
  new MuVarint(),
  Infinity,
  compareNum,
);

export const ScriptWearableSchema = new MuStruct({
  part: <MuSchema<BodyPart>>new MuUint8(),

  // mesh id reference
  meshId: new MuVarint(),

  // material modifiers
  red: new MuQuantizedFloat(1 / 256, 1),
  green: new MuQuantizedFloat(1 / 256, 1),
  blue: new MuQuantizedFloat(1 / 256, 1),
  emissive: new MuQuantizedFloat(1 / 256, 0),
  shininess: new MuQuantizedFloat(1 / 256, 0),
  metalness: new MuQuantizedFloat(1 / 256, 0),

  // bind matrix
  offset: Vec3Schema,
  scale: Vec3Schema,
  orientation: QuatSchema,
});

export type ScriptWearable = typeof ScriptWearableSchema.identity;

export const ScriptWearableSetSchema = new MuArray(
  ScriptWearableSchema,
  Infinity,
);

export const ScriptWearableUpdateSchema = new MuStruct({
  id: new MuVarint(),
  wearables: ScriptWearableSetSchema,
});

export type ScriptWearableUpdate = typeof ScriptEntityUpdateSchema.identity;

export const ScriptEntityUpdateSchema = new MuStruct({
  // Entity set management
  createdEntities: NumSetSchema,
  deletedEntities: NumSetSchema,

  // Rigid Bodies
  bodies: new MuSortedArray(RigidBodyBinding, Infinity, compareId),

  // Models
  models: new MuSortedArray(ModelBinding, Infinity, compareId),
  deletedModels: NumSetSchema,

  // Damage
  damage: new MuSortedArray(DamageBinding, Infinity, compareId),
  deletedDamage: NumSetSchema,

  // Particles
  particles: new MuSortedArray(ParticleBinding, Infinity, compareId),
  deletedParticles: NumSetSchema,

  // Players
  players: new MuSortedArray(PlayerBinding, Infinity, compareId),
  playerDisplay: new MuSortedArray(PlayerDisplayBinding, Infinity, compareId),
  serverPlayer: new MuSortedArray(PlayerServerBinding, Infinity, compareId),
  playerReplicas: new MuSortedArray(PlayerReplicaBinding, Infinity, compareId),

  // Wearable state
  wearableUpdates: new MuSortedArray(
    ScriptWearableUpdateSchema,
    Infinity,
    compareId,
  ),

  // Interactive
  interactive: new MuSortedArray(InteractBinding, Infinity, compareId),
  deletedInteractive: NumSetSchema,

  // entityName
  entityName: new MuSortedArray(EntityNameBinding, Infinity, compareId),
  deletedEntityName: NumSetSchema,

  // Sound effects
  sound: new MuSortedArray(SoundBinding, Infinity, compareId),
  deletedSound: NumSetSchema,
  playerSound: new MuSortedArray(PlayerSoundBinding, Infinity, compareId),
  deletedPlayerSound: NumSetSchema,

  // collision filter updates
  needsCollisionFilterUpdate: new MuBoolean(false),
  collisionFilter: CollisionFilterSchema,
});
export type ScriptEntityUpdate = typeof ScriptEntityUpdateSchema.identity;

const coerceEntityConfig = coerceObject<GameEntityConfig>({
  // todo accept name and tags in constructor
  position: coerceVec3,
  velocity: coerceVec3,
  bounds: coerceVec3,

  mass: coerceNum,
  friction: coerceNum,
  restitution: coerceNum,

  collides: coerceBool,
  fixed: coerceBool,
  gravity: coerceBool,

  mesh: coerceString,
  meshScale: coerceVec3,
  meshOrientation: coerceQuat,
  meshColor: coerceRGBA,
  meshShininess: coerceNum,
  meshEmissive: coerceNum,
  meshMetalness: coerceNum,
  anchorOffset: coerceVec3,

  particleRate: coerceNum,
  particleRateSpread: coerceNum,
  particleLimit: coerceNum,
  particleColor: coerceColorSpline,
  particleSize: coerceSizeSpline,
  particleSizeSpread: coerceNum,
  particleLifetime: coerceNum,
  particleLifetimeSpread: coerceNum,
  particleVelocity: coerceVec3,
  particleVelocitySpread: coerceVec3,
  particleDamping: coerceNum,
  particleAcceleration: coerceVec3,
  particleNoise: coerceNum,
  particleNoiseFrequency: coerceNum,
  particleTargetWeight: coerceNum,
  particleTarget: coerceEntityRef,

  enableInteract: coerceBool,
  interactHint: coerceString,
  interactColor: coerceRGB,
  interactRadius: coerceNum,

  chatSound: coerceSound,
  hurtSound: coerceSound,
  dieSound: coerceSound,
  interactSound: coerceSound,

  id: coerceString,
  tags: coerceTags,
});

const BODY_PART_LIST: GameBodyPart[] = [
  GameBodyPart.HIPS,
  GameBodyPart.TORSO,
  GameBodyPart.NECK,
  GameBodyPart.HEAD,
  GameBodyPart.LEFT_SHOULDER,
  GameBodyPart.LEFT_UPPER_ARM,
  GameBodyPart.LEFT_LOWER_ARM,
  GameBodyPart.LEFT_HAND,
  GameBodyPart.LEFT_UPPER_LEG,
  GameBodyPart.LEFT_LOWER_LEG,
  GameBodyPart.LEFT_FOOT,
  GameBodyPart.RIGHT_SHOULDER,
  GameBodyPart.RIGHT_UPPER_ARM,
  GameBodyPart.RIGHT_LOWER_ARM,
  GameBodyPart.RIGHT_HAND,
  GameBodyPart.RIGHT_UPPER_LEG,
  GameBodyPart.RIGHT_LOWER_LEG,
  GameBodyPart.RIGHT_FOOT,
];

function coerceBodypart(x: any) {
  const part = ('' + x).toLowerCase();
  for (let i = 0; i < BODY_PART_LIST.length; ++i) {
    if (part === BODY_PART_LIST[i].toLowerCase()) {
      return BODY_PART_LIST[i];
    }
  }
  const glitchPartName = part.toUpperCase();
  if (glitchPartName in GameBodyPart) {
    return GameBodyPart[glitchPartName];
  }
  return GameBodyPart.HIPS;
}

const coerceWearableConfig = coerceObject<GameWearableConfig>({
  bodyPart: coerceBodypart,

  mesh: coerceString,
  emissive: coerceNum,
  shininess: coerceNum,
  metalness: coerceNum,

  offset: coerceVec3,
  orientation: coerceQuat,
  scale: (x: any, def: GameVector3) => {
    if (typeof x === 'number') {
      def[0] = +x || 0;
      def[1] = +x || 0;
      def[2] = +x || 0;
      return def;
    }
    return coerceVec3(x, def);
  },
  color: coerceRGB,
});

export interface GameUIDEntity extends GameEntity {
  uid: number;
}

export class ScriptEntityWrapper {
  public destroyed = false;
  public isPlayer = false;

  public pendingDestroy = false;

  public seedId = '';
  public tags: { [tag: string]: boolean } = {};

  public onDestroy = new ScriptDispatcher<GameEntityEvent>(true);

  public onDamage = new ScriptDispatcher<GameDamageEvent>();
  public onDie = new ScriptDispatcher<GameDieEvent>();
  public onRespawn = new ScriptDispatcher<GameRespawnEvent>();

  public onEntityContact = new ScriptDispatcher<GameEntityContactEvent>();
  public onEntitySeparate = new ScriptDispatcher<GameEntityContactEvent>();
  public onVoxelContact = new ScriptDispatcher<GameVoxelContactEvent>();
  public onVoxelSeparate = new ScriptDispatcher<GameVoxelContactEvent>();
  public onFluidEnter = new ScriptDispatcher<GameFluidContactEvent>();
  public onFluidLeave = new ScriptDispatcher<GameFluidContactEvent>();

  public onChat = new ScriptDispatcher<GameChatEvent>();

  public onClick = new ScriptDispatcher<GameClickEvent>();

  public onPress = new ScriptDispatcher<GameInputEvent>();
  public onRelease = new ScriptDispatcher<GameInputEvent>();

  public onKeyUp = new ScriptDispatcher<GameKeyBoardEvent>();
  public onKeyDown = new ScriptDispatcher<GameKeyBoardEvent>();

  public onInteract = new ScriptDispatcher<GameInteractEvent>();

  public dieTick = Infinity;
  public lastAttacker: GameEntity | null = null;
  public lastDamageType: string = '';

  public entity: GameUIDEntity;

  public collisionGroup: ScriptPhysicsSelectorGroup | null = null;

  // Tag managemnt functions
  public hasTag = (x: string) => !!this.tags['' + x];
  public addTag = (x_: string) => {
    const x = '' + x_;
    if (this.tags[x]) {
      return;
    }
    this.tags[x] = true;
    this.collisionGroup = null;
    this.physicsSelectors.notifyDirty();
  };
  public removeTag = (x_: string) => {
    const x = '' + x_;
    if (!this.tags[x]) {
      return;
    }
    delete this.tags[x];
    this.collisionGroup = null;
    this.physicsSelectors.notifyDirty();
  };
  public getTags = () => Object.keys(this.tags);

  // wearable management
  public wearableState = ScriptWearableUpdateSchema.clone(
    ScriptWearableUpdateSchema.identity,
  );
  public wearables: GameWearable[] = [];
  public listWearables = (bodyPart?: string) => {
    if (bodyPart) {
      const partName = coerceBodypart(bodyPart);
      return this.wearables.filter((x) => x.bodyPart === partName);
    } else {
      return this.wearables.slice();
    }
  };
  public addWearable = (spec: Partial<GameWearableConfig>) => {
    const wearable = new GameWearable();
    wearable.player = this.entity.player || null;
    coerceWearableConfig(spec, wearable);
    this.wearables.push(wearable);
    return wearable;
  };
  public removeWearable = (wearable: GameWearable) => {
    const idx = this.wearables.indexOf(wearable);
    if (idx >= 0) {
      wearable.player = null;
      this.wearables.splice(idx, 1);
    }
  };
  public setSkinByName(skinName: unknown, resource: ScriptResourceSync) {
    if (!this.entity.player) {
      return;
    }
    if (typeof skinName !== 'string') {
      console.warn(
        `error read param ${JSON.stringify(
          skinName,
        )}, skin name must be string`,
      );
      return;
    }

    if (!resource.nameToSkinId[skinName]) {
      console.warn(`cannot find skin name ${skinName} in resources`);
      return;
    }

    const { skin } = this.entity.player;
    Object.keys(skin).forEach((partName) => (skin[partName] = skinName));
  }
  public resetToDefaultSkin(resource: ScriptResourceSync) {
    if (!this.entity.player) {
      return;
    }
    const { skin } = this.entity.player;
    Object.keys(skin).forEach(
      (partName) => (skin[partName] = resource.defaultSkinName),
    );
  }
  public clearSkin = () => {
    if (!this.entity.player) {
      return;
    }
    const { skin } = this.entity.player;
    Object.keys(skin).forEach((partName) => (skin[partName] = null));
  };

  public lookAt = (
    target: GameVector3,
    facingDirection: 'X' | 'Y' | 'Z' = 'Z',
    up: GameVector3 = new GameVector3(0, 1, 0),
  ) => {
    target = coerceVec3(target, new GameVector3(0, 0, 0));
    up = coerceVec3(up, new GameVector3(0, 1, 0));

    if (facingDirection && !['X', 'Y', 'Z'].includes(facingDirection)) {
      console.warn(
        `unexpected read '${JSON.stringify(
          facingDirection,
        )}', param "facingDirection" must be "X", "Y" or "Z"`,
      );
      facingDirection = 'Z';
    }
    const position = this.entity.position;

    const upVec3 = vec3.fromValues(up.x, up.y, up.z);
    vec3.normalize(upVec3, upVec3);

    const rotateQuat = quat.create();
    const rotMat = mat3.create();

    const currentX = vec3.create();
    const currentY = vec3.create();
    const currentZ = vec3.create();

    vec3.normalize(
      currentZ,
      vec3.sub(
        currentZ,
        [target.x, target.y, target.z],
        [position.x, position.y, position.z],
      ),
    );

    // eye and target are in the same position
    if (vec3.length(currentZ) === 0) {
      currentZ[2] = 1;
    }

    vec3.cross(currentX, upVec3, currentZ);

    if (vec3.length(currentX) === 0) {
      // up and z are parallel
      if (Math.abs(up[2]) === 1) {
        currentZ[0] += 0.0001;
      } else {
        currentZ[2] += 0.0001;
      }

      vec3.normalize(currentZ, currentZ);
      vec3.cross(currentX, upVec3, currentZ);
    }

    vec3.cross(currentY, currentZ, currentX);

    switch (facingDirection) {
      case 'X':
        mat3.set(
          rotMat,
          currentZ[0],
          currentZ[1], // right
          currentZ[2],
          currentY[0],
          currentY[1], // up
          currentY[2],
          -currentX[0],
          -currentX[1], // front
          -currentX[2],
        );
        break;
      case 'Y':
        mat3.set(
          rotMat,
          -currentX[0],
          -currentX[1],
          -currentX[2],
          currentZ[0],
          currentZ[1],
          currentZ[2],
          currentY[0],
          currentY[1],
          currentY[2],
        );
        break;
      case 'Z':
        mat3.set(
          rotMat,
          currentX[0],
          currentX[1],
          currentX[2],
          currentY[0],
          currentY[1],
          currentY[2],
          currentZ[0],
          currentZ[1],
          currentZ[2],
        );
        break;
    }

    quat.fromMat3(rotateQuat, rotMat);
    quat.normalize(rotateQuat, rotateQuat);

    // x,y,z,w !!
    this.entity.meshOrientation.set(
      rotateQuat[0],
      rotateQuat[1],
      rotateQuat[2],
      rotateQuat[3],
    );
  };

  public rotateLocal = (
    localPosition: GameVector3,
    axis: 'X' | 'Y' | 'Z',
    rad: number,
  ) => {
    const { px, py, pz } = this.applyTransform(
      localPosition.x,
      localPosition.y,
      localPosition.z,
    );

    let tempQuat: GameQuaternion;

    switch (axis) {
      case 'X':
        tempQuat = this.entity.meshOrientation.rotateX(rad);
        break;
      case 'Y':
        tempQuat = this.entity.meshOrientation.rotateY(rad);
        break;
      case 'Z':
        tempQuat = this.entity.meshOrientation.rotateZ(rad);
        break;
    }

    this.entity.meshOrientation.copy(tempQuat.normalize());

    const {
      px: px2,
      py: py2,
      pz: pz2,
    } = this.applyTransform(localPosition.x, localPosition.y, localPosition.z);

    this.entity.position.x = this.entity.position.x + px - px2;
    this.entity.position.y = this.entity.position.y + py - py2;
    this.entity.position.z = this.entity.position.z + pz - pz2;
  };

  public scaleLocal = (localPos: GameVector3, v: GameVector3) => {
    const { px, py, pz } = this.applyTransform(
      localPos.x,
      localPos.y,
      localPos.z,
    );

    this.entity.meshScale.copy(v);

    const {
      px: px2,
      py: py2,
      pz: pz2,
    } = this.applyTransform(localPos.x, localPos.y, localPos.z);

    this.entity.position.x = this.entity.position.x + px - px2;
    this.entity.position.y = this.entity.position.y + py - py2;
    this.entity.position.z = this.entity.position.z + pz - pz2;
  };

  public pollWearables(resource: ScriptResourceSync) {
    const wearableScript = this.wearables;
    const wearableEngine: ScriptWearable[] = [];

    for (let i = 0; i < wearableScript.length; ++i) {
      const script = wearableScript[i];
      coerceWearableConfig(script, script);

      const meshId = resource.getMeshId(script.mesh);
      if (!meshId) {
        continue;
      }

      const engine = ScriptWearableSchema.alloc();
      engine.part = BodyPart[script.bodyPart] || 0;
      engine.red = +script.color.r;
      engine.green = +script.color.g;
      engine.blue = +script.color.b;
      engine.emissive = +script.emissive;
      engine.metalness = +script.metalness;
      engine.shininess = +script.shininess;
      engine.meshId = meshId;
      engine.offset[0] = +script.offset.x;
      engine.offset[1] = +script.offset.y;
      engine.offset[2] = +script.offset.z;
      engine.scale[0] = +script.scale.x;
      engine.scale[1] = +script.scale.y;
      engine.scale[2] = +script.scale.z;
      engine.orientation[0] = +script.orientation.w;
      engine.orientation[1] = +script.orientation.x;
      engine.orientation[2] = +script.orientation.y;
      engine.orientation[3] = +script.orientation.z;
      wearableEngine.push(engine);
    }

    const changed = !ScriptWearableSetSchema.equal(
      wearableEngine,
      this.wearableState.wearables,
    );
    if (changed) {
      const prevWearable = this.wearableState.wearables;
      this.wearableState.wearables = wearableEngine;
      ScriptWearableSetSchema.free(prevWearable);
    } else {
      ScriptWearableSetSchema.free(wearableEngine);
    }

    return changed;
  }

  public applyTransform(px: number, py: number, pz: number) {
    const sx = this.entity.meshScale.x;
    const sy = this.entity.meshScale.y;
    const sz = this.entity.meshScale.z;

    const qx = this.entity.meshOrientation.w;
    const qy = this.entity.meshOrientation.x;
    const qz = this.entity.meshOrientation.y;
    const qw = this.entity.meshOrientation.z;

    const x2 = qx + qx;
    const y2 = qy + qy;
    const z2 = qz + qz;

    const xx = qx * x2;
    const yx = qy * x2;
    const yy = qy * y2;
    const zx = qz * x2;
    const zy = qz * y2;
    const zz = qz * z2;
    const wx = qw * x2;
    const wy = qw * y2;
    const wz = qw * z2;

    const m0 = 1 - yy - zz;
    const m1 = yx + wz;
    const m2 = zx - wy;
    const m3 = yx - wz;
    const m4 = 1 - xx - zz;
    const m5 = zy + wx;

    const m6 = zx + wy;
    const m7 = zy - wx;
    const m8 = 1 - xx - yy;

    let tempX = sx * px;
    let tempY = sy * py;
    let tempZ = sz * pz;

    return {
      px: tempX * m0 + tempY * m3 + tempZ * m6,
      py: tempX * m1 + tempY * m4 + tempZ * m7,
      pz: tempX * m2 + tempY * m5 + tempZ * m8,
    };
  }

  public destroyWrapper(reason: string, scheduler: ScriptScheduler) {
    this.onDamage.destroy(reason, scheduler);
    this.onDie.destroy(reason, scheduler);
    this.onRespawn.destroy(reason, scheduler);
    this.onEntityContact.destroy(reason, scheduler);
    this.onEntitySeparate.destroy(reason, scheduler);
    this.onVoxelContact.destroy(reason, scheduler);
    this.onVoxelSeparate.destroy(reason, scheduler);
    this.onFluidEnter.destroy(reason, scheduler);
    this.onFluidLeave.destroy(reason, scheduler);
    this.onChat.destroy(reason, scheduler);
    this.onClick.destroy(reason, scheduler);
    this.onPress.destroy(reason, scheduler);
    this.onKeyUp.destroy(reason, scheduler);
    this.onKeyDown.destroy(reason, scheduler);
    this.onRelease.destroy(reason, scheduler);
    this.animations.destroy(reason);
    this.playerAnimations.destroy(reason);
    this.motion.destroy(reason);
    ScriptWearableUpdateSchema.free(this.wearableState);
  }

  constructor(
    public id: number,
    public destroy: () => void,
    public hurt: (damage: number, options?: Partial<GameHurtOptions>) => void,
    public say: (
      message: string,
      options?: { duration?: number; hideFloat?: boolean },
    ) => void,
    public playSound: (spec) => Sound,
    public physicsSelectors: ScriptPhysicsSelectorManager,
    public animations: ScriptAnimationTarget<
      GameEntity,
      GameEntityKeyframe,
      typeof ENTITY_ANIM_BINDING
    >,
    public playerAnimations: ScriptAnimationTarget<
      GamePlayer,
      GamePlayerKeyframe,
      typeof PLAYER_ANIM_BINDING
    >,
    public motion: ScriptMotionTarget<GameEntity>,
  ) {
    this.entity = new GameEntity(
      this.getTags,
      this.addTag,
      this.removeTag,
      this.hasTag,
      destroy,
      this.onDestroy.channel,
      this.onDestroy.future,
      this.onDamage.channel,
      this.onDamage.future,
      this.onDie.channel,
      this.onDie.future,
      hurt,
      say,
      this.animations.animate,
      this.animations.getAnimations,
      this.onClick.channel,
      this.onClick.future,
      this.onEntityContact.channel,
      this.onEntityContact.future,
      this.onEntitySeparate.channel,
      this.onEntitySeparate.future,
      this.onVoxelContact.channel,
      this.onVoxelContact.future,
      this.onVoxelSeparate.channel,
      this.onVoxelSeparate.future,
      this.onFluidEnter.channel,
      this.onFluidEnter.future,
      this.onFluidLeave.channel,
      this.onFluidLeave.future,
      this.onInteract.channel,
      this.onInteract.future,
      this.playSound,
      this.motion,
      this.lookAt,
      this.rotateLocal,
      this.scaleLocal,
    ) as GameUIDEntity;
    this.animations.target = this.entity;
    this.motion.target = this.entity;
    this.wearableState.id = id;
    this.entity.uid = id;
  }
}

export class ScriptEntitySync {
  public entityCounter = 0;

  // Entity list
  public entities: ScriptEntityWrapper[] = [];
  public entityIndex = ENTITY_INDEX;
  public pendingCreate: number[] = [];
  public pendingDelete: number[] = [];
  public wrapperIndex = WRAPPER_INDEX;

  public playerCount = 0;
  public entityCount = 0;

  public animations: ScriptAnimationManager<
    GameEntity,
    GameEntityKeyframe,
    typeof ENTITY_ANIM_BINDING
  >;
  public playerAnimations: ScriptAnimationManager<
    GamePlayer,
    GamePlayerKeyframe,
    typeof PLAYER_ANIM_BINDING
  >;

  public motions: ScriptMotionManager<GameEntity>;

  constructor(
    public config: ScriptConfig,
    public resources: ScriptResourceSync,
    public logger: Logger,
    public perf: ScriptPerfCounter,
    public scheduler: ScriptScheduler,
    public notifyEntityCreate: (entity: ScriptEntityWrapper) => void,
    public notifyEntityDestroy: (entity: ScriptEntityWrapper) => void,
    public schedule: <EventType extends { tick: number }>(
      dispatcher: ScriptDispatcher<EventType>,
      ev: EventType,
    ) => void,
    public sendChat: (
      senderId: number,
      receiverId: number,
      message: string,
      options?: { duration?: number; hideFloat?: boolean },
    ) => void,
    public kick: (playerId: number) => void,
    public hurtEntity: (
      target: ScriptEntityWrapper,
      attacker: ScriptEntityWrapper | null,
      amount: number,
      type: string,
    ) => void,
    public forceRespawn: (entity: ScriptEntityWrapper) => void,
    public handleDialog: (
      entity: ScriptEntityWrapper,
      params: GameDialogParams,
    ) => Promise<GameDialogResponse>,
    public cancelDialogs: (entity: ScriptEntityWrapper) => void,
    public openLink: (
      entity: ScriptEntityWrapper,
      href: string,
      options?: { isConfirm?: boolean; isNewTab?: boolean },
    ) => void,
    public postMessage: (
      entity: ScriptEntityWrapper,
      content: PostMessageScriptType,
    ) => void,
    public addEventListener: (
      entity: ScriptEntityWrapper,
      type: NavigatorEventType,
      listener: NavigatorEventListener,
    ) => void,
    public playSound: (
      sample: string,
      position: PlaySoundPosition,
      gain: number,
      pitch: number,
      radius: number,
    ) => Sound,
    public setCameraPitch: (playerId: number, value: number) => void,
    public setCameraYaw: (playerId: number, value: number) => void,
    public physicsSelectors: ScriptPhysicsSelectorManager,
    public keyframeParser: ScriptParserAPI,
  ) {
    this.animations = new ScriptAnimationManager(
      ENTITY_ANIM_BINDING,
      this.schedule,
      this.scheduler,
      this.perf,
      this.keyframeParser,
      config,
    );
    this.playerAnimations = new ScriptAnimationManager(
      PLAYER_ANIM_BINDING,
      this.schedule,
      this.scheduler,
      this.perf,
      this.keyframeParser,
      config,
    );
    this.motions = new ScriptMotionManager(
      this.resources,
      this.schedule,
      this.scheduler,
    );
  }

  public quota = () => {
    return this.config.entityLimit - this.entityCount + this.playerCount;
  };

  public initSeeds(info: ScriptSeedInfo[]) {
    zipId(
      (seed, wrapper) => {
        wrapper.seedId = seed.seed;
        wrapper.entity.id = seed.name;
        for (let i = 0; i < seed.tags.length; ++i) {
          wrapper.addTag(seed.tags[i]);
        }
      },
      info,
      this.entities,
    );
  }

  public querySelector = (selector: string) => {
    const testSelector = new ParsedSelector(selector + '');
    for (let i = 0; i < this.entities.length; ++i) {
      const wrapper = this.entities[i];
      if (testSelector.testEntity(wrapper)) {
        return wrapper.entity;
      }
    }
    return null;
  };
  public querySelectorAll = (selector: string) => {
    // Special case selectors get optimized
    if (selector === '*') {
      return this.getEntities();
    } else if (selector === 'player') {
      return this.getPlayers();
    }
    const testSelector = new ParsedSelector(selector + '');
    const result: GameEntity[] = [];
    for (let i = 0; i < this.entities.length; ++i) {
      const wrapper = this.entities[i];
      if (testSelector.testEntity(wrapper)) {
        result.push(wrapper.entity);
      }
    }
    return result;
  };
  public testSelector = (selector: string, entity: any) => {
    const testSelector = new ParsedSelector(selector + '');
    const wrapper = this.wrapperIndex.get(entity);
    if (!wrapper) {
      return false;
    }
    return testSelector.testEntity(wrapper);
  };

  public getEntityWrapper(entity: GameEntity) {
    return this.wrapperIndex.get(entity);
  }

  public playSoundEntity = (
    data: number,
    spec:
      | string
      | { sample: string; pitch?: number; gain?: number; radius?: number },
  ) => {
    if (typeof spec === 'string') {
      return this.playSound(spec, { type: 'entity', data }, 1, 1, 32);
    } else if (typeof spec === 'object') {
      const sample = '' + spec.sample;
      const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
      const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
      const radius = 'radius' in spec ? +(spec.radius || 0) : 32;
      return this.playSound(
        sample,
        { type: 'entity', data },
        gain,
        pitch,
        radius,
      );
    } else {
      throw new Error('invalid arguments entity.sound()');
    }
  };

  public playSoundPlayer = (
    data: number,
    spec: string | { sample: string; pitch?: number; gain?: number },
  ) => {
    if (typeof spec === 'string') {
      return this.playSound(spec, { type: 'player', data }, 1, 1, 0);
    } else if (typeof spec === 'object') {
      const sample = '' + spec.sample;
      const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
      const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
      return this.playSound(sample, { type: 'player', data }, gain, pitch, 0);
    } else {
      throw new Error('invalid arguments entity.sound()');
    }
  };

  private _createEntity(id: number) {
    this.perf.entitiesCreated++;
    const wrapper = new ScriptEntityWrapper(
      id,
      () => this.destroyEntity(id),
      (damage: number, options?: Partial<GameHurtOptions>) => {
        const entity = this.entityIndex.get(id);
        if (entity) {
          this.hurtEntity(
            entity,
            (options &&
              options.attacker &&
              WRAPPER_INDEX.get(options.attacker)) ||
              null,
            +damage,
            ((options && options.damageType) || '') + '',
          );
        }
      },
      (message: string, options?: { duration?: number; hideFloat?: boolean }) =>
        this.sendChat(id, 0, message, options),
      (
        spec:
          | string
          | { sample: string; gain?: number; radius?: number; pitch?: number },
      ) => this.playSoundEntity(id, spec),
      this.physicsSelectors,
      this.animations.createAnimationGroup(id, <any>null),
      this.playerAnimations.createAnimationGroup(id, <any>null),
      this.motions.createMotionGroup(id, <any>null),
    );
    this.entities.push(wrapper);
    this.entityIndex.set(id, wrapper);
    this.wrapperIndex.set(wrapper.entity, wrapper);
    this.physicsSelectors.notifyDirty();
    return wrapper;
  }
  public createEntity = (spec: Partial<GameEntityConfig>) => {
    if (this.entityCount - this.playerCount >= this.config.entityLimit) {
      console.error('entity limit exceeded');
      return null;
    }
    this.entityCount += 1;
    const id = (++this.entityCounter << 1) + 1;
    const wrapper = this._createEntity(id);

    // copy tags
    const prevTags = wrapper.entity.tags;
    coerceEntityConfig(spec, wrapper.entity);
    const nextTags: string[] = wrapper.entity.tags as any;
    if (Array.isArray(nextTags)) {
      wrapper.entity.tags = prevTags;
      nextTags.forEach((t) => wrapper.entity.addTag(t));
    }

    this.physicsSelectors.notifyDirty();

    this.pendingCreate.push(id);
    this.notifyEntityCreate(wrapper);
    return wrapper.entity;
  };

  private getEntities() {
    const result: GameEntity[] = [];
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];
      if (!e.destroyed) {
        result.push(e.entity);
      }
    }
    return result;
  }

  private getPlayers() {
    const result: (GameEntity & { isPlayer: true; player: GamePlayer })[] = [];
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];
      if (!e.destroyed && e.isPlayer) {
        result.push(<any>e.entity);
      }
    }
    return result;
  }

  public destroyEntity(id: number) {
    const wrapper = this.entityIndex.get(id);
    if (
      wrapper &&
      !wrapper.isPlayer &&
      !wrapper.destroyed &&
      !wrapper.pendingDestroy
    ) {
      wrapper.pendingDestroy = true;
      this.entityCount -= 1;
      this.pendingDelete.push(id);
    }
  }

  // Called at start of tick, synchronize entity state with all components
  private _createdEntities: ScriptEntityWrapper[] = [];
  private _preTickSyncEntitySet(entities: number[]) {
    // initially set deleted flag on all entities
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];
      e.destroyed = true;
      this.entityIndex.set(e.id, e);
    }

    // next loop over entities, add newly created entities to pending list
    let needsSort = false;
    this._createdEntities.length = 0;
    for (let i = 0; i < entities.length; ++i) {
      const id = entities[i];
      const e = this.entityIndex.get(id);
      if (e) {
        e.destroyed = false;
      } else {
        needsSort = true;
        this._createdEntities.push(this._createEntity(id));
      }
    }

    // sort entities by id, compact array
    if (needsSort) {
      this.entities.sort(compareId);
    }

    // finally process the entity destroy flag
    let ptr = 0;
    this.entityIndex.clear();
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];
      if (e.destroyed) {
        this.perf.entitiesDestroyed++;
        e.entity.destroyed = true;
        this.wrapperIndex.delete(e.entity);
        e.destroyWrapper('entity destroyed', this.scheduler);
        this.physicsSelectors.notifyDirty();
        this.notifyEntityDestroy(e);
      } else {
        this.entityIndex.set(e.id, e);
        this.entities[ptr++] = e;
      }
    }
    this.entities.length = ptr;
  }

  private _preTickComponentSparse<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
    setComponent: (entity: GameEntity, present: boolean) => void,
  ) {
    const entities = this.entities;
    let eptr = 0;
    let cptr = 0;
    while (eptr < entities.length && cptr < component.length) {
      const e = entities[eptr];
      const c = component[cptr];
      if (e.id < c.id) {
        eptr++;
        setComponent(e.entity, false);
      } else if (c.id < e.id) {
        cptr++;
      } else {
        setComponent(e.entity, true);
        synchronizer.preTick(e.entity, c, this.resources);
        eptr++;
        cptr++;
      }
    }
    while (eptr < entities.length) {
      const e = entities[eptr++];
      setComponent(e.entity, false);
    }
  }

  private _preTickComponentDense<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
  ) {
    const index = this.entityIndex;
    const resources = this.resources;
    for (let i = 0; i < component.length; ++i) {
      const c = component[i];
      const e = index.get(c.id);
      if (e) {
        synchronizer.preTick(e.entity, c, resources);
      }
    }
  }

  private _preTickComponent<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
  ) {
    if (synchronizer.setComponent) {
      this._preTickComponentSparse(
        synchronizer,
        component,
        synchronizer.setComponent,
      );
    } else {
      this._preTickComponentDense(synchronizer, component);
    }
  }

  private _preTickServerPlayerBinding(players: ServerPlayer[]) {
    const index = this.entityIndex;
    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const userId = player.userId;
      const wrapper = index.get(player.id);
      if (!wrapper || wrapper.destroyed) {
        continue;
      }

      const entity = wrapper.entity;
      if (!entity.player) {
        wrapper.playerAnimations.target = entity.player = new GamePlayer(
          (message: string) => this.sendChat(0, wrapper.id, message),
          wrapper.onChat.channel,
          wrapper.onChat.future,
          wrapper.onPress.channel,
          wrapper.onPress.future,
          wrapper.onRelease.channel,
          wrapper.onRelease.future,
          wrapper.onRespawn.channel,
          wrapper.onRespawn.future,
          () => {
            this.forceRespawn(wrapper);
          },
          (params: GameDialogParams) => <any>this.handleDialog(wrapper, params),
          () => this.cancelDialogs(wrapper),
          (
            href: string,
            options?: { isConfirm?: boolean; isNewTab?: boolean },
          ) => {
            this.openLink(wrapper, '' + href, options);
          },
          wrapper.listWearables,
          wrapper.addWearable,
          wrapper.removeWearable,
          (skinName: unknown) =>
            wrapper.setSkinByName(skinName, this.resources),
          () => wrapper.resetToDefaultSkin(this.resources),
          wrapper.clearSkin,
          (spec: string | { sample: string; pitch?: number; gain?: number }) =>
            this.playSoundPlayer(wrapper.id, spec),
          wrapper.playerAnimations.animate,
          wrapper.playerAnimations.getAnimations,
          () => this.kick(wrapper.id),
          (value) => this.setCameraPitch(wrapper.id, value),
          (value) => this.setCameraYaw(wrapper.id, value),
          (content: PostMessageScriptType) =>
            this.postMessage(wrapper, content),
          (type, listener) => this.addEventListener(wrapper, type, listener),
          wrapper.onKeyDown.channel,
          wrapper.onKeyUp.channel,
        );
        WRAPPER_PLAYER_INDEX.set(entity.player, wrapper);
      }

      // set player flags
      wrapper.isPlayer = true;
      entity.isPlayer = true;

      // tick player server binding
      PlayerServerBinding.preTick(entity.player, player, this.resources);
    }
  }

  private _pretickPlayerComponent<
    T,
    Component extends TaggedId & T,
    Schema extends MuSchema<T>,
  >(
    synchronizer: ScriptSynchronizer<GamePlayer, Schema>,
    component: Component[],
  ) {
    const resources = this.resources;
    const index = this.entityIndex;
    for (let i = 0; i < component.length; ++i) {
      const c = component[i];
      const wrapper = index.get(c.id);
      if (wrapper && !wrapper.destroyed) {
        const p = wrapper.entity.player;
        if (p) {
          synchronizer.preTick(p, c, resources);
        }
      }
    }
  }

  private _preTickPlayer(state: ScriptStateSnapshot) {
    // tick server players (special case)
    this._preTickServerPlayerBinding(state.serverPlayers);

    // tick other player components
    this._pretickPlayerComponent(PlayerBinding, state.net.players);
    this._pretickPlayerComponent(PlayerDisplayBinding, state.players);
    this._pretickPlayerComponent(PlayerInputBinding, state.net.playerInputs);
    this._pretickPlayerComponent(PlayerReplicaBinding, state.playerReplicas);
    this._pretickPlayerComponent(PlayerSoundBinding, state.sound.player);
  }

  public preTick(state: ScriptStateSnapshot) {
    // Synchronize entity set
    this._preTickSyncEntitySet(state.entities);

    // Update entity counters
    if (state.entities.length > 0 || this.entities.length > 0) {
      this.entityCounter = Math.max(
        this.entityCounter,
        this.entities[this.entities.length - 1].id >> 1,
        state.entities[state.entities.length - 1] >> 1,
      );
    }
    this.entityCounter = Math.max(this.entityCounter, state.entityCounter);

    // Then synchronize tick components
    // 通过body的position计算entity的position依赖于model的meshId数据
    // 需要先执行model的preTick再执行body的preTick，二者顺序不可调换
    this._preTickComponent(ModelBinding, state.models);
    this._preTickComponent(RigidBodyBinding, state.net.bodies);
    this._preTickComponent(DamageBinding, state.damage);
    this._preTickComponent(ContactBinding, state.contact);
    this._preTickComponent(ParticleBinding, state.particles);
    this._preTickComponent(InteractBinding, state.interact);
    this._preTickComponent(EntityNameBinding, state.entityName);
    this._preTickComponent(SoundBinding, state.sound.entity);

    // Synchronize player components
    this._preTickPlayer(state);

    // Notify of newly created entities *after* all components are sync'd
    this._createdEntities.forEach(this.notifyEntityCreate);
    this._createdEntities.length = 0;

    // update entity and player counters
    this.entityCount = this.playerCount = 0;
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];
      this.entityCount += 1;
      if (e.isPlayer) {
        this.playerCount += 1;
      }
    }

    // pretick animations
    this.animations.preTick(state.tick);
    this.playerAnimations.preTick(state.tick);
    this.motions.preTick(state.tick);
  }

  private _postTickComponentSparse<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
    patch: ScriptSyncPatch[],
    remove: number[],
    hasComponent: (
      entity: GameEntity,
      resources: ScriptResourceSync,
    ) => boolean,
  ) {
    const entities = this.entities;
    const resources = this.resources;
    let eptr = 0;
    let cptr = 0;
    while (eptr < entities.length && cptr < component.length) {
      const e = entities[eptr];
      const c = component[cptr];
      if (e.id < c.id) {
        if (hasComponent(e.entity, resources)) {
          const delta =
            synchronizer.postTick(
              e.entity,
              synchronizer.engineSchema.identity,
              resources,
            ) || synchronizer.clone(synchronizer.identity);
          delta.id = e.id;
          patch.push(delta);
        }
        eptr++;
      } else if (c.id < e.id) {
        remove.push(e.id);
        cptr++;
      } else {
        if (hasComponent(e.entity, resources)) {
          const delta = synchronizer.postTick(e.entity, c, resources);
          if (delta) {
            delta.id = e.id;
            patch.push(delta);
          }
        } else {
          remove.push(e.id);
        }
        eptr++;
        cptr++;
      }
    }
    while (eptr < entities.length) {
      const e = entities[eptr++];
      if (hasComponent(e.entity, resources)) {
        const delta =
          synchronizer.postTick(
            e.entity,
            synchronizer.engineSchema.identity,
            resources,
          ) || synchronizer.clone(synchronizer.identity);
        delta.id = e.id;
        patch.push(delta);
      }
    }
  }

  private _postTickComponentDense<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
    patch: ScriptSyncPatch[],
  ) {
    const entities = this.entities;
    const resources = this.resources;
    let eptr = 0;
    let cptr = 0;
    while (eptr < entities.length && cptr < component.length) {
      const e = entities[eptr];
      const c = component[cptr];
      if (c.id === e.id) {
        const delta = synchronizer.postTick(e.entity, c, resources);
        if (delta) {
          delta.id = e.id;
          patch.push(delta);
        }
        eptr++;
        cptr++;
      } else if (e.id < c.id) {
        const delta =
          synchronizer.postTick(
            e.entity,
            synchronizer.engineSchema.identity,
            resources,
          ) || synchronizer.clone(synchronizer.identity);
        delta.id = e.id;
        patch.push(delta);
        eptr++;
      } else {
        // should never happen
        cptr++;
      }
    }
    while (eptr < entities.length) {
      const e = entities[eptr++];
      const delta =
        synchronizer.postTick(
          e.entity,
          synchronizer.engineSchema.identity,
          resources,
        ) || synchronizer.clone(synchronizer.identity);
      delta.id = e.id;
      patch.push(delta);
    }
  }

  // Compute output patch
  private _postTickComponent<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GameEntity, Schema>,
    component: Component[],
    patch: ScriptSyncPatch[],
    remove: number[],
  ) {
    if (synchronizer.hasComponent) {
      this._postTickComponentSparse(
        synchronizer,
        component,
        patch,
        remove,
        synchronizer.hasComponent,
      );
    } else {
      this._postTickComponentDense(synchronizer, component, patch);
    }
  }

  private _postTickPlayerComponent<
    Component extends TaggedId,
    Schema extends MuSchema<Component>,
  >(
    synchronizer: ScriptSynchronizer<GamePlayer, Schema>,
    component: Component[],
    patch: ScriptSyncPatch[],
  ) {
    // clear patch buffer
    patch.length = 0;

    // compute deltas and append to patch
    for (let i = 0; i < component.length; ++i) {
      const c = component[i];
      const entity = this.entityIndex.get(c.id);
      if (entity && entity.entity.player) {
        const delta = synchronizer.postTick(
          entity.entity.player,
          c,
          this.resources,
        );
        if (delta) {
          delta.id = c.id;
          patch.push(delta);
        }
      }
    }
  }

  public postTick(packet: ScriptPostTick, state: ScriptStateSnapshot) {
    this.perf.entitiesLive = this.entities.length;

    const update = packet.entityUpdates;

    // swap created set
    const tmpCreated = this.pendingCreate;
    this.pendingCreate = update.createdEntities;
    update.createdEntities = tmpCreated;
    this.pendingCreate.length = 0;

    // canonicalize created entity list
    if (tmpCreated.length > 0) {
      tmpCreated.sort(compareNum);
    }

    // swap deleted set
    const tmpDeleted = this.pendingDelete;
    this.pendingDelete = update.deletedEntities;
    update.deletedEntities = tmpDeleted;
    this.pendingDelete.length = 0;

    // canonicalize deleted entity list
    if (tmpDeleted.length > 0) {
      // sort tmpDeleted
      tmpDeleted.sort(compareNum);

      // remove duplicates from deleted list
      let ptr = 1;
      for (let i = 1; i < tmpDeleted.length; ++i) {
        if (tmpDeleted[i - 1] !== tmpDeleted[i]) {
          tmpDeleted[ptr++] = tmpDeleted[i];
        }
      }
      tmpDeleted.length = ptr;
    }

    // update collision filter
    this.physicsSelectors.update(this.entities);

    // update wearables and entity collision filter stuff
    update.wearableUpdates.length = 0;
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i];

      if (e.isPlayer) {
        this.perf.playersLive++;
      }

      // update wearable state
      if (e.pollWearables(this.resources)) {
        update.wearableUpdates.push(
          ScriptWearableUpdateSchema.clone(e.wearableState),
        );
      }
    }

    // Compute patches for each component independently
    this._postTickComponent(
      RigidBodyBinding,
      state.net.bodies,
      update.bodies,
      [],
    );
    this._postTickComponent(
      DamageBinding,
      state.damage,
      update.damage,
      update.deletedDamage,
    );
    this._postTickComponent(
      ModelBinding,
      state.models,
      update.models,
      update.deletedModels,
    );
    this._postTickComponent(
      ParticleBinding,
      state.particles,
      update.particles,
      update.deletedParticles,
    );
    this._postTickComponent(
      InteractBinding,
      state.interact,
      update.interactive,
      update.deletedInteractive,
    );
    this._postTickComponent(
      EntityNameBinding,
      state.entityName,
      update.entityName,
      update.deletedEntityName,
    );
    this._postTickComponent(
      SoundBinding,
      state.sound.entity,
      update.sound,
      update.deletedSound,
    );
    this._postTickPlayerComponent(
      PlayerBinding,
      state.net.players,
      update.players,
    );
    this._postTickPlayerComponent(
      PlayerDisplayBinding,
      state.players,
      update.playerDisplay,
    );
    this._postTickPlayerComponent(
      PlayerServerBinding,
      state.serverPlayers,
      update.serverPlayer,
    );
    this._postTickPlayerComponent(
      PlayerSoundBinding,
      state.sound.player,
      update.playerSound,
    );
    this._postTickPlayerComponent(
      <any>PlayerReplicaBinding,
      state.playerReplicas,
      update.playerReplicas,
    );

    // send collision filter update if needed
    if (this.physicsSelectors.indexDirty) {
      update.needsCollisionFilterUpdate = true;
      CollisionFilterSchema.assign(
        update.collisionFilter,
        this.physicsSelectors.filter,
      );
    } else {
      update.needsCollisionFilterUpdate = false;
      CollisionFilterSchema.assign(
        update.collisionFilter,
        CollisionFilterSchema.identity,
      );
    }

    this.animations.postTick(packet.animations.entity);
    this.playerAnimations.postTick(packet.animations.player);
  }
}
