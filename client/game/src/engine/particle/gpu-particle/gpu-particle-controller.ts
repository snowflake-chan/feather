import { PARTICLE_SIZE, ParticleRenderer } from '../interface';

export const GPUParticleRenderer: ParticleRenderer = {
  initBuffer: (state) => {
    const rewgpu = state.gpu.rewgpu;
    if (!rewgpu) {
      return;
    }

    state.gpuParticles.particleBackBuffer = rewgpu.buffer({
      label: 'particle',
      size: PARTICLE_SIZE * state.settings.maxParticles,
      usage: GPUBufferUsage.VERTEX,
    });

    state.gpuParticles.particleBuffer = rewgpu.buffer({
      label: 'particle',
      size: PARTICLE_SIZE * state.settings.maxParticles,
      usage: GPUBufferUsage.VERTEX,
    });
  },
  updateParticleData: (state, stream, count, offset) => {
    const rewgpu = state.gpu.rewgpu;
    if (!rewgpu) {
      return;
    }

    const bytes = stream.buffer.uint8.subarray(
      offset,
      offset + PARTICLE_SIZE * count,
    );
    if (
      state.gpuParticles.particleBackBuffer?.buffer?.size &&
      bytes.byteLength > state.gpuParticles.particleBackBuffer?.buffer?.size
    ) {
      state.gpuParticles.particleBackBuffer?.destroy();
      state.gpuParticles.particleBackBuffer = rewgpu.buffer({
        label: 'particle',
        size: bytes.byteLength,
        usage: GPUBufferUsage.VERTEX,
      });
    }
    state.gpuParticles.particleBackBuffer?.update(bytes);
  },
};
