import { log2, nextPow2 } from 'bit-twiddle';
import type {
  BufferDescriptor,
  CommandDescriptor,
  IREWGPUBuffer,
  IREWGPUGroup,
  ReWGPU,
  REWGPUObject,
} from '@box/rewgpu';
import { Spec, UniformStructF32 } from './uniform-pool';

/**
 * 多个uniform数据合并为一个uniform的结构
 * group，data，buffer都是一个
 * struct为多个。个数不固定，看一个buffer放了几个uniform
 */
interface BundleUniformPack<Value extends Spec> {
  group: IREWGPUGroup;
  data: UniformStructF32<Value>['data'];
  buffer: IREWGPUBuffer;
  structs: UniformStructF32<Value>['struct'][];
}

/**
 * 除了uniform以外需要动态更新的buffer数据
 * 目前仅用于模型动画，不需要用的在获取cache的时候不传参就行了
 */
interface ExtraBuffersPack {
  group: IREWGPUGroup;
  buffers: IREWGPUBuffer[];
}

/**
 * bundle cache数据
 */
interface Cache<Value extends Spec> {
  /**
   * 缓存指令数量
   * 用于比对是否重新生成cache
   */
  count: number;
  /**
   * uniform数据
   * 如果多个uniform数据合并的量大于uniform数据binding size最大限制
   * 就会有多个uniform数据
   * 这个数据有多少个外部不需要关心
   * 仅用于updateUniform接口入参
   */
  uniforms: BundleUniformPack<Value>[];
  /**
   * 一个uniform数据中最少包含多少个数据合并
   * 仅用于内部方法free uniform
   */
  oneBufferStructCount: number;
  /**
   * uniform内struct数据
   * 有多少个command cache就有多少个struct
   * 用于外部更新uniform数据
   */
  uniformStructs: UniformStructF32<Value>['struct'][];
  /**
   * bundle cache本体
   * 传给render pass绘制
   */
  bundle: GPURenderBundle;
  /**
   * 除了uniform以外需要动态更新的buffer数据
   * 目前仅用于模型动画，数据更新由外部自己控制
   */
  extraBuffers?: ExtraBuffersPack[];
}

export interface ExtraDynamicBuffers {
  groupIndex: number;
  layout: GPUBindGroupLayout;
  buffersDes: BufferDescriptor[];
  resources?: REWGPUObject[];
}

export class BundleCache<Value extends Spec> {
  private colorFormats: Iterable<GPUTextureFormat | null>;
  private oneUniformLength: number;
  private uniformPool: BundleUniformPack<Value>[][] = [];
  private extraBufferPool: {
    [key: string]: ExtraBuffersPack[];
  } = {};
  private bundleCache: {
    [key: string]: Cache<Value>;
  } = {};

  constructor(
    private rewgpu: ReWGPU,
    private layout: GPUBindGroupLayout,
    private uniformSpec: Value,
    private uniformIdx: number,
    colorFormats?: Iterable<GPUTextureFormat | null>,
    private depthStencilFormat: GPUTextureFormat = 'depth24plus',
  ) {
    this.oneUniformLength = UniformStructF32.calcByteLength(
      uniformSpec,
      rewgpu.config.device.limits.minUniformBufferOffsetAlignment,
    ).byteLength;

    this.colorFormats = colorFormats || [rewgpu.config.presentationFormat];
  }

