import { vec3, mat4, mat3, quat, vec2 } from 'gl-matrix';
import SimplexNoise from 'simplex-noise';
import {
  SpringState,
  SpringParameters,
  IKPose,
  IKPoseSchema,
  IKPoints,
  IKRig,
  IKConfiguration,
  IKInput,
  IKPalette,
  IKPointSchema,
  IKState,
  GroundEmote,
  IKStateSchema,
} from '@box/schema/animation/ik-schema';
import {
  copyIK,
  scaleIKPose,
  mixIK,
  hermiteInterpolatePose,
  playCollapsePose,
  playEmotePose,
} from '@box/schema/animation/compute-ik';
import {
  solveIKPoints,
  solveIKConfiguration,
} from '@box/schema/animation/solve-ik';
import { PlayerJumpState } from '@box/schema/player/player-schema';

const NOISE = new SimplexNoise();
const EPSILON = 1e-3;

// temp crouch adjust, will be removed if we have crouch key frames
const CROUCH_STRIDE = 2.72;
const CROUCH_CYCLE = 17.31;

export let PLANT_THRESHOLD = 0.85;

function clamp(lo: number, hi: number, v: number) {
  return Math.max(Math.min(v, hi), lo);
}

function updateSpring(
  out: SpringState,
  prev: SpringState,
  params: SpringParameters,
  target: number,
  dt: number,
) {
  out.dx =
    Math.exp(-dt * params.damping) * prev.dx +
    params.stiffness * dt * (target - prev.x);
  out.x = prev.x + out.dx * dt;
}

const CENTER = vec3.create();

function getIKPoseFromPointsNoBend(out: IKPose, points: IKPoints) {
  vec3.copy(out.headPosition, points.head);
  vec3.copy(out.hipPosition, points.hips);
  vec3.copy(out.leftFootPosition, points.leftFoot);
  vec3.copy(out.rightFootPosition, points.rightFoot);
  vec3.copy(out.leftShoulderPosition, points.leftShoulder);
  vec3.copy(out.rightShoulderPosition, points.rightShoulder);
  vec3.copy(out.leftHandPosition, points.leftHand);
  vec3.copy(out.rightHandPosition, points.rightHand);
  vec3.copy(out.leftToePosition, points.leftToe);
  vec3.copy(out.rightToePosition, points.rightToe);
}

const UPPER_MAT3 = mat3.create();
const ROTATE_PART = quat.create();

function transformAxis(out: vec3, axis: vec3, m: mat3) {
  vec3.transformMat3(out, axis, m);
  vec3.normalize(out, out);
}

function transformQuat(out: quat, q: quat, m: quat) {
  quat.mul(out, m, q);
  quat.normalize(out, out);
}

function transformIK(outPose: IKPose, pose: IKPose, model: mat4) {
  outPose.leftPlant = pose.leftPlant;
  outPose.rightPlant = pose.rightPlant;
  vec3.transformMat4(outPose.leftHandPosition, pose.leftHandPosition, model);
  vec3.transformMat4(outPose.rightHandPosition, pose.rightHandPosition, model);
  vec3.transformMat4(
    outPose.leftShoulderPosition,
    pose.leftShoulderPosition,
    model,
  );
  vec3.transformMat4(
    outPose.rightShoulderPosition,
    pose.rightShoulderPosition,
    model,
  );
  vec3.transformMat4(outPose.leftFootPosition, pose.leftFootPosition, model);
  vec3.transformMat4(outPose.rightFootPosition, pose.rightFootPosition, model);
  vec3.transformMat4(outPose.leftToePosition, pose.leftToePosition, model);
  vec3.transformMat4(outPose.rightToePosition, pose.rightToePosition, model);
  vec3.transformMat4(outPose.headPosition, pose.headPosition, model);
  vec3.transformMat4(outPose.hipPosition, pose.hipPosition, model);

  mat3.fromMat4(UPPER_MAT3, model);
  transformAxis(
    outPose.leftElbowDirection,
    pose.leftElbowDirection,
    UPPER_MAT3,
  );
  transformAxis(
    outPose.rightElbowDirection,
    pose.rightElbowDirection,
    UPPER_MAT3,
  );
  transformAxis(outPose.leftKneeDirection, pose.leftKneeDirection, UPPER_MAT3);
  transformAxis(
    outPose.rightKneeDirection,
    pose.rightKneeDirection,
    UPPER_MAT3,
  );
  transformAxis(outPose.spineDirection, pose.spineDirection, UPPER_MAT3);

  quat.fromMat3(ROTATE_PART, UPPER_MAT3);
  quat.normalize(ROTATE_PART, ROTATE_PART);
  transformQuat(
    outPose.leftHandOrientation,
    pose.leftHandOrientation,
    ROTATE_PART,
  );
  transformQuat(
    outPose.rightHandOrientation,
    pose.rightHandOrientation,
    ROTATE_PART,
  );
  transformQuat(outPose.headOrientation, pose.headOrientation, ROTATE_PART);
  transformQuat(outPose.hipOrientation, pose.hipOrientation, ROTATE_PART);
}

function translatePoint(p: vec3, x: number, y: number, z: number) {
  p[0] += x;
  p[1] += y;
  p[2] += z;
}

function translateMatrix(m: mat4, x: number, y: number, z: number) {
  m[12] += x;
  m[13] += y;
  m[14] += z;
}

function translateIKInPlace(pose: IKPose, offset: vec3) {
  const x = offset[0];
  const y = offset[1];
  const z = offset[2];
  translatePoint(pose.leftHandPosition, x, y, z);
  translatePoint(pose.rightHandPosition, x, y, z);
  translatePoint(pose.leftShoulderPosition, x, y, z);
  translatePoint(pose.rightShoulderPosition, x, y, z);
  translatePoint(pose.leftFootPosition, x, y, z);
  translatePoint(pose.rightFootPosition, x, y, z);
  translatePoint(pose.headPosition, x, y, z);
  translatePoint(pose.hipPosition, x, y, z);
  translatePoint(pose.leftToePosition, x, y, z);
  translatePoint(pose.rightToePosition, x, y, z);
}

function scaleMat4(m: mat4, s: number) {
  m[0] *= s;
  m[1] *= s;
  m[2] *= s;
  m[4] *= s;
  m[5] *= s;
  m[6] *= s;
  m[8] *= s;
  m[9] *= s;
  m[10] *= s;
}

