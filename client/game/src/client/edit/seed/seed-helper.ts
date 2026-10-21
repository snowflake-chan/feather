import { ClientStateType } from '../edit-schema';
import { LightQueryMask } from 'src/engine/voxel/light-schema';
import { GameClientState } from 'src/engine/game-client-schema';
import { vec3, mat4, vec4 } from 'gl-matrix';
import {
  getRenderableGLTF,
  getRenderableMesh,
  getRenderableTexture,
} from 'src/engine/mesh/controller';

import {
  ClientLocalEmitterSchema,
  ClientLocalEmitterSet,
  ClientParticlePendingSeedIds,
} from 'src/engine/particle/particle-client-state';
import {
  updateLocalEmitters,
  updateParticlePendingList,
} from 'src/engine/particle/particle-client-controller';
import { packColor } from '@box/schema/particle/particle-schema';
import { AssetType } from '@box/schema/project/project-rda';
import { Renderable } from 'src/engine/mesh/renderable-schema';
import { seedsDataController } from 'src/views/edit/components/stage-area/seedsData';
import { computeEntitySeedRenderBox } from 'src/views/edit/components/transformHandler/util';
import { renderBoxFromRenderable } from 'src/engine/seed/util';

export function seedHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export function seedLightmapId(seedId: string) {
  return (seedHash(seedId) << LightQueryMask.SHIFT) + LightQueryMask.SEED;
}

const SCALE_VEC = vec3.create();

const mvToOrigin = mat4.create();
const mvBack = mat4.create();

export function computeSeedData(
  state: ClientStateType,
  gameState: GameClientState,
  id: string,
  hash: string,
  assetType: AssetType,
) {
  const entitiesTree = state.replica.project.entitiesTree;
  const entity = entitiesTree[id]?.value;
  if (!entity) {
    return null;
  }

  const color = vec4.fromValues(1, 1, 1, entity.tint[3] / 255);

  SCALE_VEC[0] = entity.scale[0];
  SCALE_VEC[1] = entity.scale[1];
  SCALE_VEC[2] = entity.scale[2];

  if (assetType === AssetType.IMAGE) {
    const textureRenderable = getRenderableTexture(gameState, hash);
    if (!textureRenderable) {
      return null;
    }
    entity.bounds[0] = textureRenderable.width;
    entity.bounds[1] = textureRenderable.height;
    entity.bounds[2] = 0;
    return {
      model: mat4.fromRotationTranslationScale(
        mat4.create(),
        entity.orientation,
        entity.position,
        SCALE_VEC,
      ),
      color,
      glRef: textureRenderable,
      lightmapId: seedLightmapId(id),
    };
  }

  const meshRenderable = getRenderableMesh(gameState, hash);
  if (!meshRenderable) {
    return null;
  }

  mat4.identity(mvToOrigin);
  mat4.identity(mvBack);

  // 从mesh中获取锚点
  mat4.translate(mvToOrigin, mvToOrigin, [
    -0.5 * (meshRenderable.lox + meshRenderable.hix) +
      meshRenderable.renderBoxOffset[0],
    -0.5 * (meshRenderable.loy + meshRenderable.hiy) +
      meshRenderable.renderBoxOffset[1],
    -0.5 * (meshRenderable.loz + meshRenderable.hiz) +
      meshRenderable.renderBoxOffset[2],
  ]);

  mat4.translate(mvBack, mvBack, [
    entity.position[0],
    entity.position[1],
    entity.position[2],
  ]);

  const model = mat4.fromRotationTranslationScale(
    mat4.create(),
    entity.orientation,
    [0, 0, 0],
    SCALE_VEC,
  );
  mat4.mul(model, model, mvToOrigin);
  mat4.mul(model, mvBack, model);
  return {
    model,
    color,
    glRef: meshRenderable,
    lightmapId: seedLightmapId(id),
  };
}

/**
 * 非运行时，在tick中同步pending的粒子状态
 */
export function tickPendingSeedDisplay(
  state: ClientStateType,
  gameState: GameClientState,
) {
  if (gameState.particles.pendingSeedIds.length === 0) {
    return;
  }

  syncSeedDisplay(state, gameState);
}

