import { IREWGPUSampler, REWGPUType } from './interface';

export class SamplerManager {
  constructor(private device: GPUDevice) {}
  private samplerCount = 0;
  private samplerSet: Map<number, REWGPUSampler> = new Map<
    number,
    REWGPUSampler
  >();

  public create(descriptor?: GPUSamplerDescriptor) {
    const sampler = this.device.createSampler(descriptor);
    const reSampler = new REWGPUSampler(
      this.samplerSet,
      this.samplerCount++,
      sampler,
    );
    this.samplerSet.set(reSampler.id, reSampler);

    return reSampler;
  }

  public destroy() {
    for (const [_, reSampler] of this.samplerSet) {
      reSampler.destroy();
    }

    this.samplerSet.clear();
    this.samplerCount = 0;
  }
}

class REWGPUSampler implements IREWGPUSampler {
  public readonly type = REWGPUType.Sampler;
  constructor(
    private cache: Map<number, REWGPUSampler>,
    public id: number,
    public sampler?: GPUSampler,
  ) {}

  public destroy() {
    this.sampler = undefined;
    this.cache.delete(this.id);
  }
}
