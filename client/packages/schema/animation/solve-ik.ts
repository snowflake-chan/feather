import { mat3, vec3, mat4, quat } from 'gl-matrix';
import { IKRig, IKPose, IKPoints, IKConfiguration } from './ik-schema';

const HIP_FRAME = mat3.create();
const EPSILON = 1e-3;
const D = vec3.create();
const N = vec3.create();

function clamp(lo: number, hi: number, v: number) {
  return Math.max(Math.min(v, hi), lo);
}

function solveJointPos(
  out: vec3,
  v: vec3,
  base: vec3,
  l0: number,
  l1: number,
  target: vec3,
) {
  const d = vec3.subtract(D, target, base);
  let d_2 = vec3.dot(d, d);

  // handle degenerate case
  if (d_2 < EPSILON) {
    vec3.scaleAndAdd(out, base, v, l0);
    return;
  }

  // project joint lengths to feasible region
  if (l0 > l1) {
    const c_2 = Math.pow(l0 - l1, 2);
    if (d_2 < c_2) {
      vec3.scale(d, d, Math.sqrt(c_2 / d_2));
      d_2 = c_2;
    }
  }
  const r_2 = Math.pow(l1 + l0, 2);
  if (d_2 > r_2) {
    vec3.scale(d, d, Math.sqrt(r_2 / d_2));
    d_2 = r_2;
  }

  const l0_2 = l0 * l0;
  const l1_2 = l1 * l1;
  const t = (-0.5 * (l1_2 - l0_2 - d_2)) / d_2;

  const x = vec3.scaleAndAdd(out, base, d, t);

  const n = vec3.scaleAndAdd(N, v, d, -vec3.dot(v, d) / d_2);
  const n_2 = vec3.dot(n, n);
  const h_2 = l0_2 - t * t * d_2;
  if (n_2 > EPSILON && h_2 > EPSILON) {
    vec3.scaleAndAdd(x, x, n, Math.sqrt(h_2 / n_2));
  }
}

function solveLink(
  outEffector: vec3,
  outJoint: vec3,
  base: vec3,
  l0: number,
  l1: number,
  target: vec3,
  bend: vec3,
) {
  solveJointPos(outJoint, bend, base, l0, l1, target);
  vec3.subtract(outEffector, target, outJoint);
  vec3.scaleAndAdd(
    outEffector,
    outJoint,
    outEffector,
    Math.sqrt((l1 * l1) / vec3.dot(outEffector, outEffector)),
  );
}

function solveUnit(out: vec3, base: vec3, length: number, target: vec3) {
  vec3.subtract(out, target, base);
  let d_2 = Math.sqrt(vec3.dot(out, out));
  if (d_2 < EPSILON) {
    out[0] = out[1] = 0;
    out[2] = 1;
    d_2 = 1;
  }
  vec3.scaleAndAdd(out, base, out, length / d_2);
}

// we use an explicit analytic solver here for the IK chain
// this is optimized for a humanoid skeleton and avoids robustness problems and tuning present in a
// more general ik solver at the expense of less generality and more code.
export function solveIKPoints(
  outPoints: IKPoints,
  skeleton: IKRig,
  pose: IKPose,
  scale: number,
) {
  // solve lower ik chains
  mat3.fromQuat(HIP_FRAME, pose.hipOrientation);
  vec3.copy(outPoints.hips, pose.hipPosition);
  for (let i = 0; i < 3; ++i) {
    outPoints.leftHip[i] =
      outPoints.hips[i] + 0.5 * scale * skeleton.hipWidth * HIP_FRAME[i];
    outPoints.rightHip[i] =
      outPoints.hips[i] - 0.5 * scale * skeleton.hipWidth * HIP_FRAME[i];
  }
  solveLink(
    outPoints.leftFoot,
    outPoints.leftKnee,
    outPoints.leftHip,
    scale * skeleton.upperLegLength,
    scale * skeleton.lowerLegLength,
    pose.leftFootPosition,
    pose.leftKneeDirection,
  );
  solveLink(
    outPoints.rightFoot,
    outPoints.rightKnee,
    outPoints.rightHip,
    scale * skeleton.upperLegLength,
    scale * skeleton.lowerLegLength,
    pose.rightFootPosition,
    pose.rightKneeDirection,
  );
  solveUnit(
    outPoints.leftToe,
    outPoints.leftFoot,
    skeleton.footLength,
    pose.leftToePosition,
  );
  solveUnit(
    outPoints.rightToe,
    outPoints.rightFoot,
    scale * skeleton.footLength,
    pose.rightToePosition,
  );

  // backward pass for upper ik chain
  solveLink(
    outPoints.leftShoulder,
    outPoints.leftElbow,
    pose.leftHandPosition,
    scale * skeleton.lowerArmLength,
    scale * skeleton.upperArmLength,
    pose.leftShoulderPosition,
    pose.leftElbowDirection,
  );
  solveLink(
    outPoints.rightShoulder,
    outPoints.rightElbow,
    pose.rightHandPosition,
    scale * skeleton.lowerArmLength,
    scale * skeleton.upperArmLength,
    pose.rightShoulderPosition,
    pose.rightElbowDirection,
  );
  vec3.lerp(
    outPoints.neck,
    outPoints.leftShoulder,
    outPoints.rightShoulder,
    0.5,
  );

  // solve upper ik chain forward pass
  solveLink(
    outPoints.neck,
    outPoints.spine,
    outPoints.hips,
    scale * skeleton.lowerTorsoLength,
    scale * skeleton.upperTorsoLength,
    outPoints.neck,
    pose.spineDirection,
  );
  solveUnit(
    outPoints.leftShoulder,
    outPoints.neck,
    0.5 * scale * skeleton.shoulderWidth,
    outPoints.leftShoulder,
  );
  solveUnit(
    outPoints.rightShoulder,
    outPoints.neck,
    0.5 * scale * skeleton.shoulderWidth,
    outPoints.rightShoulder,
  );
  solveLink(
    outPoints.leftHand,
    outPoints.leftElbow,
    outPoints.leftShoulder,
    scale * skeleton.upperArmLength,
    scale * skeleton.lowerArmLength,
    pose.leftHandPosition,
    pose.leftElbowDirection,
  );
  solveLink(
    outPoints.rightHand,
    outPoints.rightElbow,
    outPoints.rightShoulder,
    scale * skeleton.upperArmLength,
    scale * skeleton.lowerArmLength,
    pose.rightHandPosition,
    pose.rightElbowDirection,
  );
  solveUnit(
    outPoints.head,
    outPoints.neck,
    scale * skeleton.neckLength,
    pose.headPosition,
  );
}

