import {
  GameEntity,
  GamePlayer,
  GamePlayerMoveState,
  GamePlayerWalkState,
  GameEntityContact,
  GameVoxelContact,
  GameFluidContact,
  GameAssetType,
  GameInputDirection,
} from '@box/schema/api/js/api';
import {
  RigidBody,
  RigidBodySchema,
  RigidBodyFlags,
  ContactRecord,
  ContactRecordSchema,
} from '@box/schema/physics/physics-schema';
import {
  BindingFactory,
  constant,
  ENTITY_INDEX,
  WRAPPER_INDEX,
  safePropExpr,
  safeReadNumExpr,
} from './binding-factory';
import { ScriptSynchronizer, Binding } from './synchronizer';
import {
  NetModelSchema,
  NetModel,
  NetModelMotionSchema,
  MotionsPlaybackSchema,
} from '@box/schema/mesh/model-schema';
import { mat4, quat, vec3 } from 'gl-matrix';
import {
  Player,
  PlayerSchema,
  PlayerFlags,
  PlayerDisplay,
  PlayerSkinInvisibleSchema,
  PlayerDisplaySchema,
  PlayerDisplayFlags,
  PlayerInputSchema,
  PlayerFlyState,
  PlayerJumpState,
  PlayerInput,
  PlayerWalkState,
  PlayerButtonState,
  InputDirectionState,
} from '@box/schema/player/player-schema';
import {
  GamePrivateReplica,
  GamePrivateReplicaSchema,
} from '@box/schema/replica/game-private-replica';
import {
  MuUint16,
  MuUint8,
  MuUint32,
  MuFloat64,
  MuSchema,
  MuVoid,
  MuVarint,
  MuASCII,
  MuBoolean,
  MuStruct,
} from '@box/mudb/schema';
import { calcPlayerLookDirection } from '@box/schema/player/player-move';
import {
  ServerPlayer,
  ServerPlayerSchema,
} from '../../player/player-server-schema';
import {
  CameraMode,
  CameraFreezedAxis,
} from '@box/schema/camera/camera-schema';
import { Damage, DamageSchema } from '@box/schema/damage/damage-schema';
import {
  GameVector3,
  GameRGBColor,
  GameRGBAColor,
} from '@box/schema/api/js/math';
import { ServerParticleEntitySchema } from '../../particle/particle-server-state';
import {
  InteractComponent,
  InteractComponentSchema,
} from '@box/schema/interact/interact-protocol';
import {
  EntityNameComponent,
  EntityNameComponentSchema,
} from '@box/schema/entity-name/entity-name';
import {
  ServerEntitySoundEffect,
  ServerEntitySoundEffectSchema,
  ServerPlayerEntitySoundEffect,
  ServerPlayerSoundEffectSchema,
} from '../../sound/server-sound-state';
import {
  MIN_MASS,
  MAX_MASS,
  MAX_VELOCITY,
  MIN_RADIUS,
  MAX_RADIUS,
} from '@box/schema/physics/physics-solve';
import * as GameURL from '@box/schema/api/js/url';
import { Vec3Schema } from '@box/schema/utils/math-schema';

const TMP = vec3.create();

export function unpackAxis(axis: number) {
  switch (axis) {
    case -1:
      return new GameVector3(-1, 0, 0);
    case 1:
      return new GameVector3(1, 0, 0);
    case -2:
      return new GameVector3(0, -1, 0);
    case 2:
      return new GameVector3(0, 1, 0);
    case -3:
      return new GameVector3(0, 0, -1);
    case 3:
      return new GameVector3(0, 0, 1);
  }
  return new GameVector3(0, 0, 0);
}

enum InputDirectionMap {
  none,
  vertical,
  horizontal,
  both,
}

const bindBody = new BindingFactory<GameEntity, RigidBody>();
export const RigidBodyBinding = new ScriptSynchronizer(
  'body',
  RigidBodySchema,
  [
    bindBody.num('mass', 'mass', MIN_MASS, MAX_MASS),
    bindBody.num('friction', 'friction', 0, 512),
    bindBody.num('restitution', 'restitution', 0, 1),
    bindBody.propQuat('meshOrientation', ['qx', 'qy', 'qz', 'qw']),
    bindPositionBodies(),
    bindBody.propVec3(
      'velocity',
      ['vx', 'vy', 'vz'],
      -MAX_VELOCITY,
      MAX_VELOCITY,
    ),
    bindBody.propVec3('bounds', ['rx', 'ry', 'rz'], MIN_RADIUS, MAX_RADIUS),

    bindBody.bit('fixed', 'flags', RigidBodyFlags.FIXED),
    bindBody.bit('collides', 'flags', RigidBodyFlags.COLLIDES),
    bindBody.bit('gravity', 'flags', RigidBodyFlags.GRAVITY),

    // collision group
    {
      name: 'group',
      schema: new MuVarint(),

      checkPostTick: (script, engine) => {
        const wrapper = WRAPPER_INDEX.get(script);
        if (!wrapper) {
          return false;
        }
        const g = wrapper.collisionGroup;
        if (!g) {
          return false;
        }
        return g.id !== engine.group;
      },

      deltaPostTick: (script: GameEntity) => {
        const wrapper = WRAPPER_INDEX.get(script);
        if (!wrapper) {
          return 0;
        }
        const g = wrapper.collisionGroup;
        if (!g) {
          return 0;
        }
        return g.id;
      },

      emitSynchronize: (block, engineTok, patchTok) => {
        block.push(`${safePropExpr(engineTok, 'group')} = ${patchTok};`);
      },
    },
  ],
  null,
  null,
);

