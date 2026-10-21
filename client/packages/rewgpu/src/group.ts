import { IREWGPUGroup, REWGPUType, GroupDescriptor } from './interface';
import {
  isREWGPUBuffer,
  isREWGPUCube,
  isREWGPUSampler,
  isREWGPUTexture,
} from './util';

export class GroupManager {
  constructor(private device: GPUDevice) {}
  private groupCount = 0;
  private groupSet: Map<number, REWGPUGroup> = new Map<number, REWGPUGroup>();
  private tempEntries: Set<GPUBindGroupEntry> = new Set<GPUBindGroupEntry>();

  public create(descriptor: GroupDescriptor) {
    this.tempEntries.clear();
    descriptor.entries.forEach((i) => {
      let resource: GPUBindingResource | undefined;
      if (isREWGPUBuffer(i.resource) && i.resource.buffer) {
        resource = { buffer: i.resource.buffer, size: i.resource.groupSize };
      }
      if (isREWGPUTexture(i.resource) && i.resource.texture) {
        resource = i.resource.texture.createView({
          format: i.resource.texture.format,
          mipLevelCount: i.resource.texture.mipLevelCount,
        });
      }
      if (isREWGPUCube(i.resource) && i.resource.texture) {
        resource = i.resource.texture.createView({ dimension: 'cube' });
      }
      if (isREWGPUSampler(i.resource) && i.resource.sampler) {
        resource = i.resource.sampler;
      }
      if (!resource) {
        return;
      }

      this.tempEntries.add({
        binding: i.binding,
        resource,
      });
    });
    const group = this.device.createBindGroup({
      label: descriptor.label,
      layout: descriptor.layout,
      entries: this.tempEntries.values(),
    });
    const reGroup = new REWGPUGroup(this.groupSet, this.groupCount++, group);
    this.groupSet.set(reGroup.id, reGroup);
    this.tempEntries.clear();
    return reGroup;
  }

  public destroy() {
    for (const [_, reSampler] of this.groupSet) {
      reSampler.destroy();
    }

    this.groupSet.clear();
    this.groupCount = 0;
    this.tempEntries.clear();
  }
}

class REWGPUGroup implements IREWGPUGroup {
  public readonly type = REWGPUType.Group;
  public dynamicOffsets?: number[];
  constructor(
    private cache: Map<number, REWGPUGroup>,
    public id: number,
    public group?: GPUBindGroup,
  ) {}

  public destroy() {
    this.group = undefined;
    this.cache.delete(this.id);
  }
}
