import { mat4, vec3 } from 'gl-matrix';
import type { IREWGPUBuffer, ReWGPU } from '@box/rewgpu';
import { unpackTextureData } from '@box/mesher';
import { ImageModel } from '@box/build-system/tasks/texture/img-process';
import {
  GPUModelTextureInstanceList,
  GPUModelTextureInstanceListSchema,
  GPUModelTextureInstanceSchema,
  GPUMesh,
  GPUMeshInstanceList,
  GPUMeshInstanceSchema,
  GPUMeshSchema,
  GPUModelTexture,
  GPUModelTextureSchema,
  GPUMeshMotionMatrixSchema,
  GPUMeshMotionMatrix,
  GPUMeshInstanceListDictSchema,
  GPUMeshInstanceListDict,
} from './gpu-mesh-schema';
import { Mat4Schema } from '@box/schema/utils/math-schema';
import { GPUState } from '../../gpu/schema/gpu-schema';
import { Meshes } from '../parse/mesh-controller';
import { GameClientState } from '../../game-client-schema';
import { NodesInfoSchema, AnimationsSchema } from '../parse/mesh-schema';
import { ParsedPlayInfo, setTextureData } from '../parse/model-animation';
import {
  isGPUMotionMatrix,
  type MeshCache,
  type MeshMotionMatrix,
} from '../renderable-schema';
import { Frustum } from '@box/schema/utils/frustum-schema';
import { LightProbe } from 'src/engine/voxel/light-schema';
import { testFrustumBox } from '../../utils/frustum';
import { sampleLightBox } from '../../voxel/voxel-controller';
import { testChunkVisibility } from '../../voxel/voxel-controller';
import {
  updateMeshInstanceMatrices,
  updateProbeGeometry,
} from '../parse/mesh-light';
import { getQuadIndexBuffer } from 'src/engine/gpu/quad';
import { alloc, free } from '../../utils/pool';

const MAT4_IDENTITY = mat4.identity(mat4.create());

