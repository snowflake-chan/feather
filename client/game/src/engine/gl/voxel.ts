import { REGL, REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import {
  GLVoxelGeom,
  GLVoxelFluidGeom,
} from '../voxel/gl-voxel/gl-voxel-schema';
import { updateTexture, restoreTexture } from './texture';
import { ENGINE_RES } from '../../resource/engine';
import { prepareVoxels, renderVoxelsShadow } from '../voxel/voxel-controller';
import { Frustum } from '@box/schema/utils/frustum-schema';

const TRIVIAL_FRAG = `void main() { gl_FragColor = vec4(1); }`;

function compareInvDistance<T extends { distance: number }>(a: T, b: T) {
  return a.distance - b.distance;
}

export default function (regl: REGL, loader: REGLLoader) {
  function update(state: GameClientState) {
    const magFilter = state.settings.lowQualityTextures ? 'nearest' : 'linear';
    const minFilter = state.settings.lowQualityTextures ? 'nearest' : 'mipmap';
    const useMipmap = (state.gl.mipmapEnabled =
      state.gl.hasTextureLOD && !state.settings.lowQualityTextures);
    const mipFilter = useMipmap ? 'nearest mipmap linear' : 'nearest';

    const voxelState = state.voxelMesh;

    if (useMipmap) {
      updateTexture(
        voxelState.colorAtlasTexture,
        state,
        0,
        state.blockInfo.colorAtlas,
        mipFilter,
        'nearest',
        'clamp',
        'rgba',
      );
      updateTexture(
        voxelState.bumpAtlasTexture,
        state,
        0,
        state.blockInfo.bumpAtlas,
        mipFilter,
        magFilter,
        'clamp',
        'rgba',
      );
      updateTexture(
        voxelState.materialAtlasTexture,
        state,
        0,
        state.blockInfo.materialAtlas,
        mipFilter,
        'nearest',
        'clamp',
        'rgba',
      );
    } else {
      updateTexture(
        voxelState.colorAtlasTexture,
        state,
        state.blockInfo.atlasRadius << 4,
        state.blockInfo.colorAtlas.length > 0
          ? [state.blockInfo.colorAtlas[0]]
          : [],
        'nearest',
        'nearest',
        'clamp',
        'rgba',
      );
      updateTexture(
        voxelState.bumpAtlasTexture,
        state,
        state.blockInfo.atlasRadius << 6,
        state.blockInfo.bumpAtlas.length > 0
          ? [state.blockInfo.bumpAtlas[0]]
          : [],
        magFilter,
        magFilter,
        'clamp',
        'rgba',
      );
      updateTexture(
        voxelState.materialAtlasTexture,
        state,
        state.blockInfo.atlasRadius << 4,
        state.blockInfo.materialAtlas.length > 0
          ? [state.blockInfo.materialAtlas[0]]
          : [],
        'nearest',
        'nearest',
        'clamp',
        'rgba',
      );
    }
    updateTexture(
      voxelState.waterBumpTexture,
      state,
      256,
      [ENGINE_RES.water],
      'linear mipmap linear',
      'linear',
      'repeat',
      'rgba',
    );
  }

  function restore(state: GameClientState) {
    const voxelState = state.voxelMesh;
    restoreTexture(voxelState.colorAtlasTexture);
    restoreTexture(voxelState.materialAtlasTexture);
    restoreTexture(voxelState.bumpAtlasTexture);
    restoreTexture(voxelState.waterBumpTexture);
  }

  const FLUID_SYMBOLS = {
    COLOR_LUT: (state: GameClientState) =>
      state.postProcess.lutEnabled && !state.postProcess.enabled,
    SHADOW: (state: GameClientState) => state.shadow.enable,
    BAKED_SHADOW: (state: GameClientState) => state.shadow.enableBakedShadow,
    HDR: (state: GameClientState) => state.postProcess.enabled,
    PCF: (state: GameClientState) => state.settings.shadowFilter,
    MIPMAP: (state: GameClientState) => state.gl.mipmapEnabled,
  };

  const SYMBOLS = {
    SAFE: (state: GameClientState) => state.settings.safeShaders,
    ATLAS_RADIUS: (state: GameClientState) => state.blockInfo.atlasRadius << 4,
    ...FLUID_SYMBOLS,
  };

  const geomProp = safeProp<GLVoxelGeom>(regl);

  const baseChunk = {
    frag: require('./glsl/voxel_frag.glsl'),
    vert: require('./glsl/voxel_vert.glsl'),

    cull: {
      enable: true,
      face: <'back'>'back',
    },

    depth: {
      enable: true,
      mask: true,
      func: <'<='>'<=',
    },

    uniforms: {
      chunkId: geomProp('index').prop,
    },

    vao: geomProp('vao').prop,

    attributes: {
      s0: 0,
      s1: 1,
      s2: 2,
      s3: 3,
    },

    offset: 0,
    primitive: <'triangles'>'triangles',
    count: geomProp('count').prop,
  };

  const drawChunksShadow = loader.cache(
    'voxels:shadow',
    Object.assign({}, baseChunk, {
      frag: require('./glsl/shadow_frag.glsl'),
      vert: require('./glsl/voxel_shadow_vert.glsl'),
    }),
    true,
  );

  const drawChunks = loader.cache(
    'voxels:forward-parallax',
    Object.assign({}, baseChunk, {
      frag: `#define PARALLAX_MAP 1.
${baseChunk.frag}`,
    }),
    true,
    SYMBOLS,
  );

  const drawNoParallaxChunks = loader.cache(
    'voxels:forward',
    baseChunk,
    true,
    SYMBOLS,
  );

  const drawChunksAlpha = loader.cache(
    'voxels:alpha',
    Object.assign({}, baseChunk, {
      frag: `#define ALPHA_PASS 1
#define PARALLAX_MAP 1
${baseChunk.frag}`,
      blend: {
        enable: true,
        func: <any>{
          srcRGB: '1',
          srcAlpha: '0',
          dstRGB: 'one minus src alpha',
          dstAlpha: '1',
        },
        equation: <any>'add',
      },

      depth: {
        enable: true,
        mask: false,
        func: <any>'<=',
      },
    }),
    true,
    SYMBOLS,
  );

  const drawChunksAlphaNoParallax = loader.cache(
    'voxels:alpha',
    Object.assign({}, baseChunk, {
      frag: `#define ALPHA_PASS 1
${baseChunk.frag}`,
      blend: <any>{
        enable: true,
        func: {
          srcRGB: '1',
          srcAlpha: '0',
          dstRGB: 'one minus src alpha',
          dstAlpha: '1',
        },
        equation: <any>'add',
      },

      depth: {
        enable: true,
        mask: false,
        func: <any>'<=',
      },
    }),
    true,
    SYMBOLS,
  );

  const drawChunksDepth = loader.cache(
    'voxels:depth',
    Object.assign({}, baseChunk, {
      frag: TRIVIAL_FRAG,
      vert: `#define DEPTH 1
${baseChunk.vert}`,
      colorMask: <any>[false, false, false, false],
      depth: <any>{
        enable: true,
        mask: true,
        func: '<=',
      },
    }),
    true,
  );

  const fluidProp = safeProp<GLVoxelFluidGeom>(regl);

  const fluidParams = Object.assign({}, baseChunk, {
    frag: require('./glsl/voxel_fluid_frag.glsl'),
    vert: require('./glsl/voxel_fluid_vert.glsl'),

    blend: <any>{
      enable: true,
      func: {
        src: 1,
        dst: 'one minus src alpha',
      },
      equation: 'add',
    },

    uniforms: {
      chunkId: fluidProp('index').prop,
    },

    vao: fluidProp('vao').prop,

    attributes: {
      s0: 0,
      s1: 1,
    },

    cull: {
      enable: true,
      face: 'back',
    },

    depth: <any>{
      enable: true,
      mask: true,
      func: '<=',
    },

    offset: 0,
    primitive: <'triangles'>'triangles',
    count: fluidProp('count').prop,
  });

  const drawChunksFluid = loader.cache(
    'voxels:fluid',
    fluidParams,
    true,
    FLUID_SYMBOLS,
  );

  const drawChunksFluidDepth = loader.cache(
    'voxels:fluid,depth',
    Object.assign({}, fluidParams, {
      frag: TRIVIAL_FRAG,
      vert: require('./glsl/voxel_fluid_vert_depth.glsl'),

      colorMask: <any>[false, false, false, false],
      blend: <any>{
        enable: false,
      },
    }),
    true,
  );

  function renderVoxelsForward(state: GameClientState) {
    const { parallaxChunks, noParallaxChunks } = state.voxelMesh;
    if (parallaxChunks.length > 0) {
      drawChunks(state)(parallaxChunks);
    }
    if (noParallaxChunks.length > 0) {
      drawNoParallaxChunks(state)(noParallaxChunks);
    }
  }

  function alphaPrepass(state: GameClientState) {
    const { alphaParallaxChunks, alphaNoParallaxChunks, fluidChunks } =
      state.voxelMesh;
    if (alphaParallaxChunks.length > 0) {
      drawChunksDepth(alphaParallaxChunks);
    }
    if (alphaNoParallaxChunks.length > 0) {
      drawChunksDepth(alphaNoParallaxChunks);
    }
    if (fluidChunks.length > 0) {
      drawChunksFluidDepth(fluidChunks);
    }
  }

  function alphaPass(state: GameClientState) {
    const { alphaParallaxChunks, alphaNoParallaxChunks, fluidChunks } =
      state.voxelMesh;
    if (alphaParallaxChunks.length > 0) {
      drawChunksAlpha(state)(alphaParallaxChunks);
    }
    if (alphaNoParallaxChunks.length > 0) {
      drawChunksAlphaNoParallax(state)(alphaNoParallaxChunks);
    }
    if (fluidChunks.length > 0) {
      drawChunksFluid(state)(fluidChunks);
    }
  }

  return {
    update,
    restore,
    setup: (state: GameClientState) => {
      prepareVoxels(state);
      const {
        alphaNoParallaxChunks,
        alphaParallaxChunks,
        parallaxChunks,
        noParallaxChunks,
        fluidChunks,
      } = state.voxelMesh;
      alphaNoParallaxChunks.sort(compareInvDistance);
      alphaParallaxChunks.sort(compareInvDistance);
      parallaxChunks.sort(compareInvDistance);
      noParallaxChunks.sort(compareInvDistance);
      fluidChunks.sort(compareInvDistance);
    },
    forward: renderVoxelsForward,
    alphaPre: alphaPrepass,
    alpha: alphaPass,
    shadow: (state: GameClientState, shadowFrustum: Frustum) => {
      renderVoxelsShadow(state.environment, state.voxelMesh, shadowFrustum);
      state.voxelMesh.shadowChunks.sort(compareInvDistance);
      drawChunksShadow(state.voxelMesh.shadowChunks);
    },
  };
}