export const ContactBinding = new ScriptSynchronizer<
  GameEntity,
  typeof ContactRecordSchema
>(
  'contacts',
  ContactRecordSchema,
  [
    {
      name: 'body contacts',

      schema: new MuVoid(),

      preTick: (script, engine) => {
        let fTotalX = 0;
        let fTotalY = 0;
        let fTotalZ = 0;

        {
          // body contacts
          if (!Array.isArray(script.entityContacts)) {
            script.entityContacts = [];
          }
          const outContacts = script.entityContacts;
          let ptr = 0;
          const contacts = engine.body;
          for (let i = 0; i < contacts.length; ++i) {
            const c = contacts[i];
            const { fx, fy, fz, nx, ny, nz } = c;
            fTotalX += fx;
            fTotalY += fy;
            fTotalZ += fz;
            const other = ENTITY_INDEX.get(c.otherId);
            if (other && !other.destroyed) {
              if (ptr >= outContacts.length) {
                outContacts.push(
                  new GameEntityContact(
                    other.entity,
                    new GameVector3(fx, fy, fz),
                    new GameVector3(nx, ny, nz),
                  ),
                );
              } else {
                const out = outContacts[ptr];
                if (out instanceof GameEntityContact) {
                  out.other = other.entity;
                  out.force.set(fx, fy, fz);
                  if (out.axis instanceof GameVector3) {
                    out.axis.x = nx;
                    out.axis.y = ny;
                    out.axis.z = nz;
                  } else {
                    out.axis = new GameVector3(nx, ny, nz);
                  }
                } else {
                  outContacts[ptr] = new GameEntityContact(
                    other.entity,
                    new GameVector3(fx, fy, fz),
                    new GameVector3(nx, ny, nz),
                  );
                }
              }
              ptr++;
            }
          }
          outContacts.length = ptr;
        }

        {
          // voxel contacts
          if (!Array.isArray(script.voxelContacts)) {
            script.voxelContacts = [];
          }
          const outContacts = script.voxelContacts;
          let ptr = 0;
          const contacts = engine.voxel;
          for (let i = 0; i < contacts.length; ++i) {
            const c = contacts[i];
            const { fx, fy, fz } = c;
            fTotalX += fx;
            fTotalY += fy;
            fTotalZ += fz;
            if (ptr >= outContacts.length) {
              const axis = new GameVector3(0, 0, 0);
              axis[Math.abs(c.axis) - 1] = c.axis < 0 ? -1 : 1;
              outContacts.push(
                new GameVoxelContact(
                  c.x,
                  c.y,
                  c.z,
                  c.b,
                  new GameVector3(fx, fy, fz),
                  axis,
                ),
              );
            } else {
              const out = outContacts[ptr];
              if (out instanceof GameVoxelContact) {
                out.x = c.x;
                out.y = c.y;
                out.z = c.z;
                out.voxel = c.b;
                out.axis.set(0, 0, 0);
                out.axis[Math.abs(c.axis) - 1] = c.axis < 0 ? -1 : 1;
                out.force.set(fx, fy, fz);
              } else {
                const axis = new GameVector3(0, 0, 0);
                axis[Math.abs(c.axis) - 1] = c.axis < 0 ? -1 : 1;
                outContacts[ptr] = new GameVoxelContact(
                  c.x,
                  c.y,
                  c.z,
                  c.b,
                  new GameVector3(fx, fy, fz),
                  axis,
                );
              }
            }
            ptr++;
          }
          outContacts.length = ptr;
        }

        {
          // fluid contacts
          if (!Array.isArray(script.fluidContacts)) {
            script.fluidContacts = [];
          }
          const outContacts = script.fluidContacts;
          let ptr = 0;
          const voxels = engine.fluidVoxels;
          const volume = engine.fluidVolumeFraction;
          for (let i = 0; i < voxels.length; ++i) {
            if (ptr >= outContacts.length) {
              outContacts.push(new GameFluidContact(voxels[i], volume[i]));
            } else {
              const out = outContacts[ptr];
              if (out instanceof GameFluidContact) {
                out.volume = volume[i];
                out.voxel = voxels[i];
              } else {
                outContacts[ptr] = new GameFluidContact(voxels[i], volume[i]);
              }
            }
            ptr++;
          }
          outContacts.length = ptr;
        }

        if (script.contactForce instanceof GameVector3) {
          script.contactForce.x = fTotalX;
          script.contactForce.y = fTotalY;
          script.contactForce.z = fTotalZ;
        } else {
          script.contactForce = new GameVector3(fTotalX, fTotalY, fTotalZ);
        }
      },
    },
  ],
  null,
  (x, v) => {
    if (!v) {
      if (x.voxelContacts) {
        x.voxelContacts.length = 0;
      } else {
        x.voxelContacts = [];
      }
      if (x.fluidContacts) {
        x.fluidContacts.length = 0;
      } else {
        x.fluidContacts = [];
      }
      if (x.entityContacts) {
        x.entityContacts.length = 0;
      } else {
        x.entityContacts = [];
      }
      if (x.contactForce) {
        x.contactForce.x = x.contactForce.y = x.contactForce.z = 0;
      } else {
        x.contactForce = new GameVector3(0, 0, 0);
      }
    }
  },
);

