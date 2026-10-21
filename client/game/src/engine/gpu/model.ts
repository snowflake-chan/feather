import { GameClientState } from '../game-client-schema';
import {
  GPUMeshInstanceList,
  GPUMeshInstanceListDict,
  GPUMeshMotionMatrix,
  GPUModelTextureInstanceList,
} from '../mesh/gpu-controller/gpu-mesh-schema';
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

export function drawModelsDictForward(
  pass: GPUMeshInstanceListDict,
  motionPass: GPUMeshInstanceListDict,
  texture: GPUModelTextureInstanceList,
  state: GameClientState,
) {
  const models = state.opaqueModels;
  const frustum = state.camera.frustum;
  for (let i = 0; i < models.length; ++i) {
    const m = models[i];

    if (isGPUMesh(m.glRef)) {
      const useMotion = m.useMotionTexture && isGPUMotionMatrix(m.motionMatrix);
      const matrix = useMotion
        ? (m.motionMatrix as GPUMeshMotionMatrix)
        : undefined;
      const dict = useMotion ? motionPass : pass;
      if (!dict[m.glRef.hash]) {
        dict[m.glRef.hash] = [];
      }

      pushGPUMesh(
        state,
        frustum,
        dict[m.glRef.hash],
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
        matrix,
      );
    }

    if (isGPUModelTexture(m.glRef)) {
      pushGPUModelTexture(texture, m.model, m.glRef);
    }
  }
}

export function drawModelsDictTransparent(
  pass: GPUMeshInstanceListDict,
  motionPass: GPUMeshInstanceListDict,
  state: GameClientState,
) {
  const models = state.transparentModels;
  const frustum = state.camera.frustum;
  for (let i = 0; i < models.length; ++i) {
    const m = models[i];
    if (!isGPUMesh(m.glRef)) {
      continue;
    }
    const useMotion = m.useMotionTexture && isGPUMotionMatrix(m.motionMatrix);
    const matrix = useMotion
      ? (m.motionMatrix as GPUMeshMotionMatrix)
      : undefined;
    const dict = useMotion ? motionPass : pass;

    if (!dict[m.glRef.hash]) {
      dict[m.glRef.hash] = [];
    }
    pushGPUMesh(
      state,
      frustum,
      dict[m.glRef.hash],
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
      matrix,
    );
  }
}

export function drawModelsShadowDict(
  pass: GPUMeshInstanceListDict,
  motionPass: GPUMeshInstanceListDict,
  state: GameClientState,
  shadowFrustum: Frustum,
  bakeShadow: boolean = false,
) {
  const models = state.opaqueModels.concat(state.transparentModels);

  const frustum = shadowFrustum;

  for (let i = 0; i < models.length; ++i) {
    const m = models[i];

    if (!m.renderShadow || !isGPUMesh(m.glRef)) {
      continue;
    }

    // 烘焙静态阴影时，非静态实体不参与渲染
    if (bakeShadow && !m.staticShadow) {
      continue;
    }

    // 静态实体阴影应用时，当存在静态阴影资源时，静态实体不参与渲染
    if (!bakeShadow && state.gpuShadow.enableBakedShadow && m.staticShadow) {
      continue;
    }

    const useMotion = m.useMotionTexture && isGPUMotionMatrix(m.motionMatrix);
    const matrix = useMotion
      ? (m.motionMatrix as GPUMeshMotionMatrix)
      : undefined;
    const dict = useMotion ? motionPass : pass;

    if (!dict[m.glRef.hash]) {
      dict[m.glRef.hash] = [];
    }

    pushGPUMesh(
      state,
      frustum,
      dict[m.glRef.hash],
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
      matrix,
    );
  }
}
