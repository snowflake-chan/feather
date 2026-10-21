import { GameClientState } from '../game-client-schema';
import { ClientModelSchema, ClientModel } from './client-model-schema';
import { isGLMesh, isGPUMesh, TextureRenderable } from './renderable-schema';
import { getById } from '@box/utils/id';
import { mat4, vec3 } from 'gl-matrix';
import { setMotionTexture } from './gl-controller/gl-mesh-controller';
import {
  getRenderableGLTF,
  getRenderableMesh,
  getRenderableTexture,
} from './controller';
import { LightQueryMask } from '../voxel/light-schema';
import {
  ModelProtocol,
  NetSkinSchema,
  NetMeshTableEntrySchema,
} from '@box/schema/mesh/model-schema';
import { NetModelMotion } from '@box/schema/mesh/model-schema';
import { MuClientProtocol, MuClient } from '@box/mudb/client';
import { HurtEffect } from '../effect/effect-schema';
import { fromQuat } from './util';
import { HashType } from '@box/schema/project/hot-schema';
import { PlayerDisplay } from '@box/schema/player/player-schema';
import {
  parseDefaultMotion,
  ParsedPlayInfo,
  parsePlayback,
} from './parse/model-animation';
import { MeshRenderable } from './renderable-schema';
import { setMotionGroup } from './gpu-controller/gpu-mesh-controller';
import { testFrustumBox } from '../utils/frustum';

const HURT_FLASH_TIME = 4;
const HURT_FLASH_RATE = 7.5;
const HURT_STRETCH_SCALE = 0.95;
const HURT_STRETCH_FREQ = 9;
const HURT_SHAKE_SCALE = 10 / 16;

const T = vec3.create();

function hurtFlash(tick: number) {
  return 2 * tick * Math.abs(Math.sin(tick * HURT_FLASH_RATE));
}

function applyHurtFlash(models: ClientModel[], hurtFX: HurtEffect[]) {
  for (let i = 0; i < hurtFX.length; ++i) {
    const fx = hurtFX[i];
    const t = (HURT_FLASH_TIME - fx.tick) / HURT_FLASH_TIME;
    if (t < 0) {
      continue;
    }

    const m = getById(models, fx.entityId);
    if (m) {
      // 用户表示快闪出癫痫了，暂时关闭受伤闪光特效防眩晕
      // m.emissive += hurtFlash(fx.tick);

      const M = m.model;

      const shakeScale = HURT_SHAKE_SCALE * Math.pow(t, 2) * fx.scaledAmount;
      M[12] += (0.5 - Math.random()) * shakeScale;
      M[13] += (0.5 - Math.random()) * shakeScale;
      M[14] += (0.5 - Math.random()) * shakeScale;

      const stretch =
        HURT_STRETCH_SCALE *
        (t * Math.sin(t * HURT_STRETCH_FREQ)) *
        fx.scaledAmount;
      const sxz = 1 - stretch;
      const sy = 1 + stretch;
      M[0] *= sxz;
      M[1] *= sxz;
      M[2] *= sxz;
      M[4] *= sy;
      M[5] *= sy;
      M[6] *= sy;
      M[8] *= sxz;
      M[9] *= sxz;
      M[10] *= sxz;
    }
  }
}