  private allocUniform(oneBufferStructCount: number, bufferCount: number) {
    const bufferSize = nextPow2(oneBufferStructCount * this.oneUniformLength);
    const idx = log2(bufferSize);
    const structCount = Math.floor(bufferSize / this.oneUniformLength);

    if (!this.uniformPool[idx]) {
      this.uniformPool[idx] = [];
    }

    if (this.uniformPool[idx].length >= bufferCount) {
      return this.uniformPool[idx].splice(0, bufferCount);
    }

    const currPoolLen = this.uniformPool[idx].length;
    const out = this.uniformPool[idx].splice(0, this.uniformPool[idx].length);
    for (let i = 0; i < bufferCount - currPoolLen; i++) {
      const buffer = this.rewgpu.buffer({
        size: bufferSize,
        usage: GPUBufferUsage.UNIFORM,
      });
      // bufferSize为当前合并单元的尺寸
      // groupSize为指定单个绘制指令的uniform尺寸
      // 需要指定为oneUniformLength
      buffer.groupSize = this.oneUniformLength;

      const data = new Float32Array(
        bufferSize / Float32Array.BYTES_PER_ELEMENT,
      );

      const structs: UniformStructF32<Value>['struct'][] = [];
      for (let j = 0; j < structCount; j++) {
        structs.push(
          new UniformStructF32(
            this.uniformSpec,
            data.subarray(
              (j * this.oneUniformLength) / Float32Array.BYTES_PER_ELEMENT,
              (j * this.oneUniformLength + this.oneUniformLength) /
                Float32Array.BYTES_PER_ELEMENT,
            ),
            this.rewgpu.config.device.limits.minUniformBufferOffsetAlignment,
          ).struct,
        );
      }

      out.push({
        buffer,
        data,
        structs,
        group: this.rewgpu.group({
          layout: this.layout,
          entries: [
            {
              binding: 0,
              resource: buffer,
            },
          ],
        }),
      });
    }

    return out;
  }

  private freeUniform(
    oneBufferStructCount: number,
    uniforms: BundleUniformPack<Value>[],
  ) {
    const bufferSize = nextPow2(oneBufferStructCount * this.oneUniformLength);
    const idx = log2(bufferSize);
    if (!this.uniformPool[idx]) {
      this.uniformPool[idx] = [];
    }
    this.uniformPool[idx].push(...uniforms);
  }

  public updateUniform(uniforms: BundleUniformPack<Value>[]) {
    uniforms.forEach((uniform) => {
      uniform.buffer.update(uniform.data);
    });
  }

  private allocExtraBuffers(
    key: string,
    count: number,
    extraDynamicBuffers: ExtraDynamicBuffers,
  ): ExtraBuffersPack[] {
    if (!this.extraBufferPool[key]) {
      this.extraBufferPool[key] = [];
    }
    if (this.extraBufferPool[key].length >= count) {
      return this.extraBufferPool[key].splice(0, count);
    }

    const currPoolLen = this.extraBufferPool[key].length;
    const out = this.extraBufferPool[key].splice(
      0,
      this.extraBufferPool[key].length,
    );
    for (let i = 0; i < count - currPoolLen; i++) {
      const buffers: IREWGPUBuffer[] = [];
      extraDynamicBuffers.buffersDes.forEach((des) => {
        const buffer = this.rewgpu.buffer(des);
        buffers.push(buffer);
      });
      const bufferEntries = buffers.map((b, idx) => {
        return { binding: idx, resource: b };
      });
      const resourceEntries =
        extraDynamicBuffers.resources?.map((r, idx) => {
          return { binding: buffers.length + idx, resource: r };
        }) || [];
      const group = this.rewgpu.group({
        entries: [...bufferEntries, ...resourceEntries],
        layout: extraDynamicBuffers.layout,
      });
      out.push({
        buffers,
        group,
      });
    }

    return out;
  }

  private freeExtraBuffers(key: string, extraBuffers: ExtraBuffersPack[]) {
    if (!this.extraBufferPool[key]) {
      this.extraBufferPool[key] = [];
    }
    this.extraBufferPool[key].push(...extraBuffers);
  }

