import { BVHSkeleton, BVHPoseSchema, computeBVHPose } from './bvh-schema';
import { mat4, vec3, mat3, quat } from 'gl-matrix';
import {
  IKPose,
  IKRig,
  IKPoseSchema,
  IKRigSchema,
  IKPaletteSchema,
} from '@box/schema/animation/ik-schema';

// marker points in the file
const LEFT_TOE = 'r foot_02';
const LEFT_FOOT = 'r foot_01';
const LEFT_KNEE = 'r up leg_02';
const LEFT_HIP = 'r up leg';
const LEFT_SHOULDER = 'r shoulder_01';
const LEFT_ARM = 'r shoulder_02';
const LEFT_ELBOW = 'r arm_01';
const LEFT_HAND = 'r hand_03';

const RIGHT_TOE = 'l foot_02';
const RIGHT_FOOT = 'l foot_01';
const RIGHT_KNEE = 'l up leg_02';
const RIGHT_HIP = 'l up leg';
const RIGHT_SHOULDER = 'l shoulder_01';
const RIGHT_ARM = 'l shoulder_02';
const RIGHT_ELBOW = 'l arm_01';
const RIGHT_HAND = 'l hand_03';

const HIPS = 'hips_02';
const HEAD = 'head_02';

export const IDLE_OFFSET = 1;
export const WALK_OFFSET = 2;
export const RUN_OFFSET = 10;

const JUMP_OFFSET = 18;
const FALL_OFFSET = 19;
const ROLL_OFFSET = 20;

export const LAND_OFFSET = 21;
const FLY_OFFSET = 22;
const SWIM_IDLE_OFFSET = 23;
const SWIM_OFFSET = 26;
const DEAD_OFFSET = 34;

const SWIM_PHASE = 2;
const SWIM_IDLE_PHASE = 2;

export const WALK_PHASE = 0;
export const RUN_PHASE = 0;
export const CROUCH_PHASE = 0;
export const DEAD_PHASE = 0;

function positionFromMatrix(out: vec3, pose: mat4) {
  out[0] = pose[12];
  out[1] = pose[13];
  out[2] = pose[14];
  return out;
}

export function convertIKPose(
  pose: mat4[],
  boneIds: { [id: string]: number },
): IKPose {
  // calculate position of all effectors
  const result = IKPoseSchema.alloc();

  function point(id: string) {
    return positionFromMatrix(vec3.create(), pose[boneIds[id]]);
  }

  function frame(id: string) {
    const M = pose[boneIds[id]];
    const R = mat3.fromMat4(mat3.create(), M);
    const Q = quat.fromMat3(quat.create(), R);
    const A = quat.identity(quat.create());
    quat.rotateY(A, A, Math.PI);
    quat.mul(Q, Q, A);
    quat.normalize(Q, Q);
    return Q;
  }

  function copy(position: vec3, orientation: quat, link: string) {
    vec3.copy(position, point(link));
    quat.copy(orientation, frame(link));
  }

  function computeBendDir(
    out: vec3,
    base: string,
    joint: string,
    effector: string,
  ) {
    const d = vec3.subtract(vec3.create(), point(effector), point(base));
    vec3.normalize(d, d);

    const j = point(joint);
    const n = vec3.subtract(out, j, point(effector));
    vec3.scaleAndAdd(n, n, d, -vec3.dot(d, n));
    vec3.normalize(n, n);
  }

  copy(result.hipPosition, result.hipOrientation, HIPS);
  copy(result.headPosition, result.headOrientation, HEAD);
  copy(result.leftHandPosition, result.leftHandOrientation, LEFT_HAND);
  copy(result.rightHandPosition, result.rightHandOrientation, RIGHT_HAND);
  vec3.copy(result.leftFootPosition, point(LEFT_FOOT));
  vec3.copy(result.rightFootPosition, point(RIGHT_FOOT));
  vec3.copy(result.leftToePosition, point(LEFT_TOE));
  vec3.copy(result.rightToePosition, point(RIGHT_TOE));

  vec3.copy(result.leftShoulderPosition, point(LEFT_SHOULDER));
  vec3.copy(result.rightShoulderPosition, point(RIGHT_SHOULDER));

  computeBendDir(result.leftKneeDirection, LEFT_HIP, LEFT_KNEE, LEFT_FOOT);
  computeBendDir(
    result.leftElbowDirection,
    LEFT_SHOULDER,
    LEFT_ELBOW,
    LEFT_HAND,
  );
  computeBendDir(result.rightKneeDirection, RIGHT_HIP, RIGHT_KNEE, RIGHT_FOOT);
  computeBendDir(
    result.rightElbowDirection,
    RIGHT_SHOULDER,
    RIGHT_ELBOW,
    RIGHT_HAND,
  );

  const hipFrame = mat3.create();
  mat3.fromQuat(hipFrame, result.hipOrientation);
  result.spineDirection[0] = -hipFrame[2];
  result.spineDirection[1] = -hipFrame[5];
  result.spineDirection[2] = -hipFrame[8];

  return result;
}

