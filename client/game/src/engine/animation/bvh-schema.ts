import { vec3, quat, mat4 } from 'gl-matrix';
import {
  Vec3Schema,
  Mat4Schema,
  QuatSchema,
} from '@box/schema/utils/math-schema';
import {
  MuStruct,
  MuInt32,
  MuASCII,
  MuArray,
  MuDictionary,
  MuUint16,
  MuBoolean,
} from '@box/mudb/schema';
import { RelativeArray } from '@box/schema/utils/relative-array';

export const BVHBoneSchema = new MuStruct({
  name: new MuASCII(''),
  parent: new MuInt32(-1),
});
export type BVHBone = typeof BVHBoneSchema['identity'];

export const BVHPoseSchema = new MuArray(Mat4Schema, Infinity);
export type BVHPose = typeof BVHPoseSchema['identity'];

export const BVHFrameSchema = new MuStruct({
  translate: new MuArray(Vec3Schema, Infinity),
  rotate: new MuArray(QuatSchema, Infinity),
});
export type BVHFrame = typeof BVHFrameSchema['identity'];

export const BVHSkeletonSchema = new MuStruct({
  transform: Mat4Schema,
  bones: new MuArray(BVHBoneSchema, Infinity),
  frames: new RelativeArray(BVHFrameSchema, Infinity),
});
export type BVHSkeleton = typeof BVHSkeletonSchema['identity'];

export const BVHAnimationRangeSchema = new MuStruct({
  start: new MuUint16(),
  end: new MuUint16(),
  loop: new MuBoolean(),
});
export type BVHAnimationRange = typeof BVHAnimationRangeSchema.identity;

export const BVHAnimationInfoSchema = new MuStruct({
  skeleton: BVHSkeletonSchema,
  frames: new MuDictionary(BVHAnimationRangeSchema, Infinity),
});
export type BVHAnimationInfo = typeof BVHAnimationInfoSchema.identity;

export function computeBVHPose(
  result: BVHPose,
  skeleton: BVHSkeleton,
  frame: BVHFrame,
  model?: mat4,
  bindings?: mat4[],
) {
  const bones = skeleton.bones;
  result.length = bones.length;
  for (let i = 0; i < bones.length; ++i) {
    const m = (result[i] = Mat4Schema.alloc());
    mat4.fromRotationTranslation(m, frame.rotate[i], frame.translate[i]);
    const parent = bones[i].parent;
    if (parent >= 0) {
      mat4.multiply(m, result[parent], m);
    } else {
      mat4.multiply(m, skeleton.transform, m);
      if (model) {
        mat4.multiply(m, model, m);
      }
    }
  }
  if (bindings) {
    for (let i = 0; i < bindings.length; ++i) {
      mat4.multiply(result[i], result[i], bindings[i]);
    }
  }
}

export function interpolateBVHFrame(
  a: BVHFrame,
  b: BVHFrame,
  t: number,
): BVHFrame {
  const result = BVHFrameSchema.alloc();
  result.translate.length = result.rotate.length = a.translate.length;
  for (let i = 0; i < a.translate.length; ++i) {
    const v = (result.translate[i] = Vec3Schema.alloc());
    const q = (result.rotate[i] = QuatSchema.alloc());
    vec3.lerp(v, a.translate[i], b.translate[i], t);
    quat.slerp(q, a.rotate[i], b.rotate[i], t);
  }
  return result;
}

const mask: boolean[] = [];
export function applyFrameToSubSkeletonBVH(
  base: BVHFrame,
  next: BVHFrame,
  bones: BVHBone[],
  root: string,
) {
  mask.length = bones.length;
  for (let i = 0; i < bones.length; ++i) {
    if (bones[i].name === root || (bones[i].parent >= 0 && mask[i])) {
      mask[i] = true;
      vec3.copy(base.translate[i], next.translate[i]);
      quat.copy(base.rotate[i], next.rotate[i]);
    } else {
      mask[i] = false;
    }
  }
}

function clampOrLoop(x: number, n: number, loop: boolean) {
  if (loop) {
    return x % n;
  } else {
    return Math.min(x, n - 1);
  }
}

export function sampleBVHAnimation(
  frames: BVHFrame[],
  _t: number,
  { start, end, loop }: BVHAnimationRange,
) {
  const n = end - start;

  const t = _t * n;
  const ti = Math.floor(t);
  const tf = t - ti;

  const f0 = clampOrLoop(ti, n, loop) + start;
  const f1 = clampOrLoop(ti + 1, n, loop) + start;

  return interpolateBVHFrame(frames[f0], frames[f1], tf);
}
