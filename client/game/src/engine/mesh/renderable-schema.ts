import {
  MuStruct,
  MuUint32,
  MuDictionary,
  MuArray,
  MuUTF8,
  MuSchema,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { GLTexture } from '../gl/schema/gl-texture';
import {
  GLMesh,
  GLMeshMotionMatrix,
  GLMeshSchema,
} from './gl-controller/gl-mesh-schema';
import {
  GPUMesh,
  GPUMeshMotionMatrix,
  GPUMeshSchema,
  GPUModelTexture,
} from './gpu-controller/gpu-mesh-schema';
import { RenderableType } from './parse/mesh-schema';
import { GameClientState } from '../game-client-schema';
import { Mat4Schema } from '@box/schema/utils/math-schema';

export type MeshRenderable = GLMesh | GPUMesh;

export type TextureRenderable = GLTexture | GPUModelTexture;

export type Renderable = MeshRenderable | TextureRenderable;

export function isGLMesh(renderable: Renderable | null): renderable is GLMesh {
  return !!renderable && renderable.renderableType === RenderableType.GLMesh;
}

export function isGLTexture(
  renderable: Renderable | null,
): renderable is GLTexture {
  return !!renderable && renderable.renderableType === RenderableType.GLTexture;
}

export function isGPUMesh(
  renderable: Renderable | null,
): renderable is GPUMesh {
  return !!renderable && renderable.renderableType === RenderableType.GPUMesh;
}

export function isGPUModelTexture(
  renderable: Renderable | null,
): renderable is GPUModelTexture {
  return (
    !!renderable && renderable.renderableType === RenderableType.GPUModelTexture
  );
}

export type MeshMotionMatrix = GLMeshMotionMatrix | GPUMeshMotionMatrix;

export function isGLMotionMatrix(
  renderable: MeshMotionMatrix | null,
): renderable is GLMeshMotionMatrix {
  return !!renderable && renderable.renderableType === RenderableType.GLMesh;
}

export function isGPUMotionMatrix(
  renderable: MeshMotionMatrix | null,
): renderable is GPUMeshMotionMatrix {
  return !!renderable && renderable.renderableType === RenderableType.GPUMesh;
}

export const MeshCacheSchema = new MuStruct({
  modelIndex: new MuDictionary(new MuRefSchema<MeshRenderable>(), Infinity),
  skinIndex: new MuDictionary(new MuRefSchema<SkinRenderable>(), Infinity),
  imageIndex: new MuDictionary(new MuRefSchema<TextureRenderable>(), Infinity),

  modelSize: new MuDictionary(new MuUint32(), Infinity),

  glCache: new MuArray(GLMeshSchema, Infinity),
  gpuCache: new MuArray(GPUMeshSchema, Infinity),
});

export type MeshCache = typeof MeshCacheSchema.identity;

export const SkinRenderableSchema = new MuStruct({
  hash: new MuUTF8(),
  id: new MuUint32(),
  bind: Mat4Schema,
  part: <MuSchema<MeshRenderable>>new MuRefSchema<MeshRenderable>(),
});

export type SkinRenderable = typeof SkinRenderableSchema.identity;

export function destroyMesh(state: GameClientState) {
  state.modelCache.glCache.forEach((x) => {
    if (x.meshBuffer) {
      x.meshBuffer.destroy();
    }
    if (x.uvBuffer) {
      x.uvBuffer.destroy();
    }
    if (x.idxBuffer) {
      x.idxBuffer.destroy();
    }
    if (x.normalsBuffer) {
      x.normalsBuffer.destroy();
    }
    if (x.vao) {
      x.vao.destroy();
    }
  });

  state.modelCache.gpuCache.forEach((x) => {
    if (x.meshBuffer) {
      x.meshBuffer.destroy();
    }
    if (x.uvBuffer) {
      x.uvBuffer.destroy();
    }
    if (x.idxBuffer) {
      x.idxBuffer.destroy();
    }
    if (x.normalsBuffer) {
      x.normalsBuffer.destroy();
    }
    if (x.positionsBuffer) {
      x.positionsBuffer.destroy();
    }
    if (x.texture) {
      x.texture.destroy();
    }
    if (x.staticMatrixBuffer) {
      x.staticMatrixBuffer.destroy();
    }
    if (x.staticAlphaBuffer) {
      x.staticAlphaBuffer.destroy();
    }
    if (x.staticNodesGroup) {
      x.staticNodesGroup.destroy();
    }
    if (x.nodesTextureGroup) {
      x.nodesTextureGroup.destroy();
    }
  });
  MeshCacheSchema.assign(state.modelCache, MeshCacheSchema.identity);
}
