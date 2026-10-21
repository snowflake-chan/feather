import { REGL, REGLLoader, safeProp } from './regl';
import { GameClientState } from '../game-client-schema';
import { ClientParticleGroupSchema } from '../particle/particle-client-state';

export default function (regl: REGL, loader: REGLLoader) {
  const particleProp =
    safeProp<typeof ClientParticleGroupSchema.identity>(regl);

  const drawParticleGroups = loader.cache(
    'particles',
    {
      frag: require('./glsl/particle_frag.glsl'),
      vert: require('./glsl/particle_vert.glsl'),

      uniforms: {
        'colorSize[0]': particleProp('rgbSize0').prop,
        'colorSize[1]': particleProp('rgbSize1').prop,
        'colorSize[2]': particleProp('rgbSize2').prop,
        'colorSize[3]': particleProp('rgbSize3').prop,
        'colorSize[4]': particleProp('rgbSize4').prop,
        'forceNoise': particleProp('forceNoise').prop,
        'miscVector': particleProp('miscVector').prop,
        'targetVector': particleProp('targetVector').prop,
      },

      attributes: {
        s0: 0,
        s1: 1,
      },

      vao: regl.context(<any>'particleVAO'),

      blend: {
        enable: false,
      },

      offset: particleProp('offset').prop,
      count: particleProp('count').prop,
      primitive: 'points',
    },
    true,
    {
      COLOR_LUT: (state: GameClientState) =>
        state.postProcess.lutEnabled && !state.postProcess.enabled,
      HDR: (state: GameClientState) => state.postProcess.enabled,
    },
  );

  return {
    draw: (state: GameClientState) => {
      if (state.particles.particleGroups.length > 0) {
        drawParticleGroups(state)(state.particles.particleGroups);
      }

      if (state.particles.swapNeeded) {
        const backBuffer = state.glParticles.particleBackBuffer;
        state.glParticles.particleBackBuffer = state.glParticles.particleBuffer;
        state.glParticles.particleBuffer = backBuffer;

        const backVAO = state.glParticles.particleBackVAO;
        state.glParticles.particleBackVAO = state.glParticles.particleVAO;
        state.glParticles.particleVAO = backVAO;

        const backGroups = state.particles.particleBackGroups;
        state.particles.particleBackGroups = state.particles.particleGroups;
        state.particles.particleGroups = backGroups;

        state.particles.swapNeeded = false;
      }
    },
  };
}