function scaleIKConfiguration(out: IKConfiguration, s: number) {
  if (s === 1) {
    return;
  }
  scaleMat4(out.head, s);
  scaleMat4(out.hips, s);
  scaleMat4(out.leftFoot, s);
  scaleMat4(out.leftHand, s);
  scaleMat4(out.leftLowerArm, s);
  scaleMat4(out.leftLowerLeg, s);
  scaleMat4(out.leftShoulder, s);
  scaleMat4(out.leftUpperArm, s);
  scaleMat4(out.leftUpperLeg, s);
  scaleMat4(out.neck, s);
  scaleMat4(out.rightFoot, s);
  scaleMat4(out.rightHand, s);
  scaleMat4(out.rightLowerArm, s);
  scaleMat4(out.rightLowerLeg, s);
  scaleMat4(out.rightShoulder, s);
  scaleMat4(out.rightUpperArm, s);
  scaleMat4(out.rightUpperLeg, s);
  scaleMat4(out.torso, s);
}

export function retargetIK(
  out: IKPose,
  targetRig: IKRig,
  basePose: IKPose,
  baseRig: IKRig,
) {
  // TODO
}

function computeFootCorrectionFactor(points: IKPoints) {
  const leftFoot = points.leftFoot;
  const rightFoot = points.rightFoot;
  const leftHip = points.leftHip;
  const rightHip = points.rightHip;

  const fx = leftFoot[0] - rightFoot[0];
  const fz = leftFoot[2] - rightFoot[2];
  const fl = Math.sqrt(Math.pow(fx, 2) + Math.pow(fz, 2));

  const hx = leftHip[0] - rightHip[0];
  const hz = leftHip[2] - rightHip[2];
  const hl = Math.sqrt(Math.pow(hx, 2) + Math.pow(hz, 2));

  const cosTheta = (fx * hx + fz * hz) / Math.max(fl * hl, EPSILON);
  return clamp(0, 1, Math.SQRT1_2 - cosTheta);
}

function computeHipLean(points: IKPoints) {
  vec3.lerp(CENTER, points.leftFoot, points.rightFoot, 0.5);
  return Math.sqrt(
    Math.pow(CENTER[0] - points.hips[0], 2) +
      Math.pow(CENTER[2] - points.hips[2], 2),
  );
}

function computeRotationMatrix(result: mat4, facing: vec2) {
  const s = -facing[0];
  const c = facing[1];
  mat4.identity(result);
  result[0] = c;
  result[2] = s;
  result[8] = -s;
  result[10] = c;
}

function shiftJointCenterOfMass(bone: vec3, acceleration: vec3, scale: number) {
  const h = scale * bone[1];
  bone[0] += h * acceleration[0];
  bone[2] += h * acceleration[2];
}

function applyAccelerationTilt(
  pose: IKPose,
  acceleration: vec3,
  scale: number,
  cap: number,
) {
  const l = Math.sqrt(
    Math.pow(acceleration[0], 2) + Math.pow(acceleration[2], 2),
  );
  let s = scale;
  if (l > cap) {
    s *= cap / l;
  }
  shiftJointCenterOfMass(pose.leftFootPosition, acceleration, s);
  shiftJointCenterOfMass(pose.leftToePosition, acceleration, s);
  shiftJointCenterOfMass(pose.rightFootPosition, acceleration, s);
  shiftJointCenterOfMass(pose.rightToePosition, acceleration, s);
  shiftJointCenterOfMass(pose.leftHandPosition, acceleration, s);
  shiftJointCenterOfMass(pose.leftShoulderPosition, acceleration, s);
  shiftJointCenterOfMass(pose.rightHandPosition, acceleration, s);
  shiftJointCenterOfMass(pose.rightShoulderPosition, acceleration, s);
  shiftJointCenterOfMass(pose.headPosition, acceleration, s);
  shiftJointCenterOfMass(pose.hipPosition, acceleration, s);
}

// apply crouch
function applyStretchToBone(bone: vec3, scale: number) {
  bone[1] *= scale;
}

