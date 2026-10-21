import { GameClientState } from '../game-client-schema';
import {
  GPUModelTextureInstanceList,
  GPUMeshInstanceList,
  GPUMeshInstanceListDict,
  GPUMeshMotionMatrix,
} from '../mesh/gpu-controller/gpu-mesh-schema';
import { UI3DSeedSpec, UI3DElement } from '../ui3d/ui3d-schema';
import {
  isGPUModelTexture,
  isGPUMesh,
  isGPUMotionMatrix,
} from '../mesh/renderable-schema';
import {
  pushGPUModelTexture,
  pushGPUMesh,
} from '../mesh/gpu-controller/gpu-mesh-controller';
import { Frustum } from '@box/schema/utils/frustum-schema';

export function drawSeedsForward(
  pass: GPUMeshInstanceListDict,
  motionPass: GPUMeshInstanceListDict,
  state: GameClientState,
  seedList: UI3DElement[],
  texture?: GPUModelTextureInstanceList,
) {
  const frustum = state.camera.frustum;
  for (let i = 0; i < seedList.length; i++) {
    const e = seedList[i];
    const seedData = <UI3DSeedSpec>e.data;
    if (isGPUMesh(seedData.glRef)) {
      const useMotion =
        seedData.useMotionTexture && isGPUMotionMatrix(seedData.motionMatrix);
      const matrix = useMotion
        ? (seedData.motionMatrix as GPUMeshMotionMatrix)
        : undefined;
      const dict = useMotion ? motionPass : pass;
      if (!dict[seedData.glRef.hash]) {
        dict[seedData.glRef.hash] = [];
      }
      pushGPUMesh(
        state,
        frustum,
        dict[seedData.glRef.hash],
        seedData.lightmapId,
        seedData.model,
        seedData.glRef,
        seedData.color[0],
        seedData.color[1],
        seedData.color[2],
        seedData.color[3],
        0,
        0,
        0,
        true,
        matrix,
      );
    }

    if (texture && isGPUModelTexture(seedData.glRef)) {
      pushGPUModelTexture(texture, seedData.model, seedData.glRef);
    }
  }
}

export function drawSeedsShadowForward(
  pass: GPUMeshInstanceListDict,
  motionPass: GPUMeshInstanceListDict,
  state: GameClientState,
  seedList: UI3DElement[],
  mapFrustum: Frustum,
  bakeShadow: boolean = false,
) {
  for (let i = 0; i < seedList.length; i++) {
    const e = seedList[i];
    const seedData = <UI3DSeedSpec>e.data;
    if (!seedData.renderShadow || !isGPUMesh(seedData.glRef)) {
      continue;
    }

    // 烘焙静态阴影时，非静态实体不参与渲染
    if (bakeShadow && !seedData.staticShadow) {
      continue;
    }

    // 静态实体阴影应用时，当存在静态阴影资源时，静态实体不参与渲染
    if (
      !bakeShadow &&
      state.gpuShadow.enableBakedShadow &&
      seedData.staticShadow
    ) {
      continue;
    }

    const useMotion =
      seedData.useMotionTexture && isGPUMotionMatrix(seedData.motionMatrix);
    const matrix = useMotion
      ? (seedData.motionMatrix as GPUMeshMotionMatrix)
      : undefined;
    const dict = useMotion ? motionPass : pass;
    if (!dict[seedData.glRef.hash]) {
      dict[seedData.glRef.hash] = [];
    }
    pushGPUMesh(
      state,
      mapFrustum,
      dict[seedData.glRef.hash],
      seedData.lightmapId,
      seedData.model,
      seedData.glRef,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      true,
      matrix,
    );
  }
}
