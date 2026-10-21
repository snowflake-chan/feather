import { mat4, vec3, mat3, quat } from 'gl-matrix';

import { GLMeshInstanceList } from '../mesh/gl-controller/gl-mesh-schema';
import { MeshRenderable, SkinRenderable } from '../mesh/renderable-schema';
import { GameClientState } from '../game-client-schema';
import { pushGLMesh } from '../mesh/gl-controller/gl-mesh-controller';
import {
  getRenderableMesh,
  getMapSkinRenderable,
  getAvatarSkinRenderable,
  getRenderableGLTF,
} from '../mesh/controller';
import { testFrustumBox } from '../utils/frustum';
import { Frustum } from '@box/schema/utils/frustum-schema';
import { LightQueryMask } from '../voxel/light-schema';
import { RigidBody } from '@box/schema/physics/physics-schema';
import {
  PlayerDisplay,
  PlayerAttachment,
  MeshBound,
  PlayerSkinHash,
  BodyPart as BodyPartEnum,
} from '@box/schema/player/player-schema';
import { testChunkVisibility } from '../voxel/voxel-controller';
import { FrustumSchema } from '@box/schema/utils/frustum-schema';
import { IKState } from '@box/schema/animation/ik-schema';
import {
  GPUMeshInstanceList,
  GPUMeshInstanceListDict,
} from '../mesh/gpu-controller/gpu-mesh-schema';
import { pushGPUMesh } from '../mesh/gpu-controller/gpu-mesh-controller';
import { RenderBox } from '@box/schema/render-box/schema';
import { HashType } from '@box/schema/project/hot-schema';

function hurtFlash(phase: number) {
  const pf = phase * 3;
  const pr = pf - Math.floor(pf);
  return pr > 1 - phase ? 1 : 0;
}

const R = mat3.create();
const T = vec3.create();
const Q = quat.create();

function createBindMatrix(
  m: mat4,
  wearable: PlayerAttachment,
  b: MeshRenderable,
) {
  quat.normalize(Q, wearable.orientation);
  mat3.fromQuat(R, Q);
  m[0] = R[0];
  m[1] = R[1];
  m[2] = R[2];
  m[4] = R[3];
  m[5] = R[4];
  m[6] = R[5];
  m[8] = R[6];
  m[9] = R[7];
  m[10] = R[8];
  m[3] = m[7] = m[11] = m[12] = m[13] = m[14] = 0;
  m[15] = 1;

  // scale object
  const scale = wearable.scale;
  const sx = scale[0] / 16;
  const sy = scale[1] / 16;
  const sz = scale[2] / 16;
  m[0] *= sx;
  m[1] *= sx;
  m[2] *= sx;
  m[4] *= sy;
  m[5] *= sy;
  m[6] *= sy;
  m[8] *= sz;
  m[9] *= sz;
  m[10] *= sz;

  // object translation
  T[0] = -0.5 * (b.lox + b.hix);
  T[1] = -0.5 * (b.loy + b.hiy);
  T[2] = -0.5 * (b.loz + b.hiz);
  vec3.transformMat4(T, T, m);
  const offset = wearable.offset;
  m[12] = offset[0] + T[0];
  m[13] = offset[1] + T[1];
  m[14] = offset[2] + T[2];
}

function clearMeshBound(out: MeshBound) {
  vec3.set(out.lo, 0, 0, 0);
  vec3.set(out.hi, 0, 0, 0);
}

function applyBoundMatrix(out: MeshBound, part: MeshRenderable, matrix: mat4) {
  const lo: vec3 = [Infinity, Infinity, Infinity];
  const hi: vec3 = [-Infinity, -Infinity, -Infinity];
  const { hix, hiy, hiz, lox, loy, loz } = part;

  for (let i = 0; i < 8; i++) {
    const x = i & 1 ? hix : lox;
    const y = i & 2 ? hiy : loy;
    const z = i & 4 ? hiz : loz;
    vec3.transformMat4(T, vec3.set(T, x, y, z), matrix);

    vec3.min(lo, lo, T);
    vec3.max(hi, hi, T);
  }
  vec3.copy(out.lo, lo);
  vec3.copy(out.hi, hi);
}

