import { ReWGPU } from '@box/rewgpu';
import { VoxelRenderer } from '../interface';
import { FLUID_VERTEX_SIZE, VERTEX_SIZE } from '../voxel-mesher';
import {
  GPUVoxelChunk,
  GPUVoxelChunkSchema,
  GPUVoxelGeom,
  GPUVoxelChunkListSchema,
} from './gpu-voxel-schema';
import { GPUState } from '../../gpu/schema/gpu-schema';
import { BoundingBox } from '../voxel-worker-schema';
import { getQuadIndexBuffer, expandQuad } from '../../gpu/quad';
import { ChunkVisibilityFlags } from '../visibility-flags';

export const GPURenderer: VoxelRenderer<'gpu'> = {
  getVoxelState: (state) => {
    return state.gpuVoxelMesh;
  },
  updateChunk: (
    state,
    chunk,
    meshData,
    alphaData,
    fluidData,
    meshBounds,
    alphaBounds,
    fluidBounds,
  ) => {
    const rewgpu = state.gpu.rewgpu;
    if (!rewgpu) {
      return;
    }
    state.gpuVoxelMesh.chunksDirty = true;
    const gpuState = state.gpu;
    updateChunkGeometry(
      rewgpu,
      gpuState,
      chunk.geom,
      meshData,
      meshBounds,
      VERTEX_SIZE,
    );
    updateChunkGeometry(
      rewgpu,
      gpuState,
      chunk.alphaGeom,
      alphaData,
      alphaBounds,
      VERTEX_SIZE,
    );
    updateChunkGeometry(
      rewgpu,
      gpuState,
      chunk.fluidGeom,
      fluidData,
      fluidBounds,
      FLUID_VERTEX_SIZE,
    );
  },
  clearChunk: (state, chunk, solid) => {
    state.gpuVoxelMesh.chunksDirty = true;
    clearChunk(chunk, solid);
  },
  resetChunks: (state, mesh) => {
    state.gpuVoxelMesh.chunksDirty = true;
    for (let i = 0; i < mesh.chunks.length; ++i) {
      clearChunk(mesh.chunks[i], false);
    }
    GPUVoxelChunkListSchema.assign(mesh.chunks, []);
  },
  initChunks: (state, mesh, cx, cy, cz) => {
    state.gpuVoxelMesh.chunksDirty = true;
    for (let k = 0; k < cz; ++k) {
      for (let j = 0; j < cy; ++j) {
        for (let i = 0; i < cx; ++i) {
          const chunk = GPUVoxelChunkSchema.clone(GPUVoxelChunkSchema.identity);
          initChunk(chunk, i, j, k);
          mesh.chunks.push(chunk);
        }
      }
    }
  },
  clearHeightTexture: (state) => {
    const rewgpu = state.gpu.rewgpu;
    const nx = state.voxel.shape[0];
    const nz = state.voxel.shape[2];
    if (!rewgpu || !nx || !nz) {
      return;
    }

    state.gpuVoxelMesh.terrainHeightTex?.destroy();
    state.gpuVoxelMesh.terrainHeightTex = rewgpu.texture({
      label: 'terrainHeightTex',
      size: [nx, nz],
      format: 'r8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });

    state.gpuVoxelMesh.terrainTexDirty = true;
  },
  updateHeightmap: (state, x, y, width, height, data) => {
    const texture = state.gpuVoxelMesh.terrainHeightTex;
    if (
      texture &&
      width > 0 &&
      height > 0 &&
      width + x <= state.voxel.shape[0] &&
      height + y <= state.voxel.shape[2]
    ) {
      texture.update(new Uint8Array(data).subarray(0, width * height), {
        size: [width, height],
        dataLayout: { bytesPerRow: width },
        origin: [x, y],
      });
    }
  },
  destroyChunks: (state) => {
    state.gpuVoxelMesh.chunksDirty = true;
    for (let i = 0; i < state.gpuVoxelMesh.chunks.length; ++i) {
      clearChunk(state.gpuVoxelMesh.chunks[i], false);
    }
    state.gpuVoxelMesh.nx = 0;
    state.gpuVoxelMesh.ny = 0;
    state.gpuVoxelMesh.nz = 0;
    GPUVoxelChunkListSchema.free(state.gpuVoxelMesh.chunks);
    state.gpuVoxelMesh.chunks = GPUVoxelChunkListSchema.clone(
      GPUVoxelChunkListSchema.identity,
    );
  },
};

function initChunkGeom(geom: GPUVoxelGeom, ix: number, iy: number, iz: number) {
  geom.index[0] = ix;
  geom.index[1] = iy;
  geom.index[2] = iz;

  geom.indexBufferDescriptor = null;
  geom.vertBuffer?.destroy();
  geom.vertBuffer = null;

  geom.count = 0;

  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
}

function initChunk(chunk: GPUVoxelChunk, ix: number, iy: number, iz: number) {
  chunk.index[0] = ix;
  chunk.index[1] = iy;
  chunk.index[2] = iz;

  initChunkGeom(chunk.fluidGeom, ix, iy, iz);
  initChunkGeom(chunk.geom, ix, iy, iz);
  initChunkGeom(chunk.alphaGeom, ix, iy, iz);
}

function updateChunkGeometry(
  rewgpu: ReWGPU,
  gpuState: GPUState,
  geom: GPUVoxelGeom,
  data_: Uint8Array,
  bounds: BoundingBox,
  size: number,
) {
  const count = (6 * data_.length) / (4 * size);
  geom.indexBufferDescriptor = getQuadIndexBuffer(gpuState, count);
  geom.count = count;

  let data = data_;
  // 在rust渲染中，当size为8（水地形数据）时，使用indexBuffer渲染会出错
  // 换成直接拓展data数据就可以。目前还不知道为什么但表现是这样的【。
  if (!geom.indexBufferDescriptor || size === 8) {
    geom.indexBufferDescriptor = null;
    data = expandQuad(data, size);
    geom.count = data.length / size;
  }

  if (data.length > 0) {
    geom.vertBuffer?.destroy();
    geom.vertBuffer = rewgpu.buffer({
      data,
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX,
    });
  } else {
    clearChunkGeometry(geom);
  }

  geom.minX = bounds.minX;
  geom.minY = bounds.minY;
  geom.minZ = bounds.minZ;
  geom.maxX = bounds.maxX;
  geom.maxY = bounds.maxY;
  geom.maxZ = bounds.maxZ;
}

function clearChunkGeometry(geom: GPUVoxelGeom) {
  if (geom.vertBuffer) {
    geom.vertBuffer.destroy();
    geom.vertBuffer = null;
  }

  geom.indexBufferDescriptor = null;
  geom.count = 0;
  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
}

function clearChunk(chunk: GPUVoxelChunk, solid: boolean) {
  clearChunkGeometry(chunk.geom);
  clearChunkGeometry(chunk.alphaGeom);
  clearChunkGeometry(chunk.fluidGeom);
  if (solid) {
    chunk.posX =
      chunk.posY =
      chunk.posZ =
      chunk.negX =
      chunk.negY =
      chunk.negZ =
        0;
  } else {
    chunk.posX = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.POS_X;
    chunk.posY = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.POS_Y;
    chunk.posZ = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.POS_Z;
    chunk.negX = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.NEG_X;
    chunk.negY = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.NEG_Y;
    chunk.negZ = ChunkVisibilityFlags.MASK & ~ChunkVisibilityFlags.NEG_Z;
  }
}
