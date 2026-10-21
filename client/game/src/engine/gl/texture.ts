import { Hash } from '@box/schema/content-server/index';
import { GLTexture } from './schema/gl-texture';
import { GameClientState } from '../game-client-schema';
import { REGL, REGLLoader, safeProp } from './regl';
import {
  GLTextureInstanceList,
  GLTextureInstance,
} from '../mesh/gl-controller/gl-mesh-schema';

export function restoreTexture(out: GLTexture) {
  if (out.texture) {
    out.texture(<any>out);
  }
  if (out.cube) {
    out.cube(<any>out);
  }
}

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

export function updateTexture(
  out: GLTexture,
  state: GameClientState,
  defaultRadius: number,
  reqHashes: Hash[],
  min: string,
  mag: string,
  wrap: string,
  format: string,
  useCube: boolean = false,
) {
  if (
    hashesEqual(out.hashes, reqHashes) &&
    out.min === min &&
    out.mag === mag &&
    out.wrap === wrap &&
    out.format === format &&
    (out.texture || out.cube || reqHashes.length <= 0)
  ) {
    return;
  }
  const regl = state.gl.regl;
  if (!regl) {
    return;
  }
  const images: (HTMLImageElement | ImageBitmap)[] = [];
  const hashes = out.hashes;
  hashes.length = 0;
  const radius = defaultRadius || 1 << (reqHashes.length - 1);

  out.wrap = wrap;
  out.mag = mag;
  out.min = min;
  out.format = format;
  for (let i = 0; i < reqHashes.length; ++i) {
    const req = state.content.fetchImage(reqHashes[i]);
    if (!req.loaded || !req.image) {
      hashes.length = 0;
      if (!out.texture && !out.cube) {
        out.radius = radius;
        delete (<any>out).mipmap;
        delete (<any>out).data;
        delete (<any>out).faces;
        if (useCube) {
          out.cube = regl.cube(<any>out);
        } else {
          out.texture = regl.texture(<any>out);
        }
      }
      return;
    }
    images.push(req.image);
    hashes.push(reqHashes[i]);
  }

  if (useCube && images.length === 6) {
    out.faces = images;
    delete (<any>out).data;
    delete (<any>out).mipmap;
  } else if (images.length === 0) {
    out.radius = radius;
    delete (<any>out).data;
    delete (<any>out).mipmap;
    delete (<any>out).faces;
  } else if (images.length === 1) {
    out.data = images[0];
    delete (<any>out).mipmap;
    delete (<any>out).radius;
    delete (<any>out).faces;
  } else {
    out.radius = radius;
    out.mipmap = images;
    delete (<any>out).data;
    delete (<any>out).faces;
  }

  if (useCube && images.length === 6) {
    out.cube ? out.cube(<any>out) : (out.cube = regl.cube(<any>out));
  } else {
    out.texture
      ? out.texture(<any>out)
      : (out.texture = regl.texture(<any>out));
  }
}

export function glTexture(regl: REGL, loader: REGLLoader) {
  const stateProp = safeProp<GLTextureInstance>(regl);

  const drawGLTexture = loader.cache(
    'gl-texture',
    {
      frag: require('../../engine/gl/glsl/texture_frag.glsl'),
      vert: require('../../engine/gl/glsl/texture_vert.glsl'),
      uniforms: {
        model: stateProp('model').prop,
        texture: stateProp('texture').prop,
      },
      attributes: {
        vertex: stateProp('vertex').prop,
        uv: stateProp('uv').prop,
      },
      primitive: 'triangle fan',
      count: 4,
    },
    true,
    {
      COLOR_LUT: (state: GameClientState) =>
        state.postProcess.lutEnabled && !state.postProcess.enabled,
      HDR: (state: GameClientState) => state.postProcess.enabled,
    },
  );

  return {
    forward: (state: GameClientState, textureList: GLTextureInstanceList) => {
      for (let i = 0; i < textureList.length; i++) {
        drawGLTexture(state)(textureList[i]);
      }
    },
  };
}
