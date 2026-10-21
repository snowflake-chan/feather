import { vec3 } from 'gl-matrix';
import type { ReWGPU } from '@box/rewgpu';
import type { ParsedGLTFMesh } from './interfaces';
import type { GameClientState } from 'src/engine/game-client-schema';
import { GPUMeshSchema, type GPUMesh } from '../gpu-controller/gpu-mesh-schema';
import { AnimationsSchema, NodesInfoSchema } from '../parse/mesh-schema';
import { setTextureData } from '../parse/model-animation';
import { ceilPowerOfTwo } from '../util';
import { getEmptyVertexBuffer } from '../gpu-controller/gpu-mesh-controller';

/**
 * 从GLTF到GPUMesh
 */
export function parseGLTFToGPUMesh(
  state: GameClientState,
  rewgpu: ReWGPU,
  parsedGLTF: ParsedGLTFMesh,
  hash: string,
): GPUMesh | undefined {
  const { gpu: gpuState, modelCache: cache } = state;

  if (
    !gpuState.sampler ||
    !gpuState.mesh.nodesGroupLayout ||
    !gpuState.mesh.nodesTextureGroupLayout
  ) {
    // pipeline还没准备好，欢迎下次再来
    delete cache.modelIndex[hash];
    return;
  }

  const result = GPUMeshSchema.alloc();
  result.hash = hash;

  const {
    lox,
    loy,
    loz,
    hix,
    hiy,
    hiz,
    textures,
    meshData,
    uvData,
    normalData,
    indicesData,
    count,
    idxData: optionalIdxData,
    nodesInfo: optionalNodesInfo,
  } = parsedGLTF;

  result.staticIsTransparent = false;

  // 只处理首个texture
  const [texture] = textures;

  const idxData = optionalIdxData || new Uint8Array(meshData.length / 4);

  result.lox = lox;
  result.loy = loy;
  result.loz = loz;
  result.hix = hix;
  result.hiy = hiy;
  result.hiz = hiz;

  result.nodesInfo = NodesInfoSchema.clone(optionalNodesInfo || []);
  result.animations = AnimationsSchema.clone([]);

  vec3.zero(result.renderBoxOffset);

  result.texture = rewgpu.texture({
    size: [texture.width, texture.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    data: texture,
    dataLayout: { bytesPerRow: texture.width * 4 },
  });

  result.meshBuffer = getEmptyVertexBuffer(state.gpu, rewgpu);

  result.normalsBuffer = rewgpu.buffer({
    label: 'gltf:normalsBuffer',
    data: normalData,
    size: normalData.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  result.positionsBuffer = rewgpu.buffer({
    data: meshData,
    size: meshData.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const idx32Data = new Uint32Array(idxData.length);
  for (let i = 0; i < idx32Data.length; i++) {
    idx32Data[i] = idxData[i];
  }

  result.idxBuffer = rewgpu.buffer({
    data: idx32Data,
    size: idx32Data.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  result.uvBuffer = rewgpu.buffer({
    data: uvData,
    size: uvData.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const len = Math.max(1, result.nodesInfo.length);
  const staticMatrixData = new Float32Array(len * 16);
  const staticAlphaData = new Float32Array(len);

  setTextureData(
    {
      matrixData: staticMatrixData,
      alphaData: staticAlphaData,
    },
    result.nodesInfo,
  );

  result.staticMatrixBuffer = rewgpu.buffer({
    data: staticMatrixData,
    size: staticMatrixData.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });
  result.staticAlphaBuffer = rewgpu.buffer({
    data: staticAlphaData,
    size: staticAlphaData.byteLength,
    usage: GPUBufferUsage.STORAGE,
  });

  result.count = count;

  const length = ceilPowerOfTwo(indicesData.length);

  const indices16Data = new Uint16Array(length);
  for (let i = 0; i < indicesData.length; i++) {
    indices16Data[i] = indicesData[i];
  }

  result.indexBufferDescriptor = {
    reBuffer: rewgpu.buffer({
      data: indices16Data,
      size: indices16Data.byteLength,
      usage: GPUBufferUsage.INDEX,
    }),
    indexFormat: 'uint16',
  };

  // 这个是为了？有点想不起来了
  result.staticNodesGroup = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: result.staticMatrixBuffer,
      },
      {
        binding: 1,
        resource: result.staticAlphaBuffer,
      },
    ],
    layout: gpuState.mesh.nodesGroupLayout,
  });

  result.isGLTF = true;

  result.nodesTextureGroup = rewgpu.group({
    entries: [
      {
        binding: 0,
        resource: result.staticMatrixBuffer,
      },
      {
        binding: 1,
        resource: result.staticAlphaBuffer,
      },
      {
        binding: 2,
        resource: gpuState.sampler,
      },
      {
        binding: 3,
        resource: result.texture,
      },
    ],
    layout: gpuState.mesh.nodesTextureGroupLayout,
  });

  cache.modelIndex[hash] = result;
  cache.gpuCache.push(result);
  return result;
}
