import type { ReWGPU, IREWGPUGroup, IREWGPUBuffer } from '@box/rewgpu';
import type { LightProbe } from '../voxel/light-schema';
import type { mat3 } from 'gl-matrix';

export interface UniformAlignSize {
  align: number;
  size: number;
}

export const F32: UniformAlignSize = {
  align: 4,
  size: 4,
};

export const VEC2F: UniformAlignSize = {
  align: 8,
  size: 8,
};

export const VEC3F: UniformAlignSize = {
  align: 16,
  size: 12,
};

export const VEC4F: UniformAlignSize = {
  align: 16,
  size: 16,
};

export const MAT4X4F32: UniformAlignSize = {
  align: 16,
  size: 64,
};

export const MAT3X3F32: UniformAlignSize = {
  align: 16,
  size: 48,
};

export interface Spec {
  [prop: string]: UniformAlignSize;
}

export function getOffset(currOffset: number, align: number) {
  const residue = currOffset % align;
  if (residue) {
    return currOffset + align - residue;
  }
  return currOffset;
}

/**
 * uniform对齐切断的定义和算法详见
 * https://www.w3.org/TR/WGSL/#alignment-and-size
 */
export class UniformStructF32<Value extends Spec> {
  public readonly data: Float32Array;
  public readonly struct: { [K in keyof Value]: Float32Array } = {} as any;
  public readonly align: number;

  public static calcByteLength<Value extends Spec>(
    spec: Value,
    minUniformBufferOffsetAlignment?: number,
  ) {
    let byteLength = 0;
    let structAlign = 0;

    Object.keys(spec).forEach((prop) => {
      const { size, align } = spec[prop];
      structAlign = Math.max(structAlign, align);

      if (!byteLength) {
        byteLength += size;
        return;
      }

      byteLength = getOffset(byteLength, align);
      byteLength += size;
    });

    byteLength = getOffset(byteLength, structAlign);
    if (minUniformBufferOffsetAlignment !== undefined) {
      byteLength = getOffset(byteLength, minUniformBufferOffsetAlignment);
    }

    return {
      byteLength,
      structAlign,
    };
  }

  constructor(
    spec: Value,
    data?: Float32Array,
    minUniformBufferOffsetAlignment?: number,
  ) {
    const { byteLength, structAlign } = UniformStructF32.calcByteLength<Value>(
      spec,
      minUniformBufferOffsetAlignment,
    );
    this.data = data || new Float32Array(byteLength / 4);
    this.align = structAlign;

    let offset = 0;
    for (let prop in spec) {
      const { align, size } = spec[prop];
      if (offset) {
        offset = getOffset(offset, align);
      }
      this.struct[prop] = this.data.subarray(offset / 4, (offset + size) / 4);

      offset += size;
    }
  }
}

export interface UniformPool<Value extends Spec> {
  group: IREWGPUGroup;
  struct: UniformStructF32<Value>['struct'];
  data: UniformStructF32<Value>['data'];
  buffer: IREWGPUBuffer;
}

export function createUniformPool<Value extends Spec>(
  rewgpu: ReWGPU,
  layout: GPUBindGroupLayout,
  uniformSpec: Value,
): UniformPoolObject<Value> {
  let modelPool: UniformPool<Value>[] = [];
  function allocUniform(size: number): UniformPool<Value>[] {
    if (modelPool.length >= size) {
      return modelPool.splice(0, size);
    }
    const currPoolLen = modelPool.length;
    const out = modelPool.splice(0, modelPool.length);
    for (let i = 0; i < size - currPoolLen; i++) {
      const { data, struct } = new UniformStructF32(uniformSpec);
      const buffer = rewgpu.buffer({
        data,
        size: data.byteLength,
        usage: GPUBufferUsage.UNIFORM,
      });
      const group = rewgpu.group({
        layout,
        entries: [
          {
            binding: 0,
            resource: buffer,
          },
        ],
      });
      out.push({ data, struct, group, buffer });
    }
    return out;
  }

  function freeUniform(uniforms: UniformPool<Value>[]) {
    modelPool.push(...uniforms);
  }

  function updateUniform(uniforms: UniformPool<Value>[]) {
    uniforms.forEach((uniform) => {
      uniform.buffer.update(uniform.data);
    });
  }

  function destroy() {
    modelPool.forEach((p) => {
      p.buffer.destroy();
      p.group.destroy();
    });
    modelPool = [];
  }

  return {
    allocUniform,
    freeUniform,
    updateUniform,
    destroy,
  };
}

export type UniformPoolObject<Value extends Spec> = {
  allocUniform: (size: number) => UniformPool<Value>[];
  freeUniform: (uniforms: UniformPool<Value>[]) => void;
  updateUniform: (uniforms: UniformPool<Value>[]) => void;
  destroy: () => void;
};

/**
 * mat3x3 uniform 复制mat3的方法
 * 处理了wgsl数据的padding
 */
export function mat3x3fromMat3(out: Float32Array, m: mat3) {
  out[0] = m[0];
  out[1] = m[1];
  out[2] = m[2];
  out[3] = 0;

  out[4] = m[3];
  out[5] = m[4];
  out[6] = m[5];
  out[7] = 0;

  out[8] = m[6];
  out[9] = m[7];
  out[10] = m[8];
  out[11] = 0;
}

// 对应LightProbeSchema
export const LIGHT_PROBE: UniformAlignSize = {
  align: 16,
  size: 16 * 8,
};

export function updateLightProbeStruct(
  out: Float32Array,
  lightProbe: LightProbe,
) {
  out.set([
    lightProbe.R0,
    lightProbe.G0,
    lightProbe.B0,
    lightProbe.A0,
    lightProbe.R1,
    lightProbe.G1,
    lightProbe.B1,
    lightProbe.A1,
    lightProbe.R2,
    lightProbe.G2,
    lightProbe.B2,
    lightProbe.A2,
    lightProbe.R3,
    lightProbe.G3,
    lightProbe.B3,
    lightProbe.A3,
    lightProbe.R4,
    lightProbe.G4,
    lightProbe.B4,
    lightProbe.A4,
    lightProbe.R5,
    lightProbe.G5,
    lightProbe.B5,
    lightProbe.A5,
    lightProbe.R6,
    lightProbe.G6,
    lightProbe.B6,
    lightProbe.A6,
    lightProbe.R7,
    lightProbe.G7,
    lightProbe.B7,
    lightProbe.A7,
  ]);
}