function computeSkeleton(
  bindPose: mat4[],
  boneIds: { [id: string]: number },
): IKRig {
  // calculate position of all effectors
  const result = IKRigSchema.clone(IKRigSchema.identity);

  function getPoint(id: string) {
    return positionFromMatrix(vec3.create(), bindPose[boneIds[id]]);
  }

  const leftHandPos = getPoint(LEFT_HAND);
  const leftShoulderPos = getPoint(LEFT_SHOULDER);
  const leftElbow = getPoint(LEFT_ELBOW);
  result.upperArmLength = vec3.distance(leftElbow, leftShoulderPos) * 0.76;
  result.lowerArmLength = vec3.distance(leftHandPos, leftShoulderPos) * 0.5;

  const leftFootPos = getPoint(LEFT_FOOT);
  const leftUpperLegPos = getPoint(LEFT_HIP);

  const leftKneePos = getPoint(LEFT_KNEE);
  result.lowerLegLength = vec3.distance(leftFootPos, leftKneePos) * 0.985;
  result.upperLegLength = vec3.distance(leftKneePos, leftUpperLegPos) * 0.985;

  const leftToePos = getPoint(LEFT_TOE);
  result.footLength = vec3.distance(leftFootPos, leftToePos);

  const rightUpperLegPos = getPoint(RIGHT_HIP);
  result.hipWidth = vec3.distance(rightUpperLegPos, leftUpperLegPos);

  const rightShoulderPos = getPoint(RIGHT_SHOULDER);
  result.shoulderWidth = vec3.distance(leftShoulderPos, rightShoulderPos);

  const neckPos = getPoint(HEAD);
  const neckBase = vec3.lerp(
    vec3.create(),
    leftShoulderPos,
    rightShoulderPos,
    0.5,
  );
  result.neckLength = vec3.distance(neckBase, neckPos);

  const hipPos = getPoint(HIPS);
  const torsoLength = vec3.distance(hipPos, neckBase);
  result.lowerTorsoLength = result.upperTorsoLength = 0.5 * torsoLength;

  return result;
}

export function convertBVHToIK(skeleton: BVHSkeleton) {
  const boneIds: { [id: string]: number } = {};
  const frames: IKPose[] = [];
  for (let i = 0; i < skeleton.bones.length; ++i) {
    boneIds[skeleton.bones[i].name] = i;
  }
  const bindPose = BVHPoseSchema.alloc();
  computeBVHPose(bindPose, skeleton, skeleton.frames[0]);
  const ikSkeleton = computeSkeleton(bindPose, boneIds);

  function adjustArmsPosition(base1, base2, target) {
    base1[14] = base2[14] = target[14];
  }

  for (let i = 0; i < skeleton.frames.length; ++i) {
    const pose = BVHPoseSchema.alloc();
    computeBVHPose(pose, skeleton, skeleton.frames[i]);
    if (i === 0) {
      adjustArmsPosition(
        pose[boneIds[RIGHT_HAND]],
        pose[boneIds[RIGHT_ELBOW]],
        pose[boneIds[RIGHT_SHOULDER]],
      );
      adjustArmsPosition(
        pose[boneIds[LEFT_HAND]],
        pose[boneIds[LEFT_ELBOW]],
        pose[boneIds[LEFT_SHOULDER]],
      );
    }
    frames.push(convertIKPose(pose, boneIds));
  }

  return {
    skeleton: ikSkeleton,
    frames,
  };
}

export function convertIKToPalette(skeleton: IKRig, frames: IKPose[]) {
  const palette = IKPaletteSchema.clone(IKPaletteSchema.identity);

  IKRigSchema.free(palette.skeleton);
  palette.skeleton = IKRigSchema.clone(skeleton);

  IKPoseSchema.free(palette.idle);
  palette.idle = IKPoseSchema.clone(frames[IDLE_OFFSET]);
  palette.jump = IKPoseSchema.clone(frames[JUMP_OFFSET]);
  palette.fall = IKPoseSchema.clone(frames[FALL_OFFSET]);
  palette.roll = IKPoseSchema.clone(frames[ROLL_OFFSET]);
  palette.fly = IKPoseSchema.clone(frames[FLY_OFFSET]);
  palette.land = IKPoseSchema.clone(frames[LAND_OFFSET]);

  for (let i = 0; i < 6; ++i) {
    palette.dead.push(
      IKPoseSchema.clone(frames[((i + DEAD_PHASE) % 6) + DEAD_OFFSET]),
    );
  }

  for (let i = 0; i < 8; i++) {
    palette.walk.push(
      IKPoseSchema.clone(frames[((i + WALK_PHASE) % 8) + WALK_OFFSET]),
    );
    palette.run.push(
      IKPoseSchema.clone(frames[((i + RUN_OFFSET) % 8) + RUN_OFFSET]),
    );
    palette.swim.push(
      IKPoseSchema.clone(frames[((i + SWIM_PHASE) % 8) + SWIM_OFFSET]),
    );
  }

  for (let i = 0; i < 3; ++i) {
    palette.swimIdle.push(
      IKPoseSchema.clone(
        frames[((i + SWIM_IDLE_PHASE) % 3) + SWIM_IDLE_OFFSET],
      ),
    );
  }

  return palette;
}
