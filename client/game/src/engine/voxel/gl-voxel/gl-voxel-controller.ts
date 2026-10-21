import REGL from 'regl';

import { VoxelRenderer } from '../interface';
import { GLState } from '../../gl/schema/gl-schema';
import { BoundingBox } from '../voxel-worker-schema';
import { FLUID_VERTEX_SIZE, VERTEX_SIZE } from '../voxel-mesher';
import { ChunkVisibilityFlags } from '../visibility-flags';
import { getQuadElements, expandQuad } from '../../gl/quad';
import {
  GLVoxelGeom,
  GLVoxelFluidGeom,
  GLVoxelChunk,
  GLVoxelChunkSchema,
  GLVoxelChunkListSchema,
} from './gl-voxel-schema';

export const GLRenderer: VoxelRenderer<'gl'> = {
  getVoxelState: (state) => {
    return state.voxelMesh;
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
    const regl = state.gl.regl;
    if (!regl) {
      return;
    }
    const glState = state.gl;
    updateChunkGeometry(regl, glState, chunk.geom, meshData, meshBounds);
    updateChunkGeometry(regl, glState, chunk.alphaGeom, alphaData, alphaBounds);
    updateChunkFluidGeometry(
      regl,
      glState,
      chunk.fluidGeom,
      fluidData,
      fluidBounds,
    );
  },
  clearChunk: (state, chunk, solid) => clearChunk(chunk, solid),
  resetChunks: (state, mesh) => {
    for (let i = 0; i < mesh.chunks.length; ++i) {
      clearChunk(mesh.chunks[i], false);
    }
    GLVoxelChunkListSchema.assign(mesh.chunks, []);
  },
  initChunks: (state, mesh, cx, cy, cz) => {
    for (let k = 0; k < cz; ++k) {
      for (let j = 0; j < cy; ++j) {
        for (let i = 0; i < cx; ++i) {
          const chunk = GLVoxelChunkSchema.clone(GLVoxelChunkSchema.identity);
          initChunk(chunk, i, j, k);
          mesh.chunks.push(chunk);
        }
      }
    }
  },
  clearHeightTexture: (state) => {
    const regl = state.gl.regl;
    if (!regl) {
      return;
    }

    const nx = state.voxel.shape[0];
    const nz = state.voxel.shape[2];

    if (state.voxelMesh.terrainHeightTex) {
      state.voxelMesh.terrainHeightTex({
        width: nx,
        height: nz,
        data: null,
        format: 'luminance',
        type: 'uint8',
        min: 'nearest',
        mag: 'nearest',
        wrap: 'clamp',
      });
    } else {
      state.voxelMesh.terrainHeightTex = regl.texture({
        width: nx,
        height: nz,
        data: null,
        format: 'luminance',
        type: 'uint8',
        min: 'nearest',
        mag: 'nearest',
        wrap: 'clamp',
      });
    }
  },
  updateHeightmap(state, x, y, width, height, data) {
    const texture = state.voxelMesh.terrainHeightTex;
    if (
      texture &&
      width > 0 &&
      height > 0 &&
      width + x <= state.voxel.shape[0] &&
      height + y <= state.voxel.shape[2]
    ) {
      texture.subimage(
        {
          width: width,
          height: height,
          data: new Uint8Array(data).subarray(0, width * height),
        },
        x,
        y,
        0,
      );
    }
  },
  destroyChunks: (state) => {
    for (let i = 0; i < state.voxelMesh.chunks.length; ++i) {
      clearChunk(state.voxelMesh.chunks[i], false);
    }
    state.voxelMesh.nx = 0;
    state.voxelMesh.ny = 0;
    state.voxelMesh.nz = 0;
    GLVoxelChunkListSchema.free(state.voxelMesh.chunks);
    state.voxelMesh.chunks = GLVoxelChunkListSchema.clone(
      GLVoxelChunkListSchema.identity,
    );
  },
};