function buildModelDrawList(state: GameClientState) {
  const meshTable = state.modelInfo.meshHashes;
  const cameraId = state.camera.fpsID;

  // clear previous models
  const transparentModels = state.transparentModels;
  const opaqueModels = state.opaqueModels;

  // components
  const models = state.replica.models;
  const boxes = state.renderBoxes;

  const players = state.playerInputs;
  const playerDisplays = state.replica.players;
  const playerIndex = state.playerIndex;

  // pointers
  let boxPtr = 0;
  let transparentPtr = 0;
  let opaquePtr = 0;

  for (let i = 0; i < models.length; ++i) {
    const model = models[i];
    const id = model.id;
    if (
      id === cameraId ||
      model.invisible ||
      model.alpha === 0 ||
      !model.meshId
    ) {
      continue;
    }

    const h = meshTable[model.meshId];
    if (!h) {
      continue;
    }

    let glRef: MeshRenderable | TextureRenderable | null = null;
    switch (h.hashType) {
      case HashType.IMAGE:
        glRef = getRenderableTexture(state, h.hash);
        break;
      case HashType.GLTF_MODEL:
        glRef = getRenderableGLTF(state, h.hash);
        break;
      default:
        glRef = getRenderableMesh(state, h.hash);
        break;
    }
    if (!glRef) {
      continue;
    }

    // walk box pointer
    while (boxPtr < boxes.length && boxes[boxPtr].id < id) {
      boxPtr++;
    }
    if (boxPtr >= boxes.length) {
      break;
    }
    const box = boxes[boxPtr];
    if (box.id !== id) {
      continue;
    }

    // get drawable from list
    let drawable: ClientModel;
    let parsedPlayInfo: ParsedPlayInfo | undefined;
    let meshIsTransparent = false;

    if (isGLMesh(glRef) || isGPUMesh(glRef)) {
      meshIsTransparent = glRef.staticIsTransparent;
      parsedPlayInfo = getParsedPlayInfo(state, glRef, model.motion);
      if (parsedPlayInfo) {
        meshIsTransparent = parsedPlayInfo.animation.isTransparent;
      }
    }

    // 整体透明/部分透明的物体在透明队列中渲染，全部不透明的物体在不透明队列中渲染
    if (model.alpha !== 255 || meshIsTransparent) {
      if (transparentPtr >= transparentModels.length) {
        transparentModels.push(ClientModelSchema.alloc());
      }
      drawable = transparentModels[transparentPtr++];
    } else {
      if (opaquePtr >= opaqueModels.length) {
        opaqueModels.push(ClientModelSchema.alloc());
      }
      drawable = opaqueModels[opaquePtr++];
    }

    // copy local drawing info
    drawable.id = id;
    drawable.glRef = glRef;
    drawable.lightmapId = (id << LightQueryMask.SHIFT) + LightQueryMask.ENTITY;
    drawable.color[0] = model.red * (1 / 255);
    drawable.color[1] = model.green * (1 / 255);
    drawable.color[2] = model.blue * (1 / 255);
    drawable.color[3] = model.alpha * (1 / 255);
    drawable.emissive = model.emissive;
    drawable.shininess = model.shininess;
    drawable.metalness = model.metalness;
    drawable.useMotionTexture = false;
    drawable.renderShadow = model.alpha === 255;
    drawable.staticShadow = model.staticShadow;

    // construct rotation matrix
    const m = drawable.model;
    fromQuat(m, box.qx, box.qy, box.qz, box.qw);

    const tx = model.offsetX;
    const ty = model.offsetY;
    const tz = model.offsetZ;

    const sx = model.scaleX;
    const sy = model.scaleY;
    const sz = model.scaleZ;

    if (isGLMesh(glRef) || isGPUMesh(glRef)) {
      T[0] = -0.5 * (glRef.lox + glRef.hix) + glRef.renderBoxOffset[0];
      T[1] = -0.5 * (glRef.loy + glRef.hiy) + glRef.renderBoxOffset[1];
      T[2] = -0.5 * (glRef.loz + glRef.hiz) + glRef.renderBoxOffset[2];

      if (
        parsedPlayInfo &&
        testFrustumBox(
          state.camera.frustum,
          box.px - box.rx,
          box.py - box.ry,
          box.pz - box.rz,
          box.px + box.rx,
          box.py + box.ry,
          box.pz + box.rz,
        )
      ) {
        drawable.useMotionTexture = true;
        if (isGLMesh(glRef)) {
          setMotionTexture(drawable, state, glRef, parsedPlayInfo);
        } else if (isGPUMesh(glRef)) {
          setMotionGroup(drawable, state, glRef, parsedPlayInfo);
        }
      }
    } else {
      T[0] = 0;
      T[1] = 0;
      T[2] = 0;
    }

    if (id in playerIndex) {
      const idx = playerIndex[id];
      const player = players[idx];
      mat4.rotateY(m, m, (-2 * Math.PI * player.angle) / 255);
      if (tx || ty || tz) {
        let playerDisplay: PlayerDisplay | null = null;
        if (idx < playerDisplays.length && playerDisplays[idx].id === id) {
          playerDisplay = playerDisplays[idx];
        } else {
          playerDisplay = getById(state.replica.players, model.id);
        }
        if (playerDisplay) {
          const s = playerDisplay.scale;
          T[0] += tx * s[0];
          T[1] += ty * s[1];
          T[2] += tz * s[2];
        }
      }
    } else {
      T[0] += tx;
      T[1] += ty;
      T[2] += tz;
    }

    // scale object
    m[0] *= sx;
    m[1] *= sx;
    m[2] *= sx;
    m[4] *= sy;
    m[5] *= sy;
    m[6] *= sy;
    m[8] *= sz;
    m[9] *= sz;
    m[10] *= sz;

    vec3.transformMat4(T, T, m);
    m[12] = T[0] + box.anchorX;
    m[13] = T[1] + box.anchorY;
    m[14] = T[2] + box.anchorZ;

    /**
     * GL多部件透明渲染兼容：
     * GL不使用OIT做透明渲染，纯靠透明物体的排序模拟透明颜色的叠加顺序
     * 当透明物体进入水地形(水地形即为透明物体)时无法透过透明物体
     * 当部件为多部件的时候，部分部件其实不是透明的但也遵循这个规则导致无法透过水地形
     *
     * 因此当为GL渲染时，整体为非透明但多部件中的部分部件透明时候，要在不透明的队列里多渲染一遍，
     */
    if (isGLMesh(glRef) && model.alpha === 255 && meshIsTransparent) {
      if (opaquePtr >= opaqueModels.length) {
        opaqueModels.push(ClientModelSchema.alloc());
      }
      ClientModelSchema.assign(opaqueModels[opaquePtr++], drawable);
    }
  }

  for (let i = transparentModels.length - 1; i >= transparentPtr; --i) {
    ClientModelSchema.free(transparentModels[i]);
  }
  transparentModels.length = transparentPtr;

  for (let i = opaqueModels.length - 1; i >= opaquePtr; --i) {
    ClientModelSchema.free(opaqueModels[i]);
  }
  opaqueModels.length = opaquePtr;
}

