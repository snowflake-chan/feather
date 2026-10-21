import parseBVH = require('parse-bvh');
import {
  BVHSkeletonSchema,
  BVHAnimationInfoSchema,
  BVHSkeleton,
  BVHFrameSchema,
  BVHFrame,
  BVHBoneSchema,
  BVHBone,
  BVHAnimationRangeSchema,
} from './bvh-schema';
import { quat, vec3, mat4 } from 'gl-matrix';
import { Vec3Schema, QuatSchema } from '@box/schema/utils/math-schema';

interface JointSpec {
  name: string;
  offset: vec3;
  channels: string[];
  channelOffset: number;
  parent?: JointSpec;
  index: number;
}

function convertBone(joint: JointSpec): BVHBone {
  const result = BVHBoneSchema.alloc();
  result.name = joint.name;
  result.parent = -1;
  if (joint.parent) {
    result.parent = joint.parent.index;
  }
  return result;
}

function convertFrame(
  boneIndex: number[],
  bones: BVHBone[],
  joints: JointSpec[],
  params: number[],
): BVHFrame {
  const frame = BVHFrameSchema.alloc();

  frame.translate.length = bones.length;
  frame.rotate.length = bones.length;

  for (let i = 0; i < joints.length; ++i) {
    const joint = joints[i];
    if (joint.channels.length === 0) {
      continue;
    }
    const v = (frame.translate[boneIndex[i]] = Vec3Schema.alloc());
    const q = (frame.rotate[boneIndex[i]] = QuatSchema.alloc());
    vec3.copy(v, joint.offset);
    quat.identity(q);
    const channels = joint.channels;
    const offset = joint.channelOffset;
    for (let j = 0; j < channels.length; ++j) {
      const p = params[offset + j];
      switch (channels[j]) {
        case 'Xposition':
          v[0] += p;
          break;
        case 'Yposition':
          v[1] += p;
          break;
        case 'Zposition':
          v[2] += p;
          break;
        case 'Xrotation':
          quat.rotateX(q, q, (p * Math.PI) / 180);
          break;
        case 'Yrotation':
          quat.rotateY(q, q, (p * Math.PI) / 180);
          break;
        case 'Zrotation':
          quat.rotateZ(q, q, (p * Math.PI) / 180);
          break;
      }
    }
  }

  return frame;
}

export function convertBVH(bvhFile: string): BVHSkeleton {
  const bvh = parseBVH(bvhFile);
  const result = BVHSkeletonSchema.alloc();

  mat4.identity(result.transform);

  const boneIndex = new Array(bvh.joints.length);
  result.bones.length = 0;
  for (let i = 0; i < bvh.joints.length; ++i) {
    const joint = bvh.joints[i];
    if (joint.channels.length > 0) {
      boneIndex[i] = result.bones.length;
      const b = convertBone(bvh.joints[i]);
      if (b.parent >= 0) {
        b.parent = boneIndex[b.parent];
      }
      result.bones.push(b);
    } else {
      boneIndex[i] = -1;
    }
  }

  result.frames.length = bvh.frames.length;
  for (let i = 0; i < bvh.frames.length; ++i) {
    result.frames[i] = convertFrame(
      boneIndex,
      result.bones,
      bvh.joints,
      bvh.frames[i],
    );
  }

  return result;
}

export function loadBVHAnimation(bvhData: string, animData: any) {
  const skeleton = convertBVH(bvhData);
  mat4.copy(skeleton.transform, animData.transform);

  const animation = BVHAnimationInfoSchema.alloc();
  BVHSkeletonSchema.free(animation.skeleton);
  animation.skeleton = skeleton;

  Object.keys(animData.animations).forEach((animName) => {
    const data = animData.animations[animName];
    const rangeSpec = (animation.frames[animName] =
      BVHAnimationRangeSchema.alloc());
    rangeSpec.start = data[0];
    rangeSpec.end = data[1];
    rangeSpec.loop = data[2];
  });

  return animation;
}