const SHOULDER_X = vec3.create();
const SHOULDER_Y = vec3.create();
const SHOULDER_Z = vec3.create();

const UP_VECTOR = vec3.create();
const RIGHT = vec3.create();
const VIEW = vec3.create();
const CENTER = vec3.create();

let PLANT_THRESHOLD = 0.85;

function linkMatrix(out: mat4, position: vec3, orientation: quat) {
  mat4.fromQuat(out, orientation);
  out[12] = position[0];
  out[13] = position[1];
  out[14] = position[2];
  out[15] = 1;
}

function orthoNormalize(a: vec3, b: vec3) {
  vec3.scaleAndAdd(a, a, b, -vec3.dot(a, b));
  vec3.normalize(a, a);
}

function assembleMatrix(out: mat4, x: vec3, y: vec3, z: vec3, c: vec3) {
  for (let i = 0; i < 3; ++i) {
    out[i] = x[i];
    out[i + 4] = y[i];
    out[i + 8] = z[i];
    out[i + 12] = 0;
    out[12 + i] = c[i];
  }
  out[15] = 1;
}

function computeShoulderFrame(
  out: mat4,
  up: vec3,
  a: vec3,
  b: vec3,
  shoulder: vec3,
) {
  vec3.subtract(SHOULDER_X, a, b);
  vec3.normalize(SHOULDER_X, SHOULDER_X);
  vec3.copy(SHOULDER_Y, up);
  orthoNormalize(SHOULDER_Y, SHOULDER_X);
  vec3.cross(SHOULDER_Z, SHOULDER_X, SHOULDER_Y);
  vec3.normalize(SHOULDER_Z, SHOULDER_Z);
  assembleMatrix(out, SHOULDER_X, SHOULDER_Y, SHOULDER_Z, shoulder);
}

function computeArmFrame(out: mat4, a: vec3, b: vec3, elbowDir: vec3) {
  vec3.lerp(CENTER, a, b, 0.5);
  vec3.subtract(RIGHT, b, a);
  vec3.normalize(RIGHT, RIGHT);
  vec3.negate(VIEW, elbowDir);
  orthoNormalize(VIEW, RIGHT);
  vec3.cross(UP_VECTOR, VIEW, RIGHT);
  vec3.normalize(UP_VECTOR, UP_VECTOR);
  assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}

function computeLegFrame(out: mat4, a: vec3, b: vec3, kneeDir: vec3) {
  vec3.lerp(CENTER, a, b, 0.5);
  vec3.subtract(UP_VECTOR, b, a);
  vec3.normalize(UP_VECTOR, UP_VECTOR);
  vec3.copy(VIEW, kneeDir);
  orthoNormalize(VIEW, UP_VECTOR);
  vec3.cross(RIGHT, UP_VECTOR, VIEW);
  vec3.normalize(UP_VECTOR, UP_VECTOR);
  assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}