function applyStretch(pose: IKPose, stretch: number) {
  applyStretchToBone(pose.headPosition, stretch);
  applyStretchToBone(pose.hipPosition, stretch);
  applyStretchToBone(pose.leftFootPosition, stretch);
  applyStretchToBone(pose.leftToePosition, stretch);
  applyStretchToBone(pose.leftHandPosition, stretch);
  applyStretchToBone(pose.leftShoulderPosition, stretch);
  applyStretchToBone(pose.rightFootPosition, stretch);
  applyStretchToBone(pose.rightToePosition, stretch);
  applyStretchToBone(pose.rightHandPosition, stretch);
  applyStretchToBone(pose.rightShoulderPosition, stretch);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  x = clamp(0, 1, (x - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

// scale stride length
function scaleFoot(foot: vec3, toe: vec3, hip: vec3, scale: number) {
  const d = (scale - 1) * (foot[2] - hip[2]);
  foot[2] += d;
  toe[2] += d;
}

function scaleStride(pose: IKPose, scaleFactor: number, skeleton: IKRig) {
  scaleFoot(
    pose.leftFootPosition,
    pose.leftToePosition,
    pose.hipPosition,
    scaleFactor,
  );
  scaleFoot(
    pose.rightFootPosition,
    pose.rightToePosition,
    pose.hipPosition,
    scaleFactor,
  );
}

function plantWeight(plant: number, dt: number) {
  const base = Math.exp(-0.25 * dt);
  const w = clamp(0, 1, 10 * (plant - PLANT_THRESHOLD)) * base;
  return w;
}

function snapFootToFloorContact(
  foot: vec3,
  toe: vec3,
  footHeight: number,
  weight: number,
  dt: number,
) {
  const t = smoothstep(PLANT_THRESHOLD - 0.1, PLANT_THRESHOLD + 0.1, weight);
  foot[1] = t * footHeight + (1 - t) * foot[1];
  toe[1] = t * footHeight + (1 - t) * toe[1];
}

function pointInBox(p: vec3, center: vec3, bounds: vec3) {
  return (
    Math.abs(p[0] - center[0]) < 2 * bounds[0] &&
    Math.abs(p[1] - center[1]) < bounds[1] &&
    Math.abs(p[2] - center[2]) < 2 * bounds[2]
  );
}

const FOOT_POS = vec3.create();
const TOE_POS = vec3.create();
function fixFootSkate(
  out: IKPose,
  prev: IKPose,
  input: IKInput,
  palette: IKPalette,
  dt: number,
) {
  const footOffset = input.position[1] - input.bounds[1] + palette.footOffset;
  if (prev.leftPlant > PLANT_THRESHOLD) {
    const w = plantWeight(prev.leftPlant, dt);
    vec3.scaleAndAdd(
      FOOT_POS,
      prev.leftFootPosition,
      input.platformVelocity,
      dt,
    );
    vec3.scaleAndAdd(TOE_POS, prev.leftToePosition, input.platformVelocity, dt);
    vec3.lerp(out.leftFootPosition, out.leftFootPosition, FOOT_POS, w);
    vec3.lerp(out.leftToePosition, out.leftToePosition, TOE_POS, w);
    if (!pointInBox(FOOT_POS, input.position, input.bounds)) {
      out.leftPlant *= Math.exp(-5 * dt);
    }
  }
  snapFootToFloorContact(
    out.leftFootPosition,
    out.leftToePosition,
    footOffset,
    out.leftPlant,
    dt,
  );
  if (prev.rightPlant > PLANT_THRESHOLD) {
    const w = plantWeight(prev.rightPlant, dt);
    vec3.scaleAndAdd(
      FOOT_POS,
      prev.rightFootPosition,
      input.platformVelocity,
      dt,
    );
    vec3.scaleAndAdd(
      TOE_POS,
      prev.rightToePosition,
      input.platformVelocity,
      dt,
    );
    vec3.lerp(out.rightFootPosition, out.rightFootPosition, FOOT_POS, w);
    vec3.lerp(out.rightToePosition, out.rightToePosition, TOE_POS, w);
    if (!pointInBox(FOOT_POS, input.position, input.bounds)) {
      out.rightPlant *= Math.exp(-5 * dt);
    }
  }
  snapFootToFloorContact(
    out.rightFootPosition,
    out.rightToePosition,
    footOffset,
    out.rightPlant,
    dt,
  );
}

const WALK_POSES: IKPose[] = [
  IKPoseSchema.alloc(),
  IKPoseSchema.alloc(),
  IKPoseSchema.alloc(),
  IKPoseSchema.alloc(),
];
const WALK_WEIGHTS: number[] = [1, 1, 1, 1];
const WALK_TRANSLATE = vec3.create();
const LTOE = vec3.create();
const RTOE = vec3.create();
const WALK_POINTS = IKPointSchema.alloc();
function computeWalkPose(
  out: IKPose,
  keyframes: IKPose[],
  phase: number,
  cycle: number,
  stride: number,
  velocity: number,
  skeleton: IKRig,
) {
  const t = phase * keyframes.length;
  const ti = Math.floor(t);
  const u = t - ti;
  const ui = 1 - u;

  WALK_WEIGHTS[0] = Math.pow(ui, 3);
  WALK_WEIGHTS[1] = 3 * Math.pow(u, 3) - 6 * Math.pow(u, 2) + 4;
  WALK_WEIGHTS[2] = -3 * Math.pow(u, 3) + 3 * Math.pow(u, 2) + 3 * u + 1;
  WALK_WEIGHTS[3] = Math.pow(u, 3);

  const scale = (velocity * cycle) / stride;

  for (let i = 0; i < 4; ++i) {
    const pose = WALK_POSES[i];
    copyIK(pose, keyframes[(i + ti) % keyframes.length]);
    scaleStride(pose, scale, skeleton);
    WALK_TRANSLATE[2] = scale * (i - u - 1);
    translateIKInPlace(pose, WALK_TRANSLATE);
  }

  mixIK(out, WALK_POSES, WALK_WEIGHTS, 1);
  vec3.subtract(LTOE, out.leftToePosition, out.leftFootPosition);
  vec3.subtract(RTOE, out.rightToePosition, out.rightFootPosition);
  solveIKPoints(WALK_POINTS, skeleton, out, 1);
  getIKPoseFromPointsNoBend(out, WALK_POINTS);
  vec3.add(out.leftToePosition, LTOE, out.leftFootPosition);
  vec3.add(out.rightToePosition, RTOE, out.rightFootPosition);
}

function applyJitter(
  pose: IKPose,
  phase: number,
  scale: number,
  ground: number,
) {
  const leftScale = 1 - pose.leftPlant;
  const rightScale = 1 - pose.rightPlant;
  const plant = Math.min(1, 0.25 + Math.max(leftScale, rightScale));
  for (let i = 0; i < 3; ++i) {
    pose.leftHandPosition[i] += plant * scale * NOISE.noise2D(i, phase);
    pose.rightHandPosition[i] += plant * scale * NOISE.noise2D(4 + i, phase);
    const lf = ground * leftScale * scale * NOISE.noise2D(8 + i, phase);
    pose.leftFootPosition[i] += lf;
    const rf = ground * rightScale * scale * NOISE.noise2D(12 + i, phase);
    pose.rightFootPosition[i] += rf;
    pose.leftToePosition[i] +=
      lf + 0.1 * ground * leftScale * scale * NOISE.noise2D(16 + i, phase);
    pose.rightToePosition[i] +=
      rf + 0.1 * ground * rightScale * scale * NOISE.noise2D(20 + i, phase);
  }
}

function applyBreathing(pose: IKPose, phase: number, scale: number) {
  const f = scale * Math.cos(Math.PI * 2 * phase);
  pose.leftShoulderPosition[1] += f;
  pose.rightShoulderPosition[1] += f;
}

function applyDamageTwitch(pose: IKPose, twitch: vec3, scale: number) {
  const yscale = twitch[1] * scale;
  const head = pose.headPosition;
  head[0] -= scale * twitch[0];
  head[1] -= yscale;
  head[2] += 0.5 * yscale;

  const hip = pose.hipPosition;
  hip[2] -= 0.1 * yscale;
  hip[1] -= 0.1 * yscale;

  const lhand = pose.leftHandPosition;
  lhand[2] += yscale;
  const rhand = pose.rightHandPosition;
  rhand[2] += yscale;
  vec3.scaleAndAdd(lhand, lhand, twitch, scale);
  vec3.scaleAndAdd(rhand, rhand, twitch, scale);

  pose.leftElbowDirection[1] -= twitch[1];
  vec3.normalize(pose.leftElbowDirection, pose.leftElbowDirection);
  pose.rightElbowDirection[1] -= twitch[1];
  vec3.normalize(pose.rightElbowDirection, pose.rightElbowDirection);
}

const TEMP_VEC3 = vec3.create();
const POSE = IKPoseSchema.alloc();
const PREV_POSE = IKPoseSchema.alloc();
const TEMP_POSE = IKPoseSchema.alloc();
const MODEL_MATRIX = mat4.create();
const BLENDS: IKPose[] = [];
const WEIGHTS: number[] = [];
const TARGET_POSITION = vec3.create();

const CROUCH_POSE = IKPoseSchema.alloc();
const WALK_POSE = IKPoseSchema.alloc();
const RUN_POSE = IKPoseSchema.alloc();

const SWIM_MOVE_POSE = IKPoseSchema.alloc();
const SWIM_IDLE_POSE = IKPoseSchema.alloc();

const ROLL_POSE = IKPoseSchema.alloc();
const JUMP_POSE = IKPoseSchema.alloc();
const FALL_POSE = IKPoseSchema.alloc();

const FLY_MOVE_POSE = IKPoseSchema.alloc();

const EMOTE_POSE = IKPoseSchema.alloc();
const PUSH_POSE = IKPoseSchema.alloc();

enum PushingState {
  left = 1 << 0,
  right = 1 << 1,
}

function pushWall(
  out: IKState,
  prev: IKState,
  input: IKInput,
  facing: vec2,
  dt: number,
) {
  vec3.copy(out.hitBound.lo, input.hitBound.lo);
  vec3.copy(out.hitBound.hi, input.hitBound.hi);

  // snap direction to input
  vec3.copy(out.hitVector, input.hitVector);
  const f = Math.sqrt(
    Math.pow(out.hitVector[0], 2) + Math.pow(out.hitVector[2], 2),
  );
  if (f < 0.01) {
    if (prev.pushPhase > 0.15) {
      vec3.copy(out.hitVector, prev.hitVector);
    } else {
      vec3.set(out.hitVector, 0, 0, 0);
    }
  } else {
    vec3.normalize(out.hitVector, out.hitVector);
  }
  const retVal = pushForwardPose(out, input, facing);
  return f < 0.01 ? 0 : retVal;
}

function sign(x: number) {
  x = +x;
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}

function pushForwardPose(state: IKState, input: IKInput, facing: vec2) {
  copyIK(PUSH_POSE, POSE);
  const pose = PUSH_POSE;

  vec3.negate(TEMP_VEC3, state.hitVector);
  let hx = TEMP_VEC3[0];
  let hz = TEMP_VEC3[2];
  const l = Math.max(0.0001, Math.sqrt(hx * hx + hz * hz));
  hx /= l;
  hz /= l;
  const by = input.bounds[1];
  const bz = input.bounds[2];
  const [lx, ly] = pose.leftShoulderPosition;
  const [rx, ry] = pose.rightShoulderPosition;
  const [px, py, pz] = state.position;
  const dot = hx * facing[0] + hz * facing[1];
  if (dot < 0.5) {
    vec3.set(state.hitVector, 0, 0, 0);
    state.pushPhase = 0;
    return 0;
  }

  // prevent weird pose
  const hiY = state.hitBound.hi[1] - (py - by);
  const loY = state.hitBound.lo[1] - (py - by);
  let y = (ly + ry) / 2 - 0.1;
  y = Math.min(hiY, y);
  y = Math.max(loY, y);
  if (y < by * 0.5 || y > by * 2) {
    vec3.set(state.hitVector, 0, 0, 0);
    return 0;
  }

  // sketch out hands forward
  const theta = Math.acos(dot / vec2.length(facing));
  const handPosZ = bz;
  const xDir = sign(hx * facing[1] - hz * facing[0]);
  const crossPointX = bz * Math.sin(theta);
  let hix = state.hitBound.hi[0] - px;
  let lox = state.hitBound.lo[0] - px;
  if (Math.abs(hx) > Math.abs(hz)) {
    hix = state.hitBound.hi[2] - pz;
    lox = state.hitBound.lo[2] - pz;
  }
  hix /= Math.cos(theta);
  lox /= Math.cos(theta);
  const inverse = hx > 0 || hz < 0;
  let pushingState = 0;
  if ((!inverse && hix > lx) || (inverse && lox < -lx)) {
    vec3.set(TEMP_VEC3, 0, -1, 0);
    quat.setAxisAngle(
      pose.leftHandOrientation,
      TEMP_VEC3,
      Math.PI / 2 - theta * xDir,
    );
    quat.rotateZ(pose.leftHandOrientation, pose.leftHandOrientation, Math.PI);
    vec3.set(
      pose.leftHandPosition,
      lx,
      y,
      handPosZ + (crossPointX - xDir * lx) * Math.tan(theta),
    );
    vec3.set(pose.leftElbowDirection, pose.leftElbowDirection[0], -1, 0);
    pushingState |= PushingState.left;
  }
  if ((!inverse && lox < rx) || (inverse && hix > -rx)) {
    vec3.set(TEMP_VEC3, 0, 1, 0);
    quat.setAxisAngle(
      pose.rightHandOrientation,
      TEMP_VEC3,
      Math.PI / 2 + theta * xDir,
    );
    quat.rotateZ(pose.rightHandOrientation, pose.rightHandOrientation, Math.PI);
    vec3.set(
      pose.rightHandPosition,
      rx,
      y,
      handPosZ + (crossPointX - xDir * rx) * Math.tan(theta),
    );
    vec3.set(pose.rightElbowDirection, pose.rightElbowDirection[0], -1, 0);
    pushingState |= PushingState.right;
  }

  // tilt body
  pose.headPosition[2] = 0;
  if (y > by * 1.2) {
    // push something higher than player
    pose.headPosition[2] -= bz * 0.5;
    quat.rotateX(pose.headOrientation, pose.headOrientation, -Math.PI / 5);
  }
  pose.leftShoulderPosition[2] = 0;
  pose.rightShoulderPosition[2] = 0;
  return pushingState;
}

const HAND_STICK_THRESHOLD = 0.4;
function stickHand(
  position: vec3,
  stickPosition: vec3,
  prevPosition: vec3,
  dt: number,
) {
  const dist = vec3.dist(position, stickPosition);
  if (dist < HAND_STICK_THRESHOLD) {
    vec3.lerp(position, stickPosition, prevPosition, Math.exp(-0.25 * dt));
  } else {
    vec3.copy(stickPosition, prevPosition);
  }
}

function fixHandStick(
  out: IKState,
  prev: IKState,
  dt: number,
  isPushing: number,
) {
  // push and walk alone the wall
  if (isPushing & PushingState.left) {
    stickHand(
      out.pose.leftHandPosition,
      out.leftHandStick,
      prev.pose.leftHandPosition,
      dt,
    );
  } else {
    vec3.copy(out.leftHandStick, prev.leftHandStick);
  }
  if (isPushing & PushingState.right) {
    stickHand(
      out.pose.rightHandPosition,
      out.rightHandStick,
      prev.pose.rightHandPosition,
      dt,
    );
  } else {
    vec3.copy(out.rightHandStick, prev.rightHandStick);
  }
}

export function initializeIKState(
  out: IKState,
  id: number,
  input: IKInput,
  palette: IKPalette,
) {
  out.id = id;
  out.walkPhase = 0;
  out.swimPhase = 0;
  out.landPhase = 1;
  out.groundEmotePhase = 0;
  vec3.copy(out.position, input.position);
  vec3.copy(out.velocity, input.velocity);
  vec3.set(out.acceleration, 0, 0, 0);
  vec3.set(out.damageTwitch, 0, 0, 0);

  // init facing
  const x = input.inputAxis[0];
  const y = input.inputAxis[2];
  if (!x && !y) {
    vec2.set(out.facing, 0, 1);
  } else {
    vec2.set(out.facing, x, y);
  }

  out.priorityAccumulator = 0;
  out.tickAccumulator = 0;
  out.stretchSpring.x = 1;
  out.stretchSpring.dx = 0;
  out.turnCorrection = 0;
  out.hipCorrection = 0;
  vec3.copy(TARGET_POSITION, input.position);
  TARGET_POSITION[1] -= input.bounds[1];
  copyIK(out.pose, palette.idle);
  scaleIKPose(out.pose, input.scale);
  translateIKInPlace(out.pose, TARGET_POSITION);
  solveIKPoints(out.points, input.rig, out.pose, input.scale);
  solveIKConfiguration(out.configuration, out.points, out.pose);
  scaleIKConfiguration(out.configuration, input.scale);
}

function clearGroundEmote(out: IKState, palette: IKPalette) {
  out.groundEmotePhase = 0;
  out.groundEmote = GroundEmote.none;
  WEIGHTS.push(1);
  BLENDS.push(palette.idle);
}

function playDeadPose(
  out: IKState,
  palette: IKPalette,
  phase: number,
  dt: number,
) {
  hermiteInterpolatePose(EMOTE_POSE, palette.dead, phase);
  WEIGHTS.push(1);
  BLENDS.push(EMOTE_POSE);
  out.groundEmotePhase = Math.min(phase + dt * palette.deadRate, 0.6);
  out.jitterPhase = 0;
  out.breathPhase = 0;
}

function getEmoteInfo(
  palette: IKPalette,
  groundEmote: GroundEmote,
):
  | {
      poses: IKPose[];
      rate: number;
      cycle: number;
    }
  | undefined {
  switch (groundEmote) {
    case GroundEmote.wave:
      return {
        poses: palette.wave,
        rate: palette.waveRate,
        cycle: 1,
      };
    case GroundEmote.thomas:
      return {
        poses: palette.thomas,
        rate: palette.thomasRate,
        cycle: palette.thomasCycle,
      };
    case GroundEmote.swing:
      return {
        poses: palette.swing,
        rate: palette.swingRate,
        cycle: 1,
      };
    case GroundEmote.cheer:
      return {
        poses: palette.cheer,
        rate: palette.cheerRate,
        cycle: palette.cheerCycle,
      };
    case GroundEmote.applaud:
      return {
        poses: palette.applaud,
        rate: palette.applaudRate,
        cycle: 1,
      };
    default:
      return;
  }
}

// This is the main inverse kinematics animation function
// It computes the next player animation state from the previous state and any inputs
export function computeIKState(
  out: IKState,
  prev: IKState,
  input: IKInput,
  palette: IKPalette,
  __dt: number,
) {
  // copy id
  out.id = prev.id;

  const scale = input.scale;
  const invScale = 1 / scale;
  const _dt = __dt + prev.tickAccumulator;
  const dt = invScale * _dt;

  // clear out priority and tick accumulators
  out.tickAccumulator = out.priorityAccumulator = 0;

  out.crouch = input.crouch;
  out.swimming = input.water;
  out.flying = input.fly;

  // update acceleration
  vec3.copy(out.position, input.position);
  vec3.sub(out.velocity, input.velocity, input.platformVelocity);
  if (dt > EPSILON) {
    vec3.subtract(out.acceleration, out.velocity, prev.velocity);
    vec3.scale(out.acceleration, out.acceleration, 1 / dt);
    vec3.lerp(
      out.acceleration,
      out.acceleration,
      prev.acceleration,
      Math.exp(-palette.accelerationDecay * dt),
    );
  } else {
    vec3.copy(out.acceleration, prev.acceleration);
  }

  // update breathing
  const breathPhase = (prev.breathPhase + palette.breathRate * _dt) % 1;
  out.breathPhase = breathPhase;

  // update walk phase
  const walkPhase = prev.walkPhase;
  out.walkPhase = walkPhase;

  // update swim phase
  const swimPhase = prev.swimPhase;
  out.swimPhase = swimPhase;

  const landPhase = prev.landPhase;
  out.landPhase = landPhase;

  // update double jump roll phase
  const rollPhase = prev.rollPhase;
  const initRollAngle = 0.84;
  out.rollPhase = rollPhase;

  // update ground emote
  const isGroundEmoteChanged = out.groundEmote !== prev.groundEmote;
  // 当人物没有死亡，并且表情发生了改变的时候
  // 调整表情进度为0，从头开始播放新表情
  const groundEmotePhase =
    !input.dead && isGroundEmoteChanged ? 0 : prev.groundEmotePhase;
  out.groundEmotePhase = groundEmotePhase;

  const groundVelocity = Math.sqrt(
    Math.pow(out.velocity[0], 2) + Math.pow(out.velocity[2], 2),
  );
  // 地面表情只播放一遍，会被走路状态打断，不会打断死亡状态
  // 当地面速度不为0，或者表情进度大于等于1(已播完一遍)的时候，转为none
  out.groundEmote =
    groundVelocity || groundEmotePhase >= 1 || input.dead
      ? GroundEmote.none
      : prev.groundEmote;

  // 死亡状态优先于其他地面表情，并且不会被地面表情打断
  const groundEmote = input.dead ? GroundEmote.dead : prev.groundEmote;

  // update spring from ground
  const targetStretch =
    1 + clamp(-0.5, 1.2, 6.21 * out.acceleration[1] * invScale);
  updateSpring(
    out.stretchSpring,
    prev.stretchSpring,
    palette.stretchSpring,
    targetStretch,
    dt,
  );
  out.stretchSpring.x = clamp(0.5, 1.5, out.stretchSpring.x);

  // update hurt flash
  out.hurtFlash = Math.max(0, prev.hurtFlash - _dt * 0.1);

  // update facing
  const facing = out.facing;
  let x = out.velocity[0];
  let y = out.velocity[2];
  let h2 = Math.pow(x, 2) + Math.pow(y, 2);
  if (h2 < Math.pow(palette.walkThreshold, 2)) {
    const dfacing = Math.exp(-dt * 0.5);
    x = dfacing * prev.facing[0] + (1 - dfacing) * input.inputAxis[0];
    y = dfacing * prev.facing[1] + (1 - dfacing) * input.inputAxis[2];
    h2 = Math.pow(x, 2) + Math.pow(y, 2);
    h2 = h2 || 1;
  }

  h2 = 1 / Math.sqrt(h2);
  facing[0] = h2 * x;
  facing[1] = h2 * y;
  vec2.lerp(facing, facing, prev.facing, Math.exp(-dt * palette.turnStiffness));
  vec2.normalize(facing, facing);

  // HACK: compute ground contact state by a running average
  const targetGround = input.ground ? 1 : 0;
  const groundWeight =
    out.velocity[1] <= EPSILON ? 0.95 : out.velocity[1] > 0.25 ? 0 : 0.5;
  out.ground = clamp(
    0,
    1,
    targetGround * (1.25 - groundWeight) + prev.ground * groundWeight,
  );

  // update hand jitter
  const v = vec3.dot(input.velocity, input.velocity) * invScale * invScale;
  const jitterPhase =
    prev.jitterPhase + _dt * palette.jitterRate * (1 + v / (v + 1));
  out.jitterPhase = jitterPhase;

  // blend initial target animation
  BLENDS.length = 0;
  WEIGHTS.length = 0;

  if (input.water) {
    out.groundEmote = GroundEmote.none;
    const yv = Math.max(0, out.velocity[1]);
    const velocity = Math.sqrt(
      Math.pow(out.velocity[0], 2) + yv + Math.pow(out.velocity[2], 2),
    );

    // TODO push swim animation
    const swimWeight = Math.min(velocity * 2.5, 1);
    const swimAngle = Math.atan2(-yv * 8, 1);

    mat4.rotateX(
      MODEL_MATRIX,
      mat4.fromTranslation(MODEL_MATRIX, [0, 0.8, 0]),
      swimAngle,
    );
    mat4.translate(MODEL_MATRIX, MODEL_MATRIX, [0, -0.8, 0]);

    if (swimWeight > 0) {
      hermiteInterpolatePose(SWIM_MOVE_POSE, palette.swim, swimPhase);
      out.jitterPhase = 0;
      transformIK(SWIM_MOVE_POSE, SWIM_MOVE_POSE, MODEL_MATRIX);
      WEIGHTS.push(swimWeight);
      BLENDS.push(SWIM_MOVE_POSE);
    }

    const idleWeight = Math.max(0, 1 - swimWeight);
    if (idleWeight > 0) {
      WEIGHTS.push(idleWeight);
      hermiteInterpolatePose(SWIM_IDLE_POSE, palette.swimIdle, swimPhase);
      transformIK(SWIM_IDLE_POSE, SWIM_IDLE_POSE, MODEL_MATRIX);
      BLENDS.push(SWIM_IDLE_POSE);
    }

    out.swimPhase =
      (swimPhase +
        dt *
          ((swimWeight * palette.swimCycle * velocity) / palette.swimStride +
            idleWeight * palette.swimIdleCycle)) %
      1;
  } else if (out.ground > 0.5) {
    // on the ground
    if (groundEmote > 0) {
      switch (groundEmote) {
        case GroundEmote.dead:
          playDeadPose(out, palette, groundEmotePhase, dt);
          vec2.copy(out.facing, prev.facing);
          break;
        case GroundEmote.collapse:
          playCollapsePose(
            { ikState: out, WEIGHTS, BLENDS },
            palette,
            groundEmotePhase,
            dt,
          );
          break;
        case GroundEmote.wave:
        case GroundEmote.thomas:
        case GroundEmote.swing:
        case GroundEmote.cheer:
        case GroundEmote.applaud:
          const info = getEmoteInfo(palette, groundEmote);
          if (!info) {
            clearGroundEmote(out, palette);
            break;
          }
          playEmotePose(
            { ikState: out, WEIGHTS, BLENDS },
            info,
            palette,
            groundEmotePhase,
            dt,
          );
          break;
        default:
          clearGroundEmote(out, palette);
          break;
      }
    } else {
      out.groundEmotePhase = 0;
      const velocity = Math.sqrt(
        Math.pow(out.velocity[0], 2) + Math.pow(out.velocity[2], 2),
      );
      let walkWeight = 0;

      // unstick feet if player is turning
      let turnCorrectFactor = clamp(
        EPSILON,
        1,
        computeFootCorrectionFactor(prev.points) +
          Math.exp(-dt * palette.turnCorrection) * prev.turnCorrection,
      );
      let hipCorrectFactor = 0;
      if (velocity < EPSILON && !input.inputState && landPhase >= 1) {
        hipCorrectFactor = clamp(
          0,
          1,
          computeHipLean(prev.points) -
            0.08 +
            Math.exp(-dt * 0.02) * prev.hipCorrection,
        );
      }

      if (
        velocity > EPSILON ||
        turnCorrectFactor > EPSILON ||
        hipCorrectFactor > 0
      ) {
        out.landPhase = 1;
        out.landVelocity = 0;
        let avgCycle = 0;
        let totalCycleWeight = 0;

        const walkVelocity = palette.walkStride / palette.walkCycle;

        walkWeight += clamp(0, 1, velocity / walkVelocity);
        walkWeight = Math.min(1, walkWeight);

        turnCorrectFactor *= 1 - walkWeight;
        hipCorrectFactor *= 1 - walkWeight;
        const footCorrectFactor = turnCorrectFactor + hipCorrectFactor;

        walkWeight += footCorrectFactor;
        avgCycle += footCorrectFactor;
        totalCycleWeight += footCorrectFactor * footCorrectFactor;

        walkWeight = Math.min(1, walkWeight);

        const runVelocity = palette.runStride / palette.runCycle;
        let runWeight = clamp(walkVelocity, runVelocity, velocity);
        runWeight = (runWeight - walkVelocity) / (runVelocity - walkVelocity);
        if (runWeight < 1) {
          const w = 1 - runWeight;
          let cycle = palette.walkCycle;
          let stride = palette.walkStride;
          if (input.crouch) {
            cycle = CROUCH_CYCLE;
            stride = CROUCH_STRIDE;
          }
          computeWalkPose(
            WALK_POSE,
            palette.walk,
            walkPhase,
            cycle,
            stride,
            velocity,
            input.rig,
          );
          BLENDS.push(WALK_POSE);
          WEIGHTS.push(walkWeight * w);
          avgCycle += w * palette.walkCycle;
          totalCycleWeight += w;
          IKPoseSchema.assign(CROUCH_POSE, WALK_POSE);
        }
        if (runWeight > 0) {
          const w = runWeight;
          computeWalkPose(
            RUN_POSE,
            palette.run,
            walkPhase,
            palette.runCycle,
            palette.runStride,
            velocity,
            input.rig,
          );
          BLENDS.push(RUN_POSE);
          WEIGHTS.push(walkWeight * w);
          avgCycle += w * palette.runCycle;
          totalCycleWeight += w;
          IKPoseSchema.assign(CROUCH_POSE, RUN_POSE);
        }
        out.walkPhase = (walkPhase + (dt * totalCycleWeight) / avgCycle) % 1;
      }

      let idleWeight = 1 - walkWeight;
      if (idleWeight > 0) {
        const landVelocity = prev.landVelocity;
        out.landVelocity = landVelocity;
        if (landPhase < 1 && landVelocity < -palette.landThreshold) {
          // add land animation
          const p = (-landVelocity - palette.landThreshold) / 2;
          const landWeight = p - Math.abs(2 * p * landPhase - p);
          WEIGHTS.push(landWeight);
          BLENDS.push(palette.land);
          idleWeight = 1 - landWeight;
          out.landPhase = landPhase + dt * palette.landRate;
        }
        BLENDS.push(palette.idle);
        WEIGHTS.push(idleWeight);
        IKPoseSchema.assign(CROUCH_POSE, palette.idle);
      }

      if (input.crouch) {
        const d = vec3.dist(CROUCH_POSE.hipPosition, CROUCH_POSE.headPosition);
        applyStretch(CROUCH_POSE, 0.26);
        const angle = 0.25;
        const head = CROUCH_POSE.headPosition;
        head[1] = CROUCH_POSE.hipPosition[1] + d * Math.cos(angle);
        head[2] = CROUCH_POSE.hipPosition[2] + d * Math.sin(angle);
        BLENDS.push(CROUCH_POSE);
        WEIGHTS.push(0.2);
      }
      out.turnCorrection = turnCorrectFactor;
      out.hipCorrection = hipCorrectFactor;
    }
  } else {
    // in the sky
    out.groundEmotePhase = 0;
    out.groundEmote = GroundEmote.none;
    const yv = input.velocity[1];
    if (yv < prev.landVelocity || yv > 0) {
      out.landVelocity = Math.max(yv, -2 - palette.landThreshold);
    }
    let fallWeight = Math.max(0, -yv + 0.25);
    let jumpWeight = Math.max(0, yv + 0.25);

    if (yv < -0.05) {
      out.landPhase = 0;
    }

    const velocity =
      Math.sqrt(Math.pow(out.velocity[0], 2) + Math.pow(out.velocity[2], 2)) *
      invScale;
    const flyWeight = Math.min(velocity, 1);

    if (input.fly && flyWeight > 0) {
      // fly
      jumpWeight = (1 - flyWeight) * jumpWeight;
      fallWeight = (1 - flyWeight) * fallWeight;
      const flyAngle = Math.atan2(velocity - jumpWeight * 4, 1) - Math.PI / 4;
      mat4.rotateX(
        MODEL_MATRIX,
        mat4.fromTranslation(MODEL_MATRIX, [0, 0.8 * invScale, 0]),
        flyAngle,
      );
      mat4.translate(MODEL_MATRIX, MODEL_MATRIX, [0, -0.8 * invScale, 0]);
      transformIK(FLY_MOVE_POSE, palette.fly, MODEL_MATRIX);
      WEIGHTS.push(flyWeight);
      BLENDS.push(FLY_MOVE_POSE);
    }

    if (
      !input.fly &&
      input.jumpState === PlayerJumpState.DOUBLE_JUMP &&
      rollPhase < 2 + initRollAngle
    ) {
      // double jump
      out.rollPhase += _dt * palette.rollRate;

      const rollWeight =
        1.4 - Math.abs(2 * (out.rollPhase - initRollAngle) - 1);
      fallWeight = (1 - rollWeight) * fallWeight;
      jumpWeight = (1 - rollWeight) * jumpWeight;

      mat4.rotateX(
        MODEL_MATRIX,
        mat4.fromTranslation(MODEL_MATRIX, [0, 0.8, 0]),
        out.rollPhase * Math.PI * 2,
      );
      mat4.translate(MODEL_MATRIX, MODEL_MATRIX, [0, -0.8, 0]);
      transformIK(ROLL_POSE, palette.roll, MODEL_MATRIX);
      BLENDS.push(ROLL_POSE);
      WEIGHTS.push(rollWeight);
    }

    if (jumpWeight > 0) {
      BLENDS.push(palette.jump);
      WEIGHTS.push(jumpWeight);
    }

    if (fallWeight > 0) {
      BLENDS.push(palette.fall);
      WEIGHTS.push(fallWeight);
    }

    out.turnCorrection = 0;
  }

  if (input.jumpState === PlayerJumpState.GROUND) {
    out.rollPhase = initRollAngle;
  }

  mixIK(POSE, BLENDS, WEIGHTS, scale);

  // apply push wall
  const pushingState = pushWall(out, prev, input, facing, _dt);
  if (pushingState) {
    out.pushPhase = prev.pushPhase + _dt * 0.35;
  } else {
    out.pushPhase = prev.pushPhase - _dt * 0.13;
  }
  out.pushPhase = Math.max(0, Math.min(1, out.pushPhase));
  if (out.pushPhase > 0) {
    BLENDS.length = 0;
    WEIGHTS.length = 0;
    copyIK(TEMP_POSE, POSE);
    BLENDS.push(TEMP_POSE);
    WEIGHTS.push(1 - out.pushPhase);
    BLENDS.push(PUSH_POSE);
    WEIGHTS.push(out.pushPhase);
    mixIK(POSE, BLENDS, WEIGHTS, 1);
  }

  // apply limb jitter
  applyJitter(POSE, jitterPhase, scale * palette.jitterScale, groundWeight);

  // apply breathing animation
  applyBreathing(POSE, breathPhase, scale * palette.breathMagnitude);

  // apply squash effect
  applyStretch(POSE, out.stretchSpring.x);

  // update damage twitch
  applyDamageTwitch(POSE, prev.damageTwitch, scale);
  vec3.scale(
    out.damageTwitch,
    prev.damageTwitch,
    Math.exp(-0.1 * invScale * dt),
  );

  // apply initial rotation
  computeRotationMatrix(MODEL_MATRIX, facing);
  transformIK(POSE, POSE, MODEL_MATRIX);

  // shift center of mass based on acceleration
  if (!input.water && out.ground < 0.5 && !input.fly) {
    applyAccelerationTilt(
      POSE,
      out.velocity,
      palette.accelerationScale * invScale,
      palette.accelerationCap,
    );
  } else {
    applyAccelerationTilt(
      POSE,
      out.acceleration,
      palette.accelerationScale * invScale,
      palette.accelerationCap,
    );
  }

  // translate to position
  vec3.copy(TARGET_POSITION, input.position);
  TARGET_POSITION[1] -= input.bounds[1];
  translateIKInPlace(POSE, TARGET_POSITION);

  // enforce foot plants
  fixFootSkate(POSE, prev.pose, input, palette, dt);

  // project target points to effectors
  solveIKPoints(out.points, input.rig, POSE, scale);
  getIKPoseFromPointsNoBend(POSE, out.points);

  // blend with previous pose
  BLENDS.length = 0;
  WEIGHTS.length = 0;

  const blendW = Math.exp(-palette.interpolateStiffness * dt);
  WEIGHTS.push(1 - blendW, blendW);
  vec3.subtract(TARGET_POSITION, out.position, prev.position);
  copyIK(PREV_POSE, prev.pose);
  translateIKInPlace(PREV_POSE, TARGET_POSITION);
  BLENDS.push(POSE, PREV_POSE);
  mixIK(out.pose, BLENDS, WEIGHTS, 1);

  // apply platform correction
  fixFootSkate(out.pose, prev.pose, input, palette, dt);

  // fix hand stick
  fixHandStick(out, prev, dt, pushingState);

  // solve for joint configurations
  solveIKPoints(out.points, input.rig, out.pose, input.scale);
  solveIKConfiguration(out.configuration, out.points, out.pose);
  scaleIKConfiguration(out.configuration, scale);
}

export function fastIKState(
  out: IKState,
  prev: IKState,
  input: IKInput,
  palette: IKPalette,
  _dt: number,
) {
  IKStateSchema.assign(out, prev);

  const dt = _dt;
  out.tickAccumulator += dt;

  vec3.copy(out.position, input.position);
  vec3.subtract(TARGET_POSITION, out.position, prev.position);
  translateIKInPlace(out.pose, TARGET_POSITION);

  const x = TARGET_POSITION[0];
  const y = TARGET_POSITION[1];
  const z = TARGET_POSITION[2];

  const points = out.points;
  translatePoint(points.head, x, y, z);
  translatePoint(points.hips, x, y, z);
  translatePoint(points.leftElbow, x, y, z);
  translatePoint(points.leftFoot, x, y, z);
  translatePoint(points.leftHand, x, y, z);
  translatePoint(points.leftHip, x, y, z);
  translatePoint(points.leftKnee, x, y, z);
  translatePoint(points.leftShoulder, x, y, z);
  translatePoint(points.leftToe, x, y, z);
  translatePoint(points.neck, x, y, z);
  translatePoint(points.rightElbow, x, y, z);
  translatePoint(points.rightFoot, x, y, z);
  translatePoint(points.rightHand, x, y, z);
  translatePoint(points.rightHip, x, y, z);
  translatePoint(points.rightKnee, x, y, z);
  translatePoint(points.rightShoulder, x, y, z);
  translatePoint(points.rightToe, x, y, z);
  translatePoint(points.spine, x, y, z);

  const config = out.configuration;
  translateMatrix(config.head, x, y, z);
  translateMatrix(config.hips, x, y, z);
  translateMatrix(config.leftFoot, x, y, z);
  translateMatrix(config.leftHand, x, y, z);
  translateMatrix(config.leftLowerArm, x, y, z);
  translateMatrix(config.leftLowerLeg, x, y, z);
  translateMatrix(config.leftShoulder, x, y, z);
  translateMatrix(config.leftUpperArm, x, y, z);
  translateMatrix(config.leftUpperLeg, x, y, z);
  translateMatrix(config.neck, x, y, z);
  translateMatrix(config.rightFoot, x, y, z);
  translateMatrix(config.rightHand, x, y, z);
  translateMatrix(config.rightLowerArm, x, y, z);
  translateMatrix(config.rightLowerLeg, x, y, z);
  translateMatrix(config.rightShoulder, x, y, z);
  translateMatrix(config.rightUpperArm, x, y, z);
  translateMatrix(config.rightUpperLeg, x, y, z);
  translateMatrix(config.torso, x, y, z);
}