type PassKey = 'gl' | 'gpu';

interface RenderMap {
  gl: GLMeshInstanceList;
  gpu: GPUMeshInstanceListDict;
}

interface PassMap {
  gl: GLMeshInstanceList;
  gpu: GPUMeshInstanceList;
}

export type PushMesh<K extends keyof PassMap> = (
  state: GameClientState,
  frustum: Frustum,
  pass: PassMap[K],
  id: number,
  model: mat4,
  part: MeshRenderable,
  red: number,
  green: number,
  blue: number,
  alpha: number,
  metalness: number,
  emissive: number,
  shiny: number,
  testFrustum: boolean,
) => boolean;

export function createRenderPlayerFn<K extends PassKey>(type: K) {
  const pushMesh: PushMesh<K> =
    type === 'gl' ? (pushGLMesh as PushMesh<K>) : (pushGPUMesh as PushMesh<K>);

  const poseMatrix = mat4.create();
  let red = 0;
  let green = 0;
  let blue = 0;
  let metalness = 0;
  let emissive = 0;
  let shininess = 0;

  function pushPart(
    state: GameClientState,
    frustum: Frustum,
    id: number,
    /**
     * 地图皮肤部件的hash值
     * 如果存在则优先解析，没有就解析平台皮肤部件
     */
    bodyPartHash: string | undefined,
    /**
     * 平台皮肤部件id
     */
    skinPartId: number,
    /**
     * 皮肤部件是否可见
     * 只对voxa皮肤和平台皮肤有作用
     */
    invisible: boolean,
    /**
     * 当前部件骨骼节点的位置
     */
    pose: mat4,
    /**
     * 皮肤附件，通过穿戴API添加
     */
    attachments: PlayerAttachment[],
    /**
     * 输出人物部件mesh顶点最小外接立方体数据
     */
    outMeshBound: MeshBound,
    /**
     * 非透明通道
     */
    pass: RenderMap[K],
    /**
     * 透明通道
     * - 透明通道为undefined时，皮肤只会进入非透明通道（pass）
     * - 透明通道有值时，会判断皮肤（voxa皮肤/平台皮肤）是否含透明部件
     *   如果含有透明部件，则会推入透明通道
     */
    transparentPass?: RenderMap[K],
  ) {
    let needsCheck = true;
    clearMeshBound(outMeshBound);

    if (!invisible) {
      // 生成SkinGLMesh
      // 优先解析地图皮肤部件
      // 如果没有再去解析平台分发的皮肤部件
      let skin: SkinRenderable | null = null;
      if (bodyPartHash !== undefined) {
        skin = getMapSkinRenderable(state, bodyPartHash);
      } else {
        skin = getAvatarSkinRenderable(state, skinPartId);
      }

      if (skin) {
        mat4.multiply(poseMatrix, pose, skin.bind);
        applyBoundMatrix(outMeshBound, skin.part, poseMatrix);

        let skinPass: RenderMap[K];

        // 如果传入透明通道，查找是否有透明部件
        if (!transparentPass) {
          skinPass = pass;
        } else {
          skinPass = skin.part.nodesInfo.some(({ alpha }) => alpha !== 1)
            ? transparentPass
            : pass;
        }

        let meshPass: PassMap[K];
        if (Array.isArray(skinPass)) {
          meshPass = skinPass;
        } else {
          if (!skinPass[skin.part.hash]) {
            skinPass[skin.part.hash] = [];
          }
          meshPass = skinPass[skin.part.hash] as PassMap[K];
        }

        if (
          !pushMesh(
            state,
            frustum,
            meshPass,
            id,
            poseMatrix,
            skin.part,
            red,
            green,
            blue,
            1,
            metalness,
            emissive,
            shininess,
            true,
          )
        ) {
          return;
        }
        needsCheck = false;
      }
    }

    // draw player mesh attachments
    for (let i = 0; i < attachments.length; ++i) {
      const attachment = attachments[i];
      const meshId = attachment.meshId;
      if (meshId < 0 || state.modelInfo.meshHashes.length <= meshId) {
        continue;
      }
      const meshInfo = state.modelInfo.meshHashes[meshId];
      const mesh =
        meshInfo.hashType === HashType.GLTF_MODEL
          ? getRenderableGLTF(state, meshInfo.hash)
          : getRenderableMesh(state, meshInfo.hash);
      if (!mesh) {
        continue;
      }

      let meshPass: PassMap[K];
      if (Array.isArray(pass)) {
        meshPass = pass;
      } else {
        if (!pass[meshInfo.hash]) {
          pass[meshInfo.hash] = [];
        }
        meshPass = pass[meshInfo.hash] as PassMap[K];
      }

      // construct bind matrix from attachment
      createBindMatrix(poseMatrix, attachment, mesh);
      mat4.multiply(poseMatrix, pose, poseMatrix);
      applyBoundMatrix(outMeshBound, mesh, poseMatrix);
      if (needsCheck) {
        if (
          !pushMesh(
            state,
            frustum,
            meshPass,
            id,
            poseMatrix,
            mesh,
            attachment.red,
            attachment.green,
            attachment.blue,
            1,
            attachment.metalness,
            attachment.emissive + emissive,
            attachment.shininess,
            true,
          )
        ) {
          return;
        }
        needsCheck = false;
      } else {
        pushMesh(
          state,
          frustum,
          meshPass,
          id,
          poseMatrix,
          mesh,
          attachment.red,
          attachment.green,
          attachment.blue,
          1,
          attachment.metalness,
          attachment.emissive + emissive,
          attachment.shininess,
          false,
        );
      }
    }
  }

  const partNames = Object.values(BodyPartEnum).filter(
    (value) => typeof value === 'string',
  );

  function renderPlayer(
    state: GameClientState,
    frustum: typeof FrustumSchema.identity,
    animation: IKState,
    player: PlayerDisplay,
    box: RenderBox,
    pass: RenderMap[K],
    transparentPass?: RenderMap[K],
  ) {
    const lox = box.px - box.rx;
    const loy = box.py - box.ry;
    const loz = box.pz - box.rz;
    const hix = box.px + box.rx;
    const hiy = box.py + box.ry;
    const hiz = box.pz + box.rz;
    if (
      testChunkVisibility(state, lox, loy, loz, hix, hiy, hiz) &&
      testFrustumBox(state.camera.frustum, lox, loy, loz, hix, hiy, hiz)
    ) {
      const skinHash: Partial<PlayerSkinHash> = {};

      partNames.forEach((partName) => {
        const mapSkinId = player.mapSkin[partName];
        if (mapSkinId) {
          skinHash[partName] =
            state.modelInfo.skinHashes[mapSkinId]?.parts[partName];
        }
      });

      const pose = animation.configuration;
      const meshBound = animation.meshBound;
      const avatarSkin = player.avatarSkin;
      const skinInvisible = player.skinInvisible;
      const idBase =
        (player.id << LightQueryMask.SHIFT) + LightQueryMask.PLAYER_BASE;
      red = player.color[0];
      green = player.color[1];
      blue = player.color[2];
      metalness = player.metalness;
      emissive = player.emissive + hurtFlash(animation.hurtFlash);
      shininess = player.shininess;
      const attachments = player.attachments;

      for (let i = 0; i < partNames.length; i++) {
        const partName = partNames[i];

        pushPart(
          state,
          frustum,
          idBase + i,
          skinHash[partName],
          avatarSkin[partName],
          skinInvisible[partName],
          pose[partName],
          attachments[partName],
          meshBound[partName],
          pass,
          transparentPass,
        );
      }
      return true;
    }
    return false;
  }

  return {
    renderPlayer,
  };
}
