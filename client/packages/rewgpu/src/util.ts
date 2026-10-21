import {
  REWGPUType,
  REWGPUObject,
  IREWGPUBuffer,
  IREWGPUTexture,
  IREWGPUSampler,
  IREWGPUCube,
} from './interface';

export function isREWGPUBuffer(object: REWGPUObject): object is IREWGPUBuffer {
  return object.type === REWGPUType.Buffer;
}

export function isREWGPUTexture(
  object: REWGPUObject,
): object is IREWGPUTexture {
  return object.type === REWGPUType.Texture;
}

export function isREWGPUCube(object: REWGPUObject): object is IREWGPUCube {
  return object.type === REWGPUType.Cube;
}

export function isREWGPUSampler(
  object: REWGPUObject,
): object is IREWGPUSampler {
  return object.type === REWGPUType.Sampler;
}
