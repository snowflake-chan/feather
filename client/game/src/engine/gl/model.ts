import { GameClientState } from '../game-client-schema';
import {
  GLMeshInstanceList,
  GLTextureInstanceList,
} from '../mesh/gl-controller/gl-mesh-schema';
import {
  pushGLMesh,
  pushGLTexture,
} from '../mesh/gl-controller/gl-mesh-controller';
import {
  isGLMesh,
  isGLMotionMatrix,
  isGLTexture,
} from '../mesh/renderable-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';

export function drawModelsForward(
  pass: GLMeshInstanceList,
  texture: GLTextureInstanceList,
  state: GameClientState,
) {
  const models = state.opaqueModels;
  const frustum = state.camera.frustum;
  for (let i = 0; i < models.length; ++i) {
    const m = models[i];

    if (isGLMesh(m.glRef)) {
      pushGLMesh(
        state,
        frustum,
        pass,
        m.lightmapId,
        m.model,
        m.glRef,
        m.color[0],
        m.color[1],
        m.color[2],
        1,
        m.metalness,
        m.emissive,
        m.shininess,
        true,
        m.useMotionTexture && isGLMotionMatrix(m.motionMatrix)
          ? m.motionMatrix
          : undefined,
      );
    }
    if (isGLTexture(m.glRef)) {
      pushGLTexture(texture, m.model, m.glRef);
    }
  }
}

export function drawModelsShadow(
  pass: GLMeshInstanceList,
  state: GameClientState,
  mapFrustum: Frustum,
  bakeShadow: boolean = false,
) {
  const models = state.opaqueModels.concat(state.transparentModels);

  for (let i = 0; i < models.length; ++i) {
    const m = models[i];
    if (!m.renderShadow || !isGLMesh(m.glRef)) {
      continue;
    }

    // 烘焙静态阴影时，非静态实体不参与渲染
    if (bakeShadow && !m.staticShadow) {
      continue;
    }

    // 静态实体阴影应用时，当存在静态阴影资源时，静态实体不参与渲染
    if (!bakeShadow && state.shadow.enableBakedShadow && m.staticShadow) {
      continue;
    }

    pushGLMesh(
      state,
      mapFrustum,
      pass,
      m.lightmapId,
      m.model,
      m.glRef,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      true,
      m.useMotionTexture && isGLMotionMatrix(m.motionMatrix)
        ? m.motionMatrix
        : undefined,
    );
  }
}

export function drawModelsTransparent(
  pass: GLMeshInstanceList,
  state: GameClientState,
) {
  const models = state.transparentModels;
  const frustum = state.camera.frustum;
  for (let i = 0; i < models.length; ++i) {
    const m = models[i];
    if (!isGLMesh(m.glRef)) {
      continue;
    }
    pushGLMesh(
      state,
      frustum,
      pass,
      m.lightmapId,
      m.model,
      m.glRef,
      m.color[0],
      m.color[1],
      m.color[2],
      m.color[3],
      m.metalness,
      m.emissive,
      m.shininess,
      true,
      m.useMotionTexture && isGLMotionMatrix(m.motionMatrix)
        ? m.motionMatrix
        : undefined,
    );
  }
}