/**
 * 编辑模式同步粒子展示效果
 * @param state 编辑状态
 * @param gameState 引擎状态
 * @param ids 指定生成粒子的seedId，不传入（onProjectChange）时，做全量同步；传入时，仅同步指定id（在tick处理pending时）
 */
export function syncSeedDisplay(
  state: ClientStateType,
  gameState: GameClientState,
) {
  const seedParticles = ClientLocalEmitterSet.alloc();
  const entitiesTree = state.replica.project.entitiesTree;

  const pendingList = ClientParticlePendingSeedIds.alloc();
  pendingList.length = 0;

  Object.keys(entitiesTree).forEach((id) => {
    const seed = entitiesTree[id]?.value;
    if (!seed) {
      return;
    }
    if (
      seed.particle.rate + seed.particle.rateSpread <= 0 ||
      seed.particle.lifetime + seed.particle.lifetimeSpread <= 0 ||
      seed.particle.limit <= 0
    ) {
      return;
    }

    const asset = seedsDataController.getAssetByMesh(seed.mesh);

    const bounds: vec3 = [0, 0, 0];

    // 如果有asset，检测是否加载完成
    if (asset) {
      const renderable = assetToRenderable(gameState, seed.mesh);

      // 没有加载完成，推入pending
      if (!renderable) {
        if (!pendingList.includes(id)) {
          pendingList.push(id);
        }

        return;
      }

      renderBoxFromRenderable(
        {
          bounds,
          offset: [0, 0, 0],
        },
        renderable,
      );
    }

    const particle = ClientLocalEmitterSchema.alloc();

    particle.id = seedHash(id) >>> 2;

    // 粒子的展示依赖外观框的位置和尺寸（原始尺寸）
    const { position } = computeEntitySeedRenderBox(gameState, seed);

    particle.position[0] = position[0];
    particle.position[1] = position[1];
    particle.position[2] = position[2];

    particle.bounds[0] = bounds[0] / 32;
    particle.bounds[1] = bounds[1] / 32;
    particle.bounds[2] = bounds[2] / 32;

    particle.lifetime = seed.particle.lifetime;
    particle.lifetimeSpread = seed.particle.lifetimeSpread;

    particle.emitRate = seed.particle.rate;
    particle.emitSpread = seed.particle.rateSpread;

    particle.color0 = packColor(seed.particle.color0);
    particle.color1 = packColor(seed.particle.color1);
    particle.color2 = packColor(seed.particle.color2);
    particle.color3 = packColor(seed.particle.color3);
    particle.color4 = packColor(seed.particle.color4);

    particle.size0 = seed.particle.size0;
    particle.size1 = seed.particle.size1;
    particle.size2 = seed.particle.size2;
    particle.size3 = seed.particle.size3;
    particle.size4 = seed.particle.size4;

    particle.damping = seed.particle.damping;
    particle.countLimit = seed.particle.limit;
    particle.sizeSpread = seed.particle.sizeSpread;

    vec3.set(
      particle.velocity,
      seed.particle.velocity.x,
      seed.particle.velocity.y,
      seed.particle.velocity.z,
    );
    vec3.set(
      particle.velocitySpread,
      seed.particle.velocitySpread.x,
      seed.particle.velocitySpread.y,
      seed.particle.velocitySpread.z,
    );
    vec3.set(
      particle.acceleration,
      seed.particle.acceleration.x,
      seed.particle.acceleration.y,
      seed.particle.acceleration.z,
    );
    particle.noiseAmpl = seed.particle.noiseAmpl;
    particle.noiseFreq = seed.particle.noiseFreq;

    seedParticles.push(particle);
  });

  updateLocalEmitters(gameState, seedParticles);
  updateParticlePendingList(gameState, pendingList);

  ClientLocalEmitterSet.free(seedParticles);

  ClientParticlePendingSeedIds.free(pendingList);
}

/**
 * 根据mesh资源名查找到可渲染实例
 */
export function assetToRenderable(
  gameState: GameClientState,
  mesh: string,
): Renderable | null {
  const asset = seedsDataController.getAssetByMesh(mesh);

  if (!asset) {
    return null;
  }

  switch (asset.type) {
    case AssetType.IMAGE:
      return getRenderableTexture(gameState, asset.hash);
    case AssetType.GLTF_MODEL:
      return getRenderableGLTF(gameState, asset.hash);
    default:
      return getRenderableMesh(gameState, asset.hash);
  }
}