function computeFootFrame(
  out: mat4,
  foot: vec3,
  toe: vec3,
  knee: vec3,
  kneeDir: vec3,
  plant: number,
) {
  vec3.subtract(VIEW, toe, foot);
  vec3.normalize(VIEW, VIEW);

  vec3.subtract(UP_VECTOR, knee, foot);
  vec3.normalize(UP_VECTOR, UP_VECTOR);

  const d = vec3.dot(UP_VECTOR, VIEW);
  vec3.scaleAndAdd(UP_VECTOR, UP_VECTOR, kneeDir, Math.max(0, -d));

  const h = clamp(0, 1, 1 + 10 * (plant - PLANT_THRESHOLD));
  vec3.scale(UP_VECTOR, UP_VECTOR, 1 - h);
  UP_VECTOR[1] += h;
  vec3.normalize(UP_VECTOR, UP_VECTOR);

  orthoNormalize(VIEW, UP_VECTOR);

  vec3.cross(RIGHT, UP_VECTOR, VIEW);
  vec3.normalize(RIGHT, RIGHT);

  vec3.lerp(CENTER, foot, knee, 0.1);
  assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}

export function solveIKConfiguration(
  outPose: IKConfiguration,
  points: IKPoints,
  pose: IKPose,
) {
  linkMatrix(outPose.leftHand, points.leftHand, pose.leftHandOrientation);
  linkMatrix(outPose.rightHand, points.rightHand, pose.rightHandOrientation);
  linkMatrix(outPose.head, points.head, pose.headOrientation);
  linkMatrix(outPose.hips, points.hips, pose.hipOrientation);

  // construct matrix for neck
  vec3.subtract(UP_VECTOR, points.head, points.neck);
  vec3.normalize(UP_VECTOR, UP_VECTOR);
  vec3.subtract(RIGHT, points.leftShoulder, points.rightShoulder);
  orthoNormalize(RIGHT, UP_VECTOR);
  vec3.cross(VIEW, RIGHT, UP_VECTOR);
  vec3.normalize(VIEW, VIEW);
  assembleMatrix(outPose.neck, RIGHT, UP_VECTOR, VIEW, points.neck);

  // construct matrix for torso
  for (let i = 0; i < 3; ++i) {
    VIEW[i] = 0.5 * (outPose.hips[8 + i] + outPose.neck[8 + i]);
  }
  vec3.normalize(VIEW, VIEW);
  vec3.subtract(UP_VECTOR, points.neck, points.hips);
  orthoNormalize(UP_VECTOR, VIEW);
  vec3.cross(RIGHT, UP_VECTOR, VIEW);
  vec3.normalize(RIGHT, RIGHT);
  vec3.lerp(CENTER, points.neck, points.hips, 0.5);
  vec3.lerp(CENTER, CENTER, points.spine, 0.2);
  assembleMatrix(outPose.torso, RIGHT, UP_VECTOR, VIEW, CENTER);

  // keep up vector from head
  computeShoulderFrame(
    outPose.leftShoulder,
    UP_VECTOR,
    points.leftElbow,
    points.leftShoulder,
    points.leftShoulder,
  );
  computeShoulderFrame(
    outPose.rightShoulder,
    UP_VECTOR,
    points.rightShoulder,
    points.rightElbow,
    points.rightShoulder,
  );
  computeArmFrame(
    outPose.leftUpperArm,
    points.leftShoulder,
    points.leftElbow,
    pose.leftElbowDirection,
  );
  computeArmFrame(
    outPose.rightUpperArm,
    points.rightElbow,
    points.rightShoulder,
    pose.rightElbowDirection,
  );
  computeArmFrame(
    outPose.leftLowerArm,
    points.leftElbow,
    points.leftHand,
    pose.leftElbowDirection,
  );
  computeArmFrame(
    outPose.rightLowerArm,
    points.rightHand,
    points.rightElbow,
    pose.rightElbowDirection,
  );

  computeLegFrame(
    outPose.leftUpperLeg,
    points.leftKnee,
    points.leftHip,
    pose.leftKneeDirection,
  );
  computeLegFrame(
    outPose.leftLowerLeg,
    points.leftFoot,
    points.leftKnee,
    pose.leftKneeDirection,
  );
  computeLegFrame(
    outPose.rightUpperLeg,
    points.rightKnee,
    points.rightHip,
    pose.rightKneeDirection,
  );
  computeLegFrame(
    outPose.rightLowerLeg,
    points.rightFoot,
    points.rightKnee,
    pose.rightKneeDirection,
  );

  computeFootFrame(
    outPose.leftFoot,
    points.leftFoot,
    points.leftToe,
    points.leftKnee,
    pose.leftKneeDirection,
    pose.leftPlant,
  );
  computeFootFrame(
    outPose.rightFoot,
    points.rightFoot,
    points.rightToe,
    points.rightKnee,
    pose.rightKneeDirection,
    pose.rightPlant,
  );
}