export function createGPUMesh(
  cache: MeshCache,
  rewgpu: ReWGPU,
  gpuState: GPUState,
  hash: string,
  meshes: Meshes,
) {
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
    texture,
    meshData,
    uvData,
    count,
    idxData: optionalIdxData,
    nodesInfo: optionalNodesInfo,
    animations: optionalAnimations,
    staticIsTransparent = false,
    renderBoxOffset,
  } = meshes;

  result.staticIsTransparent = staticIsTransparent;

  const { width } = texture;
  const height = texture.data.length / width;

  const idxData = optionalIdxData || new Uint8Array(meshData.length / 4);

  result.lox = lox;
  result.loy = loy;
  result.loz = loz;
  result.hix = hix;
  result.hiy = hiy;
  result.hiz = hiz;

  result.nodesInfo = NodesInfoSchema.clone(optionalNodesInfo || []);
  result.animations = AnimationsSchema.clone(optionalAnimations || []);

  vec3.copy(result.renderBoxOffset, renderBoxOffset);

  result.texture = rewgpu.texture({
    size: [width, height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING,
    data: unpackTextureData(texture, [24, 16, 8, 0]),
    dataLayout: { bytesPerRow: width * 4 },
  });

  result.meshBuffer = rewgpu.buffer({
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

  const uv32Data = new Float32Array(uvData.length);
  for (let i = 0; i < uv32Data.length; i += 2) {
    uv32Data[i] = uvData[i] / width;
    uv32Data[i + 1] = uvData[i + 1] / height;
  }

  result.uvBuffer = rewgpu.buffer({
    data: uv32Data,
    size: uv32Data.byteLength,
    usage: GPUBufferUsage.VERTEX,
  });

  const emptyBuffer = getEmptyVertexBuffer(gpuState, rewgpu);
  result.normalsBuffer = emptyBuffer;
  result.positionsBuffer = emptyBuffer;

  const len = Math.max(1, result.nodesInfo.length);
  const staticMatrixData = new Float32Array(len * 16);
  const staticAlphaData = new Float32Array(len);

  if (!result.nodesInfo.length) {
    staticMatrixData.set(MAT4_IDENTITY);
    staticAlphaData.fill(1);
  } else {
    setTextureData(
      {
        matrixData: staticMatrixData,
        alphaData: staticAlphaData,
      },
      result.nodesInfo,
    );
  }

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
  result.indexBufferDescriptor = getQuadIndexBuffer(gpuState, count);

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

  result.isGLTF = false;

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

export function pushGPUMesh(
  state: GameClientState,
  frustum: Frustum,
  pass: GPUMeshInstanceList,
  id: number,
  model: mat4,
  part: GPUMesh,
  red: number,
  green: number,
  blue: number,
  alpha: number,
  metalness: number,
  emissive: number,
  shiny: number,
  testFrustum: boolean,
  motionMatrix?: GPUMeshMotionMatrix,
) {
  // unpack matrix components
  const m0 = model[0];
  const m1 = model[1];
  const m2 = model[2];
  const m4 = model[4];
  const m5 = model[5];
  const m6 = model[6];
  const m8 = model[8];
  const m9 = model[9];
  const m10 = model[10];
  const m12 = model[12];
  const m13 = model[13];
  const m14 = model[14];

  // grab probe entry
  const probe: LightProbe = sampleLightBox(state.light, id);

  // update probe bounds
  const frameCount = state.frameCount;
  if (probe.lastGeomAccess !== frameCount) {
    probe.lastGeomAccess = state.frameCount;
    updateProbeGeometry(
      probe,
      part.lox,
      part.loy,
      part.loz,
      part.hix,
      part.hiy,
      part.hiz,
      m0,
      m1,
      m2,
      m4,
      m5,
      m6,
      m8,
      m9,
      m10,
      m12,
      m13,
      m14,
    );
  }

  // check frustum
  if (
    testFrustum &&
    !(
      testChunkVisibility(
        state,
        probe.lox,
        probe.loy,
        probe.loz,
        probe.hix,
        probe.hiy,
        probe.hiz,
      ) &&
      testFrustumBox(
        frustum,
        probe.lox,
        probe.loy,
        probe.loz,
        probe.hix,
        probe.hiy,
        probe.hiz,
      )
    )
  ) {
    return false;
  }

  // compute distance to camera
  const eyeX = state.camera.eye[0];
  const eyeY = state.camera.eye[1];
  const eyeZ = state.camera.eye[2];
  const distance = // use linfinity distance to bounding box
    Math.max(0, Math.max(probe.lox - eyeX, eyeX - probe.hix)) +
    Math.max(0, Math.max(probe.loy - eyeY, eyeY - probe.hiy)) +
    Math.max(0, Math.max(probe.loz - eyeZ, eyeZ - probe.hiz));
  const passId = state.modelInfo.passId;
  if (part.passId !== passId) {
    part.passId = passId;
    part.distance = distance;
  } else {
    part.distance = Math.min(part.distance, distance);
  }

  // copy data into mesh instance
  const meshInstance = GPUMeshInstanceSchema.alloc();
  meshInstance.id = id;
  updateMeshInstanceMatrices(
    meshInstance,
    m0,
    m1,
    m2,
    m4,
    m5,
    m6,
    m8,
    m9,
    m10,
    m12,
    m13,
    m14,
  );
  meshInstance.part = part;
  meshInstance.ambient = probe;
  meshInstance.distance = distance;
  meshInstance.red = red;
  meshInstance.green = green;
  meshInstance.blue = blue;
  meshInstance.alpha = alpha;
  meshInstance.metalness = metalness;
  meshInstance.shininess = shiny;
  meshInstance.emissive = emissive;
  meshInstance.matrixData = motionMatrix?.matrixData || null;
  meshInstance.alphaData = motionMatrix?.alphaData || null;
  pass.push(meshInstance);
  return true;
}

export function allocGPUMeshListDict() {
  return GPUMeshInstanceListDictSchema.clone(
    GPUMeshInstanceListDictSchema.identity,
  );
}

export function freeGPUMeshListDict(pass: GPUMeshInstanceListDict) {
  return GPUMeshInstanceListDictSchema.free(pass);
}

export function createGPUGameTexture(
  state: GameClientState,
  cache: MeshCache,
  rewgpu: ReWGPU,
  gpuState: GPUState,
  hash: string,
  imgModel: ImageModel,
) {
  if (!gpuState.linearSampler || !gpuState.modelTextureGroupLayout) {
    return;
  }
  const result = GPUModelTextureSchema.alloc();
  const req = state.content.fetchImage(imgModel.data);
  if (!req.loaded || !req.image) {
    return;
  }
  result.hash = hash;
  result.width = imgModel.width;
  result.height = imgModel.height;
  result.texture?.destroy();
  result.texture = rewgpu.texture({
    data: req.image,
    size: [req.image.width, req.image.height],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  result.group = rewgpu.group({
    layout: gpuState.modelTextureGroupLayout,
    entries: [
      {
        binding: 0,
        resource: gpuState.linearSampler,
      },
      {
        binding: 1,
        resource: result.texture,
      },
    ],
  });
  cache.imageIndex[hash] = result;
}

export function allocGPUModelTextureList() {
  return GPUModelTextureInstanceListSchema.clone(
    GPUModelTextureInstanceListSchema.identity,
  );
}

export function freeGPUModelTextureList(pass: GPUModelTextureInstanceList) {
  return GPUModelTextureInstanceListSchema.free(pass);
}

export function pushGPUModelTexture(
  pass: GPUModelTextureInstanceList,
  model: mat4,
  part: GPUModelTexture,
) {
  const TI = GPUModelTextureInstanceSchema.alloc();
  Mat4Schema.assign(TI.model, model);
  TI.part = part;
  pass.push(TI);
}

export function setMotionGroup<
  T extends {
    motionMatrix: MeshMotionMatrix | null;
  },
>(
  out: T,
  state: GameClientState,
  gpuMesh: GPUMesh,
  parsedPlayInfo: ParsedPlayInfo,
) {
  const rewgpu = state.gpu.rewgpu;
  if (!rewgpu || !state.gpu.mesh.nodesGroupLayout) {
    return;
  }
  if (!isGPUMotionMatrix(out.motionMatrix)) {
    out.motionMatrix = GPUMeshMotionMatrixSchema.alloc();
  }

  if (out.motionMatrix.matrixData) {
    free(out.motionMatrix.matrixData.buffer);
  }
  if (out.motionMatrix.alphaData) {
    free(out.motionMatrix.alphaData.buffer);
  }

  const matrixData = new Float32Array(alloc(gpuMesh.nodesInfo.length * 16 * 4));
  const alphaData = new Float32Array(alloc(gpuMesh.nodesInfo.length * 4));

  setTextureData(
    {
      matrixData: matrixData,
      alphaData: alphaData,
    },
    gpuMesh.nodesInfo,
    parsedPlayInfo,
  );
  out.motionMatrix.matrixData = matrixData;
  out.motionMatrix.alphaData = alphaData;
}

export function getEmptyVertexBuffer(
  gpuState: GPUState,
  rewgpu: ReWGPU,
): IREWGPUBuffer {
  if (!gpuState.emptyVertexBuffer) {
    gpuState.emptyVertexBuffer = rewgpu.buffer({
      size: 1,
      usage: GPUBufferUsage.VERTEX,
    });
  }

  return gpuState.emptyVertexBuffer;
}
