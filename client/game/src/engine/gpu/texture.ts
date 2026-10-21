import { mat4, vec2 } from 'gl-matrix';
import type {
  ReWGPU,
  IndexBufferDescriptor,
  IREWGPUBuffer,
  IREWGPUGroup,
} from '@box/rewgpu';

import { Hash } from '@box/schema/content-server/index';
import { GameClientState } from '../game-client-schema';
import { GPUGameTexture } from './schema/gpu-texture';
import { CommonUniformEntries, CommonUniformLayout } from './interface';
import { GPUModelTextureInstanceList } from '../mesh/gpu-controller/gpu-mesh-schema';
import { F32, MAT4X4F32, createUniformPool } from './uniform-pool';
import struct from './wgsl/texture-struct.wgsl';
import vert from './wgsl/texture-vert.wgsl';
import frag from './wgsl/texture-frag.wgsl';

import fog from './wgsl/fog.wgsl';
import toneMapping from './wgsl/tone-mapping.wgsl';
import postOut from './wgsl/post-out.wgsl';

function hashesEqual(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function initCube(out: GPUGameTexture, rewgpu: ReWGPU, radius: number) {
  // webgpu的texture无法resize，尺寸不一致就销毁重建
  if (out.radius !== radius) {
    out.cube?.destroy();
    out.cube = null;
    out.radius = radius;
  }

  if (!out.cube) {
    out.cube = rewgpu.cube({
      size: out.radius,
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }
  return out.cube;
}

export function initTexture(
  out: GPUGameTexture,
  rewgpu: ReWGPU,
  radius: number | [number, number] = 256,
  mipLevelCount: number = 1,
) {
  let needToDestroy = false;
  let size: vec2;

  if (typeof radius === 'number') {
    needToDestroy = out.radius !== radius;

    out.radius = radius;

    size = [out.radius, out.radius];
  } else {
    needToDestroy = !vec2.exactEquals(out.size, radius);

    vec2.copy(out.size, radius);

    size = out.size;
  }

  if (out.mipLevelCount !== mipLevelCount) {
    needToDestroy = true;
    out.mipLevelCount = mipLevelCount;
  }

  // webgpu的texture无法resize，尺寸不一致就销毁重建
  // mipLevel不一致也需要销毁重建
  if (needToDestroy) {
    out.texture?.destroy();
    out.texture = null;
  }

  if (!out.texture) {
    out.texture = rewgpu.texture({
      size,
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      mipLevelCount: out.mipLevelCount,
    });
  }
  return out.texture;
}

export function updateTexture(
  out: GPUGameTexture,
  state: GameClientState,
  reqHashes: Hash[],
) {
  if (
    hashesEqual(out.hashes, reqHashes) &&
    (out.texture || out.cube || reqHashes.length <= 0)
  ) {
    return;
  }
  const rewgpu = state.gpu.rewgpu;
  if (!rewgpu) {
    return;
  }
  const images: (HTMLImageElement | ImageBitmap)[] = [];
  const hashes = out.hashes;
  hashes.length = 0;

  for (let i = 0; i < reqHashes.length; ++i) {
    const req = state.content.fetchImage(reqHashes[i]);
    if (!req.loaded || !req.image) {
      hashes.length = 0;
      return;
    }
    images.push(req.image);
    hashes.push(reqHashes[i]);
  }

  if (images.length === 6 && out.cube) {
    out.faces = images;
    out.cube.update([
      out.faces[0],
      out.faces[1],
      out.faces[2],
      out.faces[3],
      out.faces[4],
      out.faces[5],
    ]);
    return;
  }

  if (out.texture) {
    if (images.length === 1) {
      out.data = images[0];
      out.texture.update(out.data);
    } else {
      out.mipmap = images;
      out.mipmap.forEach((img, idx) => {
        out.texture?.update(img, { mipLevel: idx });
      });
    }
  }
}

export function gpuTexture(
  rewgpu: ReWGPU,
  commonUniformLayout: CommonUniformLayout,
) {
  const vertData = new Float32Array(4 * 4);

  vertData[0] = -1; // 左上角 坐标x
  vertData[1] = 1; // 左上角 坐标y
  vertData[2] = 0; // 左上角 uv x
  vertData[3] = 0; // 左上角 uv y

  vertData[4] = 1; // 右上角 坐标x
  vertData[5] = 1; // 右上角 坐标y
  vertData[6] = 1; // 右上角 uv x
  vertData[7] = 0; // 右上角 uv y

  vertData[8] = -1; // 左下角 坐标x
  vertData[9] = -1; // 左下角 坐标y
  vertData[10] = 0; // 左下角 uv x
  vertData[11] = 1; // 左下角 uv y

  vertData[12] = 1; // 右下角 坐标x
  vertData[13] = -1; // 右下角 坐标y
  vertData[14] = 1; // 右下角 uv x
  vertData[15] = 1; // 右下角 uv y

  const modelTextureUniformLayout = rewgpu.createBindGroupLayout({
    label: 'modelTexture:uniform:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {},
      },
    ],
  });

  const modelTextureGroupLayout = rewgpu.createBindGroupLayout({
    label: 'modelTexture:texture:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
    ],
  });

  const commonGroupLayout = rewgpu.createBindGroupLayout({
    label: 'modelTexture:commonGroup:layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {},
      },
    ],
  });

  const pipelineLayout = rewgpu.createPipelineLayout({
    label: 'modelTexture:forward',
    bindGroupLayouts: [
      commonGroupLayout,
      modelTextureUniformLayout,
      modelTextureGroupLayout,
    ],
  });

  const pipeline = rewgpu.createPipeline({
    label: 'modelTexture:forward',
    layout: pipelineLayout,
    struct: `
    ${commonUniformLayout.structCode}

    ${fog}
    ${toneMapping}
    ${postOut}

    ${struct}
    `,
    frag: {
      content: frag,
      entryPoint: 'fragMain',
    },
    vert: {
      content: vert,
      entryPoint: 'vertMain',
      buffers: [
        {
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
            {
              shaderLocation: 1,
              offset: 8,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
    primitive: {
      topology: 'triangle-list',
    },
  });

  const pool = createUniformPool(rewgpu, pipeline.getBindGroupLayout(1), {
    matrix: MAT4X4F32,
    width: F32,
    height: F32,
  });

  const commandDescriptor = {
    pipeline,
    count: 6,
    vertBuffers: <IREWGPUBuffer[]>[],
    groups: <IREWGPUGroup[]>[],
    indexBuffer: <IndexBufferDescriptor | undefined>undefined,
  };

  const command = rewgpu.createCommand(commandDescriptor);

  return {
    init: (
      state: GameClientState,
      commonUniformEntries: CommonUniformEntries,
    ) => {
      const vertBuffer = rewgpu.buffer({
        label: 'modelTexture:vert',
        data: vertData,
        size: vertData.byteLength,
        usage: GPUBufferUsage.VERTEX,
      });

      const commonGroup = rewgpu.group({
        label: 'modelTexture:commonGroup',
        entries: commonUniformEntries.entries,
        layout: pipeline.getBindGroupLayout(0),
      });

      commandDescriptor.vertBuffers[0] = vertBuffer;
      commandDescriptor.groups[0] = commonGroup;

      state.gpu.modelTextureGroupLayout = modelTextureGroupLayout;
    },
    forward: (
      state: GameClientState,
      passEncoder: GPURenderPassEncoder,
      textureList: GPUModelTextureInstanceList,
    ) => {
      const uniforms = pool.allocUniform(textureList.length);
      for (let i = 0; i < textureList.length; i++) {
        const { group, width, height } = textureList[i].part;
        if (!group || !state.gpu.smallIndexBuffer) {
          return;
        }

        commandDescriptor.indexBuffer = state.gpu.smallIndexBuffer;

        mat4.copy(uniforms[i].struct.matrix, textureList[i].model);
        uniforms[i].struct.width[0] = width / 2;
        uniforms[i].struct.height[0] = height / 2;

        commandDescriptor.groups[1] = uniforms[i].group;
        commandDescriptor.groups[2] = group;

        command(passEncoder);
      }
      pool.updateUniform(uniforms);
      pool.freeUniform(uniforms);
    },
    clear: () => {
      pool.destroy();
    },
  };
}
