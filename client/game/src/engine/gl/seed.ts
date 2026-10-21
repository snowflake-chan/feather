import { GameClientState } from '../game-client-schema';
import {
  GLMeshInstanceList,
  GLTextureInstanceList,
} from '../mesh/gl-controller/gl-mesh-schema';
import {
  pushGLMesh,
  pushGLTexture,
} from '../mesh/gl-controller/gl-mesh-controller';
import { UI3DSeedSpec, UI3DElement } from '../ui3d/ui3d-schema';
import {
  isGLMesh,
  isGLMotionMatrix,
  isGLTexture,
} from '../mesh/renderable-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';

export function drawSeedsForward(
  pass: GLMeshInstanceList,
  state: GameClientState,
  seedList: UI3DElement[],
  texture?: GLTextureInstanceList,
) {
  const frustum = state.camera.frustum;
  for (let i = 0; i < seedList.length; i++) {
    const e = seedList[i];
    const seedData = <UI3DSeedSpec>e.data;
    if (isGLMesh(seedData.glRef)) {
      pushGLMesh(
        state,
        frustum,
        pass,
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
        seedData.useMotionTexture && isGLMotionMatrix(seedData.motionMatrix)
          ? seedData.motionMatrix
          : undefined,
      );
    }

    if (texture && isGLTexture(seedData.glRef)) {
      pushGLTexture(texture, seedData.model, seedData.glRef);
    }
  }
}

export function drawSeedsShadowForward(
  pass: GLMeshInstanceList,
  state: GameClientState,
  seedList: UI3DElement[],
  mapFrustum: Frustum,
  bakeShadow: boolean = false,
) {
  for (let i = 0; i < seedList.length; i++) {
    const e = seedList[i];
    const seedData = <UI3DSeedSpec>e.data;
    if (!seedData.renderShadow || !isGLMesh(seedData.glRef)) {
      continue;
    }

    // 烘焙静态阴影时，非静态实体不参与渲染
    if (bakeShadow && !seedData.staticShadow) {
      continue;
    }

    // 静态实体阴影应用时，当存在静态阴影资源时，静态实体不参与渲染
    if (
      !bakeShadow &&
      state.shadow.enableBakedShadow &&
      seedData.staticShadow
    ) {
      continue;
    }

    pushGLMesh(
      state,
      mapFrustum,
      pass,
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
      seedData.useMotionTexture && isGLMotionMatrix(seedData.motionMatrix)
        ? seedData.motionMatrix
        : undefined,
    );
  }
}
