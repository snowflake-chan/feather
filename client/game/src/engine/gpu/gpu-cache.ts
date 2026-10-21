import { initWebGPU, ReWGPU, type GPUConfig, createREWGPU } from '@box/rewgpu';
import { gpuMain } from './main';

interface ReGPUCache {
  rewgpu: ReWGPU;
  gpu: ReturnType<typeof gpuMain>;
  config: GPUConfig;
}

let cachedConfig: GPUConfig | undefined;
let cachedRewgpu: ReWGPU | undefined;
let cachedGpu: ReturnType<typeof gpuMain> | undefined;

/**
 * 以单例的方式创建ReGPU相关资源，以便外部复用
 */
export async function getReWGPU(
  canvas: HTMLCanvasElement,
): Promise<ReGPUCache> {
  if (!cachedConfig) {
    cachedConfig = await initWebGPU();
  }

  if (!cachedRewgpu || !cachedGpu) {
    cachedRewgpu = await createREWGPU(canvas, cachedConfig);

    // Load main webgpu render procedure
    cachedGpu = gpuMain(cachedRewgpu);
  }

  return {
    rewgpu: cachedRewgpu,
    gpu: cachedGpu,
    config: cachedConfig,
  };
}