const bindDamage = new BindingFactory<GameEntity, Damage>();
export const DamageBinding = new ScriptSynchronizer(
  'damage',
  DamageSchema,
  [
    bindDamage.bool('showHealthBar', 'showHealthBar'),
    bindDamage.num('hp', 'hp'),
    bindDamage.num('maxHp', 'maxHp'),
  ],
  (x) => !!x.enableDamage,
  (x, v) => {
    x.enableDamage = v;
  },
);

const bindModel = new BindingFactory<GameEntity, NetModel>();
function bindColorComponent(
  prop: 'red' | 'green' | 'blue' | 'alpha',
): Binding<GameEntity, NetModel, MuSchema<number>> {
  const prefix = prop.charAt(0);
  const index = {
    red: 0,
    green: 1,
    blue: 2,
    alpha: 3,
  }[prop];
  return {
    name: `mesh color ${prop}`,

    schema: new MuUint8(255),

    emitPreTick: (block, scriptObj, engineObj) => {
      const colorProp = safePropExpr(scriptObj, 'meshColor');
      if (prop === 'red') {
        const rgbaCtor = block.inject(GameRGBAColor);
        block.push(`
                    if(${colorProp} instanceof ${rgbaCtor}) {
                        ${colorProp}.r = ${engineObj}.red / 255;
                    } else {
                        ${colorProp} = new ${rgbaCtor}(${engineObj}.red / 255, 1, 1, 1);
                    }`);
      } else {
        block.push(
          `${safePropExpr(colorProp, prefix)} = ${safePropExpr(
            engineObj,
            prop,
          )} / 255;`,
        );
      }
    },

    emitPostTick: (
      check,
      _0,
      scriptObj,
      engineObj,
      _1,
      checkFlag,
      patchVar,
    ) => {
      const meshColor = safePropExpr(scriptObj, 'meshColor');
      check.push(`
                if (Array.isArray(${meshColor})) {
                    ${patchVar} = (255 * ${safeReadNumExpr(
        safePropExpr(meshColor, index),
        0,
        1,
      )}) >>> 0;
                } else if (typeof ${meshColor} === 'object') {
                    ${patchVar} = (255 * ${safeReadNumExpr(
        safePropExpr(meshColor, prefix),
        0,
        1,
      )}) >>> 0;
                } else if (typeof ${meshColor} === 'number') {
                    ${patchVar} = (${safePropExpr(meshColor, prefix)} >>> ${
        index * 8
      }) & 0xff;
                } else {
                    ${patchVar} = 255;
                }
                ${checkFlag} = ${patchVar} !== ${safePropExpr(
        engineObj,
        prop,
      )};`);
    },

    emitSynchronize: (block, engineObj, patchVar) => {
      block.push(`${safePropExpr(engineObj, prop)} = ${patchVar};`);
    },
  };
}

function bindPositionBodies(): Binding<
  GameEntity,
  RigidBody,
  typeof Vec3Schema
> {
  return {
    name: 'position',
    schema: Vec3Schema,
    preTick(script, engine, resources) {
      const wrapper = WRAPPER_INDEX.get(script);
      if (!wrapper) {
        return;
      }
      const { entity } = wrapper;

      if (entity.isPlayer) {
        entity.position.x = engine.px;
        entity.position.y = engine.py;
        entity.position.z = engine.pz;
        return;
      }

      const offset = resources.getRigidBodyOffset(entity.mesh);
      if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
        entity.position.x = engine.px;
        entity.position.y = engine.py;
        entity.position.z = engine.pz;
        return;
      }

      const { px, py, pz } = wrapper.applyTransform(
        -offset[0],
        -offset[1],
        -offset[2],
      );

      entity.position.x = px + engine.px;
      entity.position.y = py + engine.py;
      entity.position.z = pz + engine.pz;
    },
    checkPostTick(script, engine, resources) {
      const { x, y, z } = script.position;

      if (script.isPlayer) {
        return x !== engine.px || y !== engine.py || z !== engine.pz;
      }

      const offset = resources.getRigidBodyOffset(script.mesh);
      if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
        return x !== engine.px || y !== engine.py || z !== engine.pz;
      }
      return true;
    },
    deltaPostTick(script, engine, resources) {
      const patch = Vec3Schema.alloc();

      const wrapper = WRAPPER_INDEX.get(script);
      if (!wrapper) {
        patch[0] = 0;
        patch[1] = 0;
        patch[2] = 0;
        return patch;
      }
      const { entity } = wrapper;

      if (entity.isPlayer) {
        patch[0] = entity.position.x;
        patch[1] = entity.position.y;
        patch[2] = entity.position.z;
        return patch;
      }

      const offset = resources.getRigidBodyOffset(entity.mesh);
      if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
        patch[0] = entity.position.x;
        patch[1] = entity.position.y;
        patch[2] = entity.position.z;
        return patch;
      }

      const { px, py, pz } = wrapper.applyTransform(
        offset[0],
        offset[1],
        offset[2],
      );

      patch[0] = px + entity.position.x;
      patch[1] = py + entity.position.y;
      patch[2] = pz + entity.position.z;

      return patch;
    },
    synchronize(engine, patch) {
      engine.px = patch[0];
      engine.py = patch[1];
      engine.pz = patch[2];
    },
  };
}