function updateChunkGeometry(
  regl: REGL.Regl,
  glState: GLState,
  geom: GLVoxelGeom,
  data_: Uint8Array,
  bounds: BoundingBox,
) {
  const count = (6 * data_.length) / (4 * VERTEX_SIZE);
  const elements = getQuadElements(glState, count);

  let data = data_;
  if (!elements) {
    data = expandQuad(data, VERTEX_SIZE);
  }

  geom.count = count;

  if (data.length > 0) {
    if (geom.vbo) {
      geom.vbo(data);
    } else {
      geom.vbo =
        geom.attrib0.buffer =
        geom.attrib1.buffer =
        geom.attrib2.buffer =
        geom.attrib3.buffer =
          regl.buffer(data);
    }
    if (geom.vao) {
      geom.vao({
        attributes: [geom.attrib0, geom.attrib1, geom.attrib2, geom.attrib3],
        elements,
        offset: 0,
        primitive: 'triangles',
        instances: -1,
      });
    } else {
      geom.vao = regl.vao({
        attributes: [geom.attrib0, geom.attrib1, geom.attrib2, geom.attrib3],
        elements,
        offset: 0,
        primitive: 'triangles',
        instances: -1,
      });
    }
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

function clearChunkGeometry(geom: GLVoxelGeom) {
  if (geom.vbo) {
    geom.vbo.destroy();
    geom.vbo =
      geom.attrib0.buffer =
      geom.attrib1.buffer =
      geom.attrib2.buffer =
      geom.attrib3.buffer =
        null;
  }
  if (geom.vao) {
    geom.vao.destroy();
    geom.vao = null;
  }
  geom.count = 0;
  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
}

function updateChunkFluidGeometry(
  regl: REGL.Regl,
  glState: GLState,
  geom: GLVoxelFluidGeom,
  data_: Uint8Array,
  bounds: BoundingBox,
) {
  const count = (geom.count = (6 * data_.length) / (4 * FLUID_VERTEX_SIZE));
  const elements = getQuadElements(glState, count);

  let data = data_;
  if (!elements) {
    data = expandQuad(data_, 8);
  }

  if (data.length > 0) {
    if (geom.vbo) {
      geom.vbo(data);
    } else {
      geom.vbo = geom.attrib0.buffer = geom.attrib1.buffer = regl.buffer(data);
    }
    if (geom.vao) {
      geom.vao({
        attributes: [geom.attrib0, geom.attrib1],
        elements,
        offset: 0,
        primitive: 'triangles',
        instances: -1,
      });
    } else {
      geom.vao = regl.vao({
        attributes: [geom.attrib0, geom.attrib1],
        elements,
        offset: 0,
        primitive: 'triangles',
        instances: -1,
      });
    }
  } else {
    clearChunkFluid(geom);
  }
  geom.minX = bounds.minX;
  geom.minY = bounds.minY;
  geom.minZ = bounds.minZ;
  geom.maxX = bounds.maxX;
  geom.maxY = bounds.maxY;
  geom.maxZ = bounds.maxZ;
}

function clearChunkFluid(geom: GLVoxelFluidGeom) {
  if (geom.vbo) {
    geom.vbo.destroy();
    geom.vbo = null;
    geom.attrib0.buffer = null;
    geom.attrib1.buffer = null;
  }
  if (geom.vao) {
    geom.vao.destroy();
    geom.vao = null;
  }
  geom.count = 0;
  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
}

function clearChunk(chunk: GLVoxelChunk, solid: boolean) {
  clearChunkGeometry(chunk.geom);
  clearChunkGeometry(chunk.alphaGeom);
  clearChunkFluid(chunk.fluidGeom);
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

function initChunkGeom(geom: GLVoxelGeom, ix: number, iy: number, iz: number) {
  geom.index[0] = ix;
  geom.index[1] = iy;
  geom.index[2] = iz;

  geom.attrib0.divisor = 0;
  geom.attrib0.normalized = false;
  geom.attrib0.offset = 0;
  geom.attrib0.size = 4;
  geom.attrib0.stride = VERTEX_SIZE;

  geom.attrib1.divisor = 0;
  geom.attrib1.normalized = false;
  geom.attrib1.offset = 4;
  geom.attrib1.size = 4;
  geom.attrib1.stride = VERTEX_SIZE;

  geom.attrib2.divisor = 0;
  geom.attrib2.normalized = false;
  geom.attrib2.offset = 8;
  geom.attrib2.size = 4;
  geom.attrib2.stride = VERTEX_SIZE;

  geom.attrib3.divisor = 0;
  geom.attrib3.normalized = false;
  geom.attrib3.offset = 12;
  geom.attrib3.size = 4;
  geom.attrib3.stride = VERTEX_SIZE;

  geom.count = 0;

  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
  geom.vbo = null;
  geom.vao = null;
}

function initChunkFluid(
  geom: GLVoxelFluidGeom,
  ix: number,
  iy: number,
  iz: number,
) {
  geom.index[0] = ix;
  geom.index[1] = iy;
  geom.index[2] = iz;

  geom.attrib0.divisor = 0;
  geom.attrib0.normalized = false;
  geom.attrib0.offset = 0;
  geom.attrib0.size = 4;
  geom.attrib0.stride = FLUID_VERTEX_SIZE;

  geom.attrib1.divisor = 0;
  geom.attrib1.normalized = false;
  geom.attrib1.offset = 4;
  geom.attrib1.size = 4;
  geom.attrib1.stride = FLUID_VERTEX_SIZE;

  geom.count = 0;

  geom.maxX = geom.maxY = geom.maxZ = -Infinity;
  geom.minX = geom.minY = geom.minZ = Infinity;
  geom.vbo = null;
  geom.vao = null;
}

function initChunk(chunk: GLVoxelChunk, ix: number, iy: number, iz: number) {
  chunk.index[0] = ix;
  chunk.index[1] = iy;
  chunk.index[2] = iz;

  initChunkFluid(chunk.fluidGeom, ix, iy, iz);
  initChunkGeom(chunk.geom, ix, iy, iz);
  initChunkGeom(chunk.alphaGeom, ix, iy, iz);
}
