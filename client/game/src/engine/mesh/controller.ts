import { mat4 } from 'gl-matrix';
import {
  getModelMetaData,
  isLatestSkin,
  bodyPartBytesToSchema,
} from '@box/voxa-project';
import { GameClientState } from '../game-client-schema';
import {
  createGLMesh,
  createGLTexture,
} from './gl-controller/gl-mesh-controller';
import {
  createGPUGameTexture,
  createGPUMesh,
} from './gpu-controller/gpu-mesh-controller';
import {
  getUvDataType,
  parseModelNodes,
  retrieveModelData,
} from './parse/mesh-controller';
import {
  MeshRenderable,
  SkinRenderable,
  SkinRenderableSchema,
  TextureRenderable,
} from './renderable-schema';
import { ImageModel } from '@box/build-system/tasks/texture/img-process';
import { MuReadStream } from '@box/mudb/stream';
import { PlayerSkinPartSchema } from '@box/schema/mesh/skin-schema';
import { unpackMeshData } from '@box/mesher';
import { parseGLTFToGLMesh } from './gltf/gl';
import { parseGLTFToGPUMesh } from './gltf/gpu';

export function getRenderableMesh(
  state: GameClientState,
  modelHash: string,
): MeshRenderable | null {
  const cache = state.modelCache;
  if (modelHash in cache.modelIndex) {
    return cache.modelIndex[modelHash];
  }
  cache.modelIndex[modelHash] = null;
  loadRenderableMesh(state, modelHash);
  return null;
}

export async function loadRenderableMesh(
  state: GameClientState,
  modelHash: string,
): Promise<MeshRenderable | undefined> {
  try {
    const value = await state.content.retrieveFromS3(modelHash);
    if (!value) {
      state.logger.error(`error retrieving voxel model from s3 ${modelHash}.`);
      return;
    }
    const metaData = getModelMetaData(modelHash, new Uint8Array(value));
    if (!metaData) {
      state.logger.error(`error generate model metadata from s3 ${modelHash}.`);
      return;
    }
    const meshes = await retrieveModelData(state, modelHash, metaData);
    if (!meshes) {
      return;
    }

    if (state.gl.regl) {
      return createGLMesh(
        state.modelCache,
        state.gl.regl,
        state.gl,
        modelHash,
        meshes,
      );
    }
    if (state.gpu.rewgpu) {
      return createGPUMesh(
        state.modelCache,
        state.gpu.rewgpu,
        state.gpu,
        modelHash,
        meshes,
      );
    }
    return;
  } catch (err) {
    state.logger.error(`error request model ${modelHash}, ${err}`);
    return;
  }
}

export function getRenderableTexture(
  state: GameClientState,
  hash: string,
): TextureRenderable | null {
  const cache = state.modelCache;
  if (hash in cache.imageIndex) {
    return cache.imageIndex[hash];
  }

  state.content
    .retrieve(hash)
    .then((imgBuffer) => {
      if (!imgBuffer || cache.imageIndex[hash]) {
        return;
      }
      const imgModel: ImageModel = JSON.parse(
        Buffer.from(imgBuffer).toString(),
      );

      if (state.gl.regl) {
        createGLTexture(state, cache, state.gl.regl, hash, imgModel);
        return;
      }

      if (state.gpu.rewgpu) {
        createGPUGameTexture(
          state,
          cache,
          state.gpu.rewgpu,
          state.gpu,
          hash,
          imgModel,
        );
      }
    })
    .catch(() => {
      state.logger.error(`error retrieving img hash ${hash}.`);
    });
  return null;
}

/**
 * 根据平台皮肤部件ID获取SkinRenderable
 * @param state GameState
 * @param skinPartId 平台皮肤部件ID
 * @returns SkinRenderable | null
 */
export function getAvatarSkinRenderable(
  state: GameClientState,
  skinPartId: number,
): SkinRenderable | null {
  if (!skinPartId) {
    return null;
  }
  if (skinPartId in state.modelCache.skinIndex) {
    return state.modelCache.skinIndex[skinPartId];
  }
  const hash = state.modelInfo.skinPartHashes[skinPartId];
  if (!hash) {
    return null;
  }
  if (hash in state.modelCache.skinIndex) {
    return (state.modelCache[skinPartId] = state.modelCache.skinIndex[hash]);
  }
  state.modelCache.skinIndex[skinPartId] = null;

  state.content
    .retrieveFromS3(hash, { ossCdnPath: '/avatar/m/' })
    .then((data) => {
      if (!data || data.length === 0) {
        state.logger.error(`error retrieving player skin ${hash}`);
        return;
      }
      const inp = new MuReadStream(data);
      const skinMesh = PlayerSkinPartSchema.patch(
        PlayerSkinPartSchema.identity,
        inp,
      );

      // skip empty model
      if (skinMesh.mesh.length === 0) {
        return;
      }
      // allocate model
      const model = SkinRenderableSchema.alloc();
      model.hash = hash;
      model.id = skinMesh.partId;
      mat4.copy(model.bind, skinMesh.bindMat);

      const unpackData = unpackMeshData(
        skinMesh.mesh,
        Uint8Array,
        getUvDataType(skinMesh.texture),
      );
      const { meshData, ...others } = unpackData;
      if (state.gl.regl) {
        model.part = createGLMesh(
          state.modelCache,
          state.gl.regl,
          state.gl,
          hash,
          {
            meshData: meshData as Uint8Array,
            texture: skinMesh.texture,
            renderBoxOffset: [0, 0, 0],
            ...others,
          },
        );
      }

      if (state.gpu.rewgpu) {
        const part = createGPUMesh(
          state.modelCache,
          state.gpu.rewgpu,
          state.gpu,
          hash,
          {
            meshData: meshData as Uint8Array,
            texture: skinMesh.texture,
            renderBoxOffset: [0, 0, 0],
            ...others,
          },
        );
        if (part) {
          model.part = part;
        }
      }
      if (!model.part) {
        return;
      }
      state.modelCache.skinIndex[hash] = state.modelCache.skinIndex[
        skinPartId
      ] = model;
    })
    .catch((reason) => {
      state.logger.error(
        `error retrieving player skin ${hash}. ${
          (reason && reason.stack) || reason
        }`,
      );
    });

  return null;
}