export const ModelBinding = new ScriptSynchronizer(
  'mesh',
  NetModelSchema,
  [
    bindModel.mesh('mesh', 'meshId'),
    bindModel.propVec3('meshScale', ['scaleX', 'scaleY', 'scaleZ']),
    bindModel.propVec3('meshOffset', ['offsetX', 'offsetY', 'offsetZ']),
    bindModel.bool('meshInvisible', 'invisible'),
    {
      name: 'mesh anchor offset',
      schema: NetModelMotionSchema,
      preTick: (script, engine, resources) => {
        const wrapper = WRAPPER_INDEX.get(script);
        if (!wrapper) {
          return;
        }
        const renderBoxOffset = resources.getRenderBoxOffset(
          wrapper.entity.mesh,
        );

        if (!renderBoxOffset) {
          wrapper.entity.anchorOffset.x = 0;
          wrapper.entity.anchorOffset.y = 0;
          wrapper.entity.anchorOffset.z = 0;

          return;
        }

        wrapper.entity.anchorOffset.x = -renderBoxOffset[0];
        wrapper.entity.anchorOffset.y = -renderBoxOffset[1];
        wrapper.entity.anchorOffset.z = -renderBoxOffset[2];
      },
    },

    // data model for mesh components is dumb, so we do this janky shit - mik's fault
    bindColorComponent('red'),
    bindColorComponent('green'),
    bindColorComponent('blue'),
    bindColorComponent('alpha'),

    bindModel.num('meshEmissive', 'emissive', 0, 1),
    bindModel.num('meshShininess', 'shininess', 0, 1),
    bindModel.num('meshMetalness', 'metalness', 0, 1),

    {
      name: 'mesh motion',
      schema: NetModelMotionSchema,
      preTick: (script, engine) => {
        const wrapper = WRAPPER_INDEX.get(script);
        if (!wrapper || wrapper.motion.paused) {
          return;
        }
        wrapper.motion.defaultMotionId = engine.motion.defaultMotionId;
      },
      checkPostTick: (script) => {
        const wrapper = WRAPPER_INDEX.get(script);
        if (!wrapper) {
          return false;
        }
        return true;
      },
      deltaPostTick: (script) => {
        const wrapper = WRAPPER_INDEX.get(script);
        const identity = NetModelMotionSchema.clone(
          NetModelMotionSchema.identity,
        );
        if (!wrapper) {
          return identity;
        }
        const patch = identity;
        patch.paused = wrapper.motion.paused;
        patch.pausedTick = wrapper.motion.pausedTick;
        const motionData = wrapper.motion.pausedSnapshot || wrapper.motion;
        patch.defaultMotionId = motionData.defaultMotionId;
        patch.startTick = motionData.defaultStartTick;
        if (motionData.targetMotion) {
          const { data } = motionData.targetMotion;
          patch.playback.motions = MotionsPlaybackSchema.fromJSON(data.motions);
          patch.playback.startTick = data.startTick;
          patch.playback.cycleCount = data.cycleCount;
        }
        return patch;
      },
      synchronize: (engine, patch: typeof NetModelMotionSchema.identity) => {
        NetModelMotionSchema.assign(engine.motion, patch);
      },
    },
  ],
  (x) => {
    if (!x.mesh) {
      const wrapper = WRAPPER_INDEX.get(x);
      if (wrapper && wrapper.animations.flags.mesh) {
        return true;
      }
      return false;
    }
    return true;
  },
  (x, v) => {
    if (!v) {
      x.mesh = '';
    }
  },
);

const bindSound = new BindingFactory<GameEntity, ServerEntitySoundEffect>();
export const SoundBinding = new ScriptSynchronizer(
  'sound',
  ServerEntitySoundEffectSchema,
  [
    bindSound.sound('chatSound', 'chat'),
    bindSound.sound('dieSound', 'die'),
    bindSound.sound('hurtSound', 'hurt'),
    bindSound.sound('interactSound', 'interact'),
  ],
  (x, resources) =>
    !!resources.resolveAsset(x.chatSound.sample, GameAssetType.SOUND) ||
    !!resources.resolveAsset(x.dieSound.sample, GameAssetType.SOUND) ||
    !!resources.resolveAsset(x.hurtSound.sample, GameAssetType.SOUND) ||
    !!resources.resolveAsset(x.interactSound.sample, GameAssetType.SOUND),
  null,
);