function getParsedPlayInfo(
  state: GameClientState,
  glMesh: MeshRenderable,
  modelMotion: NetModelMotion,
) {
  // 既没有动作链需要播放，也没有默认动作需要播放，展示静态模型
  if (!modelMotion.playback.motions.length && !modelMotion.defaultMotionId) {
    return;
  }
  let parsedPlayInfo = parsePlayback(state, glMesh, modelMotion);
  parsedPlayInfo =
    parsedPlayInfo ||
    parseDefaultMotion(glMesh, {
      id: modelMotion.defaultMotionId,
      startTick: modelMotion.startTick,
      currTick: modelMotion.paused ? modelMotion.pausedTick : state.clock.tick,
    });
  return parsedPlayInfo;
}

export function tickClientModels(state: GameClientState) {
  // build draw list
  buildModelDrawList(state);

  // apply hurt flash
  applyHurtFlash(state.opaqueModels, state.effects.hurt);
  applyHurtFlash(state.transparentModels, state.effects.hurt);
}

export class ModelClient {
  public protocol: MuClientProtocol<typeof ModelProtocol>;
  public state: GameClientState;

  constructor(spec: { client: MuClient; state: GameClientState }) {
    this.state = spec.state;
    this.protocol = spec.client.protocol(ModelProtocol);
    this.protocol.configure({
      message: {
        appendMeshHashes: (info) => {
          const table = this.state.modelInfo.meshHashes;
          for (let i = 0; i < info.length; ++i) {
            table.push(NetMeshTableEntrySchema.clone(info[i]));
          }
        },

        appendSkinHashes: (hashes) => {
          const table = this.state.modelInfo.skinHashes;
          for (let i = 0; i < hashes.length; ++i) {
            table.push(NetSkinSchema.clone(hashes[i]));
          }
        },

        appendSkinPartHashes: (hashes) => {
          const table = this.state.modelInfo.skinPartHashes;
          for (let i = 0; i < hashes.length; ++i) {
            table[hashes[i].id] = hashes[i].hash;
          }
        },
      },
    });
  }
}