  /**
   * 根据key(hash值)，绘制缓存数量，command descriptor生成bundle cache
   * @param key 缓存的key。一般为hash值，一般hash值相同的绘制指令只有uniform数据变化，适合用于缓存
   * @param count 缓存指令的数量。为当前hash值绘制的量
   * @param props 要缓存的command descriptor
   * @param extraDynamicBuffers 额外的buffers。选填，入参则会生成除uniform以外可动态修改内部数值的buffer。目前仅用于实体动画
   * @param updateProps 生成每一条绘制指令缓存的时候调用的callback，选填。用于批量生成不同指令缓存，比如地形
   * @returns
   */
  public getBundleCache = (
    key: string,
    count: number,
    props: CommandDescriptor,
    extraDynamicBuffers?: ExtraDynamicBuffers,
    updateProps?: (props: CommandDescriptor, idx: number) => void,
  ) => {
    if (!count) {
      return;
    }

    /**
     * 缓存可复用的标准：缓存指令数量完全一致
     */
    if (this.bundleCache[key] && this.bundleCache[key].count === count) {
      return this.bundleCache[key];
    }

    // 缓存不可复用，先释放缓存
    if (this.bundleCache[key]) {
      this.freeBundleCache(key);
      delete this.bundleCache[key];
    }

    // 如果所有uniform合并到一起(this.oneUniformLength * count)超过了最大绑定尺寸限制this.rewgpu.config.device.limits.maxUniformBufferBindingSize
    // 则需要再切成多个uniform
    const oneBufferStructCount = Math.min(
      Math.floor(
        this.rewgpu.config.device.limits.maxUniformBufferBindingSize /
          this.oneUniformLength,
      ),
      count,
    );
    const bufferCount = Math.ceil(count / oneBufferStructCount);

    const renderBundleEncoder =
      this.rewgpu.config.device.createRenderBundleEncoder({
        colorFormats: this.colorFormats,
        depthStencilFormat: this.depthStencilFormat,
      });

    // 生成除uniform以外动态buffer
    const extraBuffers = extraDynamicBuffers
      ? this.allocExtraBuffers(key, count, extraDynamicBuffers)
      : undefined;

    const uniforms = this.allocUniform(oneBufferStructCount, bufferCount);
    const command = this.rewgpu.createCommand(props);

    for (let i = 0; i < count; i++) {
      if (props.groups) {
        // 计算当前绘制指令的uniform，在uniform合并单元(UniformPack)中的第几个
        const uniformGroupIdx = Math.ceil((i + 1) / oneBufferStructCount) - 1;
        const offsetCount = i % oneBufferStructCount;
        // 计算当前绘制指令的uniform在当前合并单元中的偏移量
        uniforms[uniformGroupIdx].group.dynamicOffsets = [
          offsetCount * this.oneUniformLength,
        ];
        // group赋值
        props.groups[this.uniformIdx] = uniforms[uniformGroupIdx].group;

        // extra的group复制
        if (extraDynamicBuffers?.groupIndex !== undefined && extraBuffers) {
          props.groups[extraDynamicBuffers.groupIndex] = extraBuffers[i].group;
        }
      }
      updateProps?.(props, i);
      command(renderBundleEncoder);
    }

    this.bundleCache[key] = {
      count,
      uniforms,
      oneBufferStructCount,
      uniformStructs: uniforms.reduce<UniformStructF32<Value>['struct'][]>(
        (prev, curr) => prev.concat(curr.structs),
        [],
      ),
      extraBuffers,
      bundle: renderBundleEncoder.finish(),
    };

    window.cleanupResources?.([renderBundleEncoder]);

    return this.bundleCache[key];
  };

  private freeBundleCache = (key: string) => {
    this.freeUniform(
      this.bundleCache[key].oneBufferStructCount,
      this.bundleCache[key].uniforms,
    );
    if (this.bundleCache[key].extraBuffers) {
      this.freeExtraBuffers(key, this.bundleCache[key].extraBuffers);
    }
    window.cleanupResources?.([this.bundleCache[key].bundle]);
  };

  public clearBundleCache = () => {
    Object.keys(this.bundleCache).forEach(this.freeBundleCache);
    this.bundleCache = {};
  };

  public clearPool = () => {
    this.clearBundleCache();
    this.uniformPool = [];
    this.extraBufferPool = {};
  };
}