const bindPlayer = new BindingFactory<GamePlayer, Player>();
export const PlayerBinding = new ScriptSynchronizer(
  'player',
  PlayerSchema,
  [
    bindPlayer.bit('canFly', 'flags', PlayerFlags.ALLOW_FLIGHT),
    bindPlayer.bit('spectator', 'flags', PlayerFlags.SPECTATOR),
    bindPlayer.bit('enableAction0', 'flags', PlayerFlags.ALLOW_ACTION_0),
    bindPlayer.bit('enableAction1', 'flags', PlayerFlags.ALLOW_ACTION_1),
    bindPlayer.bit('enableJump', 'flags', PlayerFlags.ALLOW_JUMP),
    bindPlayer.bit('enableDoubleJump', 'flags', PlayerFlags.ALLOW_DOUBLE_JUMP),
    bindPlayer.bit('enableCrouch', 'flags', PlayerFlags.ALLOW_CROUCH),

    bindPlayer.num('walkSpeed', 'walkSpeed'),
    bindPlayer.num('walkAcceleration', 'walkAcceleration'),
    bindPlayer.num('runSpeed', 'runSpeed'),
    bindPlayer.num('runAcceleration', 'runAcceleration'),
    bindPlayer.num('crouchSpeed', 'crouchSpeed'),
    bindPlayer.num('crouchAcceleration', 'crouchAcceleration'),
    bindPlayer.num('swimSpeed', 'swimSpeed'),
    bindPlayer.num('swimAcceleration', 'swimAcceleration'),
    bindPlayer.num('flySpeed', 'flySpeed'),
    bindPlayer.num('flyAcceleration', 'flyAcceleration'),
    bindPlayer.num('jumpSpeedFactor', 'jumpSpeedFactor'),
    bindPlayer.num('jumpAccelerationFactor', 'jumpAccelerationFactor'),
    bindPlayer.num('jumpPower', 'jumpPower'),
    bindPlayer.num('doubleJumpPower', 'doubleJumpPower'),
    {
      name: `freezed forward direction`,

      schema: new MuUint16(),

      preTick: (script, engine) => {
        const angle = engine.freezedForwardAngle;
        if (angle === 0) {
          script.freezedForwardDirection = null;
        } else {
          // To ensure that the angle of 1/16 circle is accurate
          // Math.floor((65536 - 1) / 16) * 16 = 65520
          const pitch = (2 * Math.PI * (angle - 1)) / 65520;
          script.facingDirection.x = -Math.cos(pitch);
          script.facingDirection.y = 0;
          script.facingDirection.z = -Math.sin(pitch);
        }
      },
      checkPostTick: (script, engine) => {
        const { freezedForwardDirection } = script;
        let angle = 0;
        if (freezedForwardDirection) {
          angle =
            1 +
            (Math.round(
              65520 +
                (65520 *
                  Math.atan2(
                    freezedForwardDirection.z,
                    freezedForwardDirection.x,
                  )) /
                  (2 * Math.PI),
            ) %
              65520);
        }
        return angle !== engine.freezedForwardAngle;
      },
      deltaPostTick: (script) => {
        const { freezedForwardDirection } = script;
        let angle = 0;
        if (freezedForwardDirection) {
          angle =
            1 +
            (Math.round(
              65520 +
                (65520 *
                  Math.atan2(
                    freezedForwardDirection.z,
                    freezedForwardDirection.x,
                  )) /
                  (2 * Math.PI),
            ) %
              65520);
        }
        return angle;
      },
      synchronize: (engine, patch) => {
        engine.freezedForwardAngle = patch;
      },
    },
    {
      name: 'input direction state',

      schema: new MuUint8(),

      preTick: (script, engine) => {
        script.swapInputDirection = !!(
          engine.inputDirectionState & InputDirectionState.SWAP_DIRECTION
        );
        script.reverseInputDirection = InputDirectionMap[
          (engine.inputDirectionState >> 1) & 3
        ] as GameInputDirection;
        script.disableInputDirection = InputDirectionMap[
          (engine.inputDirectionState >> 3) & 3
        ] as GameInputDirection;
      },
      checkPostTick: (script, engine) => {
        const state =
          (script.swapInputDirection ? 1 : 0) |
          (InputDirectionMap[script.reverseInputDirection] << 1) |
          (InputDirectionMap[script.disableInputDirection] << 3);
        return state !== engine.inputDirectionState;
      },
      deltaPostTick: (script) => {
        const state =
          (script.swapInputDirection ? 1 : 0) |
          (InputDirectionMap[script.reverseInputDirection] << 1) |
          (InputDirectionMap[script.disableInputDirection] << 3);
        return state;
      },
      synchronize: (engine, patch) => {
        engine.inputDirectionState = patch;
      },
    },
  ],
  null,
  null,
);

// State replicated to client from server per-player
const bindPlayerReplica = new BindingFactory<GamePlayer, GamePrivateReplica>();
export const PlayerReplicaBinding = new ScriptSynchronizer(
  'private_replica',
  GamePrivateReplicaSchema,
  [
    bindPlayerReplica.asset('colorLUT', 'colorLUT', GameAssetType.COLOR_LUT),
    bindPlayerReplica.bool('enable3DCursor', 'enableCursor'),
    ...bindPlayerReplica.nestEngine('camera', (gen) => {
      return [
        gen.enum('cameraMode', 'mode', {
          fps: CameraMode.FPS,
          follow: CameraMode.FOLLOW,
          fixed: CameraMode.FIXED,
          relative: CameraMode.RELATIVE,
        }),
        gen.enum('cameraFreezedAxis', 'freezedAxis', {
          '': CameraFreezedAxis.NONE,
          'x': CameraFreezedAxis.X,
          'y': CameraFreezedAxis.Y,
          'z': CameraFreezedAxis.Z,
          'xy': CameraFreezedAxis.X | CameraFreezedAxis.Y,
          'yx': CameraFreezedAxis.X | CameraFreezedAxis.Y,
          'xz': CameraFreezedAxis.X | CameraFreezedAxis.Z,
          'zx': CameraFreezedAxis.X | CameraFreezedAxis.Z,
          'yz': CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'zy': CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'xyz':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'xzy':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'yxz':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'yzx':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'zxy':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
          'zyx':
            CameraFreezedAxis.X | CameraFreezedAxis.Y | CameraFreezedAxis.Z,
        }),
        gen.num('cameraFovY', 'fovY'),
        gen.num('cameraDistance', 'distance'),
        gen.vec3('cameraUp', 'up'),
        gen.vec3('cameraTarget', 'target'),
        gen.vec3('cameraPosition', 'eye'),
        gen.entity('cameraEntity', 'targetId'),
      ];
    }),
    bindPlayerReplica.gamepad('gamepad', 'gamepad', GameAssetType.PICTURE),
  ],
  null,
  null,
);

