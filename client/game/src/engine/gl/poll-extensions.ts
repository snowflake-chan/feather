import { GameClientState } from '../game-client-schema';

export function pollExtensions(state: GameClientState) {
  const regl = state.gl.regl;
  if (regl) {
    state.gl.hasInstancing = regl.hasExtension('ANGLE_instanced_arrays');
    state.gl.hasTextureLOD = regl.hasExtension('EXT_shader_texture_lod');
  } else {
    state.gl.hasInstancing = false;
    state.gl.hasTextureLOD = false;
  }
}