/**
 * 根据地图皮肤部件(voxa多部件文件)hash生成SkinRenderable
 * @param state GameState
 * @param bodyPartHash 地图皮肤部件(voxa多部件文件)hash
 * @returns SkinRenderable
 */
export function getMapSkinRenderable(
  state: GameClientState,
  bodyPartHash: string,
) {
  if (!bodyPartHash) {
    return null;
  }
  if (bodyPartHash in state.modelCache.skinIndex) {
    return state.modelCache.skinIndex[bodyPartHash];
  }
  state.modelCache.skinIndex[bodyPartHash] = null;

  state.content
    .retrieveFromS3(bodyPartHash)
    .then((data) => {
      if (!data || data.length === 0) {
        state.logger.error(`error retrieving voxa body part ${bodyPartHash}`);
        return;
      }
      const schema = bodyPartBytesToSchema(data);
      if (!schema) {
        state.logger.error(`voxa body part ${bodyPartHash} to schema error`);
        return;
      }

      if (!isLatestSkin(schema.schema)) {
        state.logger.error(
          `version of body part ${bodyPartHash} mismatch latest version.`,
        );
        return;
      }

      const { schema: bodyPart } = schema;

      // meshes长度为0表示没有体素，不需要渲染
      if (!bodyPart.meshes.length) {
        return;
      }

      // allocate model
      const model = SkinRenderableSchema.alloc();
      model.hash = bodyPartHash;
      model.id = bodyPart.partId;
      mat4.copy(model.bind, bodyPart.bindMat);

      const {
        texture,
        meshData,
        uvData,
        count,
        idxData,
        nodesInfo,
        staticIsTransparent,
      } = parseModelNodes(bodyPart.nodes, bodyPart.texture, bodyPart.meshes);

      if (state.gl.regl) {
        model.part = createGLMesh(
          state.modelCache,
          state.gl.regl,
          state.gl,
          bodyPartHash,
          {
            lox: 0,
            loy: 0,
            loz: 0,
            hix: bodyPart.bounds[0],
            hiy: bodyPart.bounds[1],
            hiz: bodyPart.bounds[2],
            texture,
            meshData,
            uvData,
            count,
            idxData,
            nodesInfo,
            staticIsTransparent,
            renderBoxOffset: [0, 0, 0],
          },
        );
      }

      if (state.gpu.rewgpu) {
        const part = createGPUMesh(
          state.modelCache,
          state.gpu.rewgpu,
          state.gpu,
          bodyPartHash,
          {
            lox: 0,
            loy: 0,
            loz: 0,
            hix: bodyPart.bounds[0],
            hiy: bodyPart.bounds[1],
            hiz: bodyPart.bounds[2],
            texture,
            meshData,
            uvData,
            count,
            idxData,
            nodesInfo,
            staticIsTransparent,
            renderBoxOffset: [0, 0, 0],
          },
        );

        if (part) {
          model.part = part;
        }
      }

      if (!model.part) {
        return;
      }

      state.modelCache.skinIndex[bodyPartHash] = model;
    })
    .catch((err) => {
      state.logger.error(
        `error retrieving voxa body part ${bodyPartHash}. ${err}`,
      );
    });
  return null;
}

export function getRenderableGLTF(
  state: GameClientState,
  hash: string,
): MeshRenderable | null {
  const cache = state.modelCache;
  if (hash in cache.modelIndex) {
    return cache.modelIndex[hash];
  }

  const parsedGLTF =
    state.resourceController.fetchParsedGLTFByMetadataHash(hash);

  if (parsedGLTF.mesh) {
    if (state.gl.regl) {
      parseGLTFToGLMesh(state, state.gl.regl, parsedGLTF.mesh, hash);
    } else if (state.gpu.rewgpu) {
      parseGLTFToGPUMesh(state, state.gpu.rewgpu, parsedGLTF.mesh, hash);
    }
  }

  return null;
}