// State broadcast to all clients from server for each player
const bindPlayerDisplay = new BindingFactory<GamePlayer, PlayerDisplay>();
export const PlayerDisplayBinding = new ScriptSynchronizer(
  'player_display',
  PlayerDisplaySchema,
  [
    constant(bindPlayerDisplay.str('name', 'name')),
    bindPlayerDisplay.num('scale', 'scale', 0.001),
    bindPlayerDisplay.rgb('color', 'color'),
    bindPlayerDisplay.bit('invisible', 'flags', PlayerDisplayFlags.INVISIBLE),
    bindPlayerDisplay.bit('showName', 'flags', PlayerDisplayFlags.SHOW_NAME),
    bindPlayerDisplay.bit(
      'showIndicator',
      'flags',
      PlayerDisplayFlags.SHOW_INDICATOR,
    ),
    constant(bindPlayerDisplay.bit('dead', 'flags', PlayerDisplayFlags.DEAD)),
    bindPlayerDisplay.num('emissive', 'emissive', 0, 1),
    bindPlayerDisplay.num('shininess', 'shininess', 0, 1),
    bindPlayerDisplay.num('metalness', 'metalness', 0, 1),
    bindPlayerDisplay.schema(
      PlayerSkinInvisibleSchema,
      'skinInvisible',
      'skinInvisible',
    ),
    bindPlayerDisplay.skin('skin', 'mapSkin'),
  ],
  null,
  null,
);

// Input state sent from client to server per player
const bindPlayerInput = new BindingFactory<GamePlayer, PlayerInput>();
export const PlayerInputBinding = new ScriptSynchronizer(
  'player_input',
  PlayerInputSchema,
  [
    {
      name: 'player move state',

      schema: new MuUint32(),

      preTick: (script, engine) => {
        const state = engine.state;

        // update movestate
        if (state & PlayerFlyState.FLYING) {
          script.moveState = GamePlayerMoveState.FLYING;
        } else {
          switch (state & PlayerJumpState.MASK) {
            case PlayerJumpState.GROUND:
              script.moveState = GamePlayerMoveState.GROUND;
              break;
            case PlayerJumpState.FALL:
              script.moveState = GamePlayerMoveState.FALL;
              break;
            case PlayerJumpState.JUMP:
              script.moveState = GamePlayerMoveState.JUMP;
              break;
            case PlayerJumpState.DOUBLE_JUMP:
              script.moveState = GamePlayerMoveState.DOUBLE_JUMP;
              break;
            case PlayerJumpState.SWIM:
              script.moveState = GamePlayerMoveState.SWIM;
              break;
          }
        }

        // update walk state
        switch (state & PlayerWalkState.MASK) {
          case PlayerWalkState.CROUCH:
            script.walkState = GamePlayerWalkState.CROUCH;
            break;
          case PlayerWalkState.WALK:
            if (state & PlayerButtonState.WALK) {
              script.walkState = GamePlayerWalkState.WALK;
            } else {
              script.walkState = GamePlayerWalkState.NONE;
            }
            break;
          case PlayerWalkState.RUN:
            script.walkState = GamePlayerWalkState.RUN;
            break;
          default:
            script.walkState = GamePlayerWalkState.NONE;
        }
      },
    },

    bindPlayerInput.bit('walkButton', 'state', PlayerButtonState.WALK),
    bindPlayerInput.bit('crouchButton', 'state', PlayerButtonState.CROUCH),
    bindPlayerInput.bit('jumpButton', 'state', PlayerButtonState.JUMP),
    bindPlayerInput.bit('action0Button', 'state', PlayerButtonState.ACTION_0),
    bindPlayerInput.bit('action1Button', 'state', PlayerButtonState.ACTION_1),

    // Look direction
    {
      name: 'look dir',

      schema: new MuUint16(),

      preTick: (script, engine) => {
        const angle = engine.angle;
        calcPlayerLookDirection(TMP, angle);
        script.facingDirection.x = TMP[0];
        script.facingDirection.y = TMP[1];
        script.facingDirection.z = TMP[2];
      },
    },
    {
      name: 'camera pitch',
      schema: new MuUint8(),
      preTick: (script, engine) => {
        script.cameraPitch = (engine.pitch / 255) * Math.PI - Math.PI / 2;
      },
    },
    {
      name: 'camera yaw',

      schema: new MuUint8(),

      preTick: (script, engine) => {
        script.cameraYaw = (2 * Math.PI * engine.cameraAngle) / 256;
      },
    },
  ],
  null,
  null,
);

function unboxVec3(out: vec3, inp: any) {
  if (typeof inp === 'object') {
    if (Array.isArray(inp)) {
      out[0] = +inp[0] || 0;
      out[1] = +inp[1] || 0;
      out[2] = +inp[2] || 0;
    } else {
      out[0] = +inp.x || 0;
      out[1] = +inp.y || 1;
      out[2] = +inp.z || 2;
    }
  }
}

// Private state stored on server for each player
const bindPlayerServer = new BindingFactory<GamePlayer, ServerPlayer>();
export const PlayerServerBinding = new ScriptSynchronizer(
  'server_player',
  ServerPlayerSchema,
  [
    constant(bindPlayerServer.str('userId', 'userId')),
    constant(bindPlayerServer.str('boxId', 'boxId')),
    constant(bindPlayerServer.str('userKey', 'userKey')),
    constant(bindPlayerServer.str('avatar', 'avatar')),
    {
      name: 'url',
      schema: new MuASCII(),
      preTick: (script, engine) => {
        if (!script.url) {
          script.url = new GameURL.URL(engine.url);
        }
      },
    },
    // TODO: 禁言功能暂时无用，未来可期
    // bindPlayerServer.bool('muted', 'muted'),
    bindPlayerServer.vec3('spawnPoint', 'birthPoint'),
    bindPlayerServer.bounds('movementBounds', 'movementBounds'),
  ],
  null,
  null,
);

