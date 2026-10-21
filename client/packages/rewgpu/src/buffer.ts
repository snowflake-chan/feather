import { BufferDescriptor, IREWGPUBuffer, REWGPUType } from './interface';

export class BufferManager {
  constructor(private device: GPUDevice) {}
  private bufferCount = 0;
  private bufferSet: Map<number, REWGPUBuffer> = new Map<
    number,
    REWGPUBuffer
  >();

  private dynamicBufferSet: Map<number, REWGPUBuffer> = new Map<
    number,
    REWGPUBuffer
  >();

  public create(descriptor: BufferDescriptor) {
    const { label, data, size, usage, isDynamic } = descriptor;
    const buffer = this.device.createBuffer({
      label,
      size,
      usage: usage | GPUBufferUsage.COPY_DST,
    });
    if (data) {
      this.device.queue.writeBuffer(buffer, 0, data);
    }
    const cache = isDynamic ? this.dynamicBufferSet : this.bufferSet;
    const reBuffer = new REWGPUBuffer(
      this.device,
      cache,
      this.bufferCount++,
      buffer,
      isDynamic ? data : undefined,
    );
    cache.set(reBuffer.id, reBuffer);

    return reBuffer;
  }

  public update() {
    for (const [_, reBuffer] of this.dynamicBufferSet) {
      if (!reBuffer.buffer || !reBuffer.data) {
        continue;
      }
      this.device.queue.writeBuffer(reBuffer.buffer, 0, reBuffer.data);
    }
  }

  public destroy() {
    for (const [_, reBuffer] of this.bufferSet) {
      reBuffer.destroy();
    }
    this.bufferSet.clear();

    for (const [_, reBuffer] of this.dynamicBufferSet) {
      reBuffer.destroy();
    }
    this.dynamicBufferSet.clear();

    this.bufferCount = 0;
  }
}

class REWGPUBuffer implements IREWGPUBuffer {
  public readonly type = REWGPUType.Buffer;
  public groupSize?: number;
  constructor(
    private device: GPUDevice,
    private cache: Map<number, REWGPUBuffer>,
    public id: number,
    public buffer?: GPUBuffer,
    public data?: SharedArrayBuffer | BufferSource,
  ) {}

  public update(
    data: SharedArrayBuffer | BufferSource,
    bufferOffset = 0,
    dataOffset?: number,
    size?: number,
  ) {
    if (!this.buffer) {
      return;
    }
    this.device.queue.writeBuffer(
      this.buffer,
      bufferOffset,
      data,
      dataOffset,
      size,
    );

    if (this.data) {
      this.data = data;
    }
  }

  public destroy() {
    this.buffer?.destroy();
    this.buffer = undefined;
    this.data = undefined;
    this.cache.delete(this.id);
  }
}
