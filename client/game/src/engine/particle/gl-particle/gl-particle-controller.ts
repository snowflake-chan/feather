import { PARTICLE_SIZE, ParticleRenderer } from '../interface';

export const GLParticleRenderer: ParticleRenderer = {
  initBuffer: (state) => {
    const regl = state.gl.regl;
    if (!regl) {
      return;
    }
    state.glParticles.particleBackBuffer = regl.buffer({
      length: PARTICLE_SIZE * state.settings.maxParticles,
      type: 'float',
      usage: 'dynamic',
    });
    state.glParticles.particleBackVAO = regl.vao([
      {
        offset: 0,
        stride: PARTICLE_SIZE,
        type: 'float',
        buffer: state.glParticles.particleBackBuffer,
        size: 4,
      },
      {
        offset: 16,
        stride: PARTICLE_SIZE,
        type: 'float',
        buffer: state.glParticles.particleBackBuffer,
        size: 4,
      },
    ]);
    state.glParticles.particleBuffer = regl.buffer({
      length: PARTICLE_SIZE * state.settings.maxParticles,
      type: 'float',
      usage: 'dynamic',
    });
    state.glParticles.particleVAO = regl.vao([
      {
        offset: 0,
        stride: PARTICLE_SIZE,
        type: 'float',
        buffer: state.glParticles.particleBuffer,
        size: 4,
      },
      {
        offset: 16,
        stride: PARTICLE_SIZE,
        type: 'float',
        buffer: state.glParticles.particleBuffer,
        size: 4,
      },
    ]);
  },
  updateParticleData: (state, stream, count, offset) => {
    const buffer = state.glParticles.particleBackBuffer;
    if (buffer) {
      const bytes = stream.buffer.uint8.subarray(
        offset,
        offset + PARTICLE_SIZE * count,
      );
      if (bytes.length > (<any>buffer)._buffer.byteLength) {
        buffer({
          data: bytes,
          type: 'float',
          usage: 'dynamic',
        });
        const vao = state.glParticles.particleBackVAO;
        if (vao) {
          vao([
            {
              offset: 0,
              stride: 32,
              type: 'float',
              buffer,
              size: 4,
            },
            {
              offset: 16,
              stride: 32,
              type: 'float',
              buffer,
              size: 4,
            },
          ]);
        }
      } else {
        buffer.subdata(bytes);
      }
    }
  },
};