// particle binding
const bindParticle = new BindingFactory<
  GameEntity,
  typeof ServerParticleEntitySchema.identity
>();

function unitTo8Bit(x: number) {
  return (255 * Math.max(0, Math.min(1, x))) >>> 0;
}

function createParticleColorBinding(
  idx: number,
): Binding<
  GameEntity,
  typeof ServerParticleEntitySchema.identity,
  MuSchema<number>
> {
  const colorProp = `color${idx}`;
  return {
    name: 'particle color ' + idx,

    schema: new MuUint32(0xffffffff),

    emitPreTick: (block, scriptObj, engineObj) => {
      const particleArray = scriptObj + '.particleColor';
      const colorCtor = block.inject(GameRGBColor);
      if (idx === 0) {
        block.push(`
                    if (!Array.isArray(${particleArray})) {
                        ${particleArray} = [
                            new ${colorCtor}(1, 1, 1),
                            new ${colorCtor}(1, 1, 1),
                            new ${colorCtor}(1, 1, 1),
                            new ${colorCtor}(1, 1, 1),
                            new ${colorCtor}(1, 1, 1) ];
                    }
                    if (${particleArray}.length > 5) {
                        ${particleArray}.length = 5;
                    }
                    while (${particleArray}.length < 5) {
                        ${particleArray}.push(new ${colorCtor}(1, 1, 1));
                    }`);
      }

      const particleRef = block.def();
      const engineVal = block.def();
      const scale = block.def();
      const red = block.def();
      const green = block.def();
      const blue = block.def();

      block.push(`
                ${engineVal} = ${safePropExpr(engineObj, colorProp)};
                ${scale} = (${engineVal} >>> 24) + 1;
                ${red} = ${scale} * (${engineVal} & 0xff) / 0xff;
                ${green} = ${scale} * (${engineVal} & 0xff00) / 0xff00;
                ${blue} = ${scale} * (${engineVal} & 0xff0000) / 0xff0000;
                ${particleRef} = ${particleArray}[${idx}];
                if (${particleRef} instanceof ${colorCtor}) {
                    ${particleArray}[${idx}] = new ${colorCtor}(${red}, ${green}, ${blue});
                } else {
                    ${particleRef}.r = ${red};
                    ${particleRef}.g = ${green};
                    ${particleRef}.b = ${blue};
                }`);
    },

    emitPostTick: (
      check,
      delta,
      scriptObj,
      engineObj,
      _,
      checkFlag,
      patchVar,
    ) => {
      const r = check.def();
      const g = check.def();
      const b = check.def();
      const c = check.def();
      const intensity = check.def();
      const to8Bit = check.inject(unitTo8Bit);

      check.push(`
                ${r} = 1;
                ${g} = 1;
                ${b} = 1;
                ${c} = ${scriptObj}.particleColor;
                if (Array.isArray(${c})) {
                    ${c} = ${c}[${idx}];
                }
                if (typeof ${c} === 'number') {
                    ${r} = (${c} & 0xff) / 0xff;
                    ${g} = (${c} & 0xff00) / 0xff00;
                    ${b} = (${c} & 0xff0000) / 0xff0000;
                } else if (Array.isArray(${c})) {
                    ${r} = ${safeReadNumExpr(safePropExpr(c, 0), 0, 65025)};
                    ${g} = ${safeReadNumExpr(safePropExpr(c, 1), 0, 65025)};
                    ${b} = ${safeReadNumExpr(safePropExpr(c, 2), 0, 65025)};
                } else if (typeof ${c} === 'object') {
                    ${r} = ${safeReadNumExpr(safePropExpr(c, 'r'), 0, 65025)};
                    ${g} = ${safeReadNumExpr(safePropExpr(c, 'g'), 0, 65025)};
                    ${b} = ${safeReadNumExpr(safePropExpr(c, 'b'), 0, 65025)};
                }
                ${intensity} = Math.max(1, Math.min(256, Math.ceil(Math.max(${r}, ${g}, ${b})))) || 1;
                ${r} = ${to8Bit}(${r} / ${intensity});
                ${g} = ${to8Bit}(${g} / ${intensity});
                ${b} = ${to8Bit}(${b} / ${intensity});
                ${patchVar} = (${r} | (${g} << 8) | (${b} << 16) | ((${intensity} - 1) << 24));
                ${checkFlag} = ${patchVar} !== ${safePropExpr(
        engineObj,
        colorProp,
      )};`);
    },

    emitSynchronize: (block, engineObj, patchVar) => {
      block.push(`${safePropExpr(engineObj, colorProp)} = ${patchVar};`);
    },
  };
}

function createParticleSizeBinding(
  idx: number,
): Binding<
  GameEntity,
  typeof ServerParticleEntitySchema.identity,
  MuSchema<number>
> {
  const sizeProp = `size${idx}`;
  return {
    name: 'particle size ' + idx,

    schema: new MuFloat64(1),

    emitPreTick: (block, scriptObj, engineObj) => {
      const sizeArray = safePropExpr(scriptObj, 'particleSize');
      if (idx === 0) {
        block.push(`
                    if (!Array.isArray(${sizeArray})) {
                        ${sizeArray} = [ 1, 1, 1, 1, 1 ];
                    }
                    ${sizeArray}.length = 5;`);
      }
      block.push(
        `${sizeArray}[${idx}] = ${safePropExpr(engineObj, sizeProp)};`,
      );
    },

    emitPostTick: (
      check,
      _0,
      scriptObj,
      engineObj,
      _1,
      checkFlag,
      patchVar,
    ) => {
      const sizeArray = safePropExpr(scriptObj, 'particleSize');
      check.push(`
                if (Array.isArray(${sizeArray})) {
                    ${patchVar} = ${safeReadNumExpr(
        safePropExpr(sizeArray, idx),
        0,
        1024,
      )};
                } else {
                    ${patchVar} = ${safeReadNumExpr(sizeArray, 0, 1024)};
                }
                ${checkFlag} = ${patchVar} !== ${safePropExpr(
        engineObj,
        sizeProp,
      )};`);
    },

    emitSynchronize: (block, engineObj, patchVar) => {
      block.push(`${safePropExpr(engineObj, sizeProp)} = ${patchVar};`);
    },
  };
}

export const ParticleBinding = new ScriptSynchronizer(
  'particles',
  ServerParticleEntitySchema,
  [
    {
      name: 'animated',
      schema: new MuBoolean(false),
      checkPostTick: (entity, component) => {
        const wrapper = WRAPPER_INDEX.get(entity);
        if (wrapper) {
          return !!wrapper.animations.flags.particle_mat !== component.animated;
        }
        return false;
      },
      deltaPostTick: (entity) => {
        const wrapper = WRAPPER_INDEX.get(entity);
        if (wrapper) {
          return !!wrapper.animations.flags.particle_mat;
        }
        return false;
      },
      synchronize: (component, patch) => {
        component.animated = patch;
      },
    },
    bindParticle.num('particleRate', 'emitRate'),
    bindParticle.num('particleRateSpread', 'emitSpread'),
    bindParticle.num('particleLimit', 'countLimit'),
    bindParticle.vec3('particleAcceleration', 'acceleration'),
    bindParticle.vec3('particleVelocity', 'velocity'),
    bindParticle.vec3('particleVelocitySpread', 'velocitySpread'),
    bindParticle.num('particleDamping', 'damping'),
    bindParticle.num('particleNoise', 'noiseAmpl'),
    bindParticle.num('particleNoiseFrequency', 'noiseFreq'),
    bindParticle.num('particleLifetime', 'lifetime'),
    bindParticle.num('particleLifetimeSpread', 'lifetimeSpread'),
    bindParticle.num('particleSizeSpread', 'sizeSpread'),
    bindParticle.num('particleTargetWeight', 'targetWeight'),
    bindParticle.entity('particleTarget', 'targetId'),
    createParticleColorBinding(0),
    createParticleColorBinding(1),
    createParticleColorBinding(2),
    createParticleColorBinding(3),
    createParticleColorBinding(4),
    createParticleSizeBinding(0),
    createParticleSizeBinding(1),
    createParticleSizeBinding(2),
    createParticleSizeBinding(3),
    createParticleSizeBinding(4),
  ],
  (x) => {
    if (x.particleLimit > 0 && x.particleRate + x.particleRateSpread > 0) {
      return true;
    }
    const wrapper = WRAPPER_INDEX.get(x);
    if (wrapper && wrapper.animations.flags.particles) {
      return true;
    }
    return false;
  },
  null,
);

const bindInteractive = new BindingFactory<GameEntity, InteractComponent>();
export const InteractBinding = new ScriptSynchronizer(
  'interact',
  InteractComponentSchema,
  [
    bindInteractive.str('interactHint', 'hint'),
    bindInteractive.num('interactRadius', 'radius'),
    bindInteractive.rgb('interactColor', 'color'),
  ],
  (x) => {
    return !!x.enableInteract;
  },
  null,
);

const bindEntityName = new BindingFactory<GameEntity, EntityNameComponent>();
export const EntityNameBinding = new ScriptSynchronizer(
  'entity_name',
  EntityNameComponentSchema,
  [
    bindEntityName.str('customName', 'name'),
    bindEntityName.num('nameRadius', 'radius'),
    bindEntityName.rgb('nameColor', 'color'),
  ],
  (x) => !!x.showEntityName,
  null,
);

const bindPlayerSound = new BindingFactory<
  GamePlayer,
  ServerPlayerEntitySoundEffect
>();
export const PlayerSoundBinding = new ScriptSynchronizer(
  'player_sound',
  ServerPlayerSoundEffectSchema,
  [
    bindPlayerSound.sound('action0Sound', 'action0'),
    bindPlayerSound.sound('action1Sound', 'action1'),
    bindPlayerSound.sound('crouchSound', 'crouch'),
    bindPlayerSound.sound('doubleJumpSound', 'doubleJump'),
    bindPlayerSound.sound('jumpSound', 'jump'),
    bindPlayerSound.sound('landSound', 'land'),
    bindPlayerSound.sound('spawnSound', 'spawn'),
    bindPlayerSound.sound('stepSound', 'step'),
    bindPlayerSound.sound('swimSound', 'swim'),
    bindPlayerSound.sound('enterWaterSound', 'enterWater'),
    bindPlayerSound.sound('leaveWaterSound', 'leaveWater'),
    bindPlayerSound.sound('startFlySound', 'startFly'),
    bindPlayerSound.sound('stopFlySound', 'endFly'),
    bindPlayerSound.sound('music', 'music'),
  ],
  null,
  null,
);
