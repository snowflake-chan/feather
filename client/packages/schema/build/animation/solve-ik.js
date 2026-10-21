"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveIKPoints = solveIKPoints;
exports.solveIKConfiguration = solveIKConfiguration;
const gl_matrix_1 = require("gl-matrix");
const HIP_FRAME = gl_matrix_1.mat3.create();
const EPSILON = 1e-3;
const D = gl_matrix_1.vec3.create();
const N = gl_matrix_1.vec3.create();
function clamp(lo, hi, v) {
    return Math.max(Math.min(v, hi), lo);
}
function solveJointPos(out, v, base, l0, l1, target) {
    const d = gl_matrix_1.vec3.subtract(D, target, base);
    let d_2 = gl_matrix_1.vec3.dot(d, d);
    // handle degenerate case
    if (d_2 < EPSILON) {
        gl_matrix_1.vec3.scaleAndAdd(out, base, v, l0);
        return;
    }
    // project joint lengths to feasible region
    if (l0 > l1) {
        const c_2 = Math.pow(l0 - l1, 2);
        if (d_2 < c_2) {
            gl_matrix_1.vec3.scale(d, d, Math.sqrt(c_2 / d_2));
            d_2 = c_2;
        }
    }
    const r_2 = Math.pow(l1 + l0, 2);
    if (d_2 > r_2) {
        gl_matrix_1.vec3.scale(d, d, Math.sqrt(r_2 / d_2));
        d_2 = r_2;
    }
    const l0_2 = l0 * l0;
    const l1_2 = l1 * l1;
    const t = (-0.5 * (l1_2 - l0_2 - d_2)) / d_2;
    const x = gl_matrix_1.vec3.scaleAndAdd(out, base, d, t);
    const n = gl_matrix_1.vec3.scaleAndAdd(N, v, d, -gl_matrix_1.vec3.dot(v, d) / d_2);
    const n_2 = gl_matrix_1.vec3.dot(n, n);
    const h_2 = l0_2 - t * t * d_2;
    if (n_2 > EPSILON && h_2 > EPSILON) {
        gl_matrix_1.vec3.scaleAndAdd(x, x, n, Math.sqrt(h_2 / n_2));
    }
}
function solveLink(outEffector, outJoint, base, l0, l1, target, bend) {
    solveJointPos(outJoint, bend, base, l0, l1, target);
    gl_matrix_1.vec3.subtract(outEffector, target, outJoint);
    gl_matrix_1.vec3.scaleAndAdd(outEffector, outJoint, outEffector, Math.sqrt((l1 * l1) / gl_matrix_1.vec3.dot(outEffector, outEffector)));
}
function solveUnit(out, base, length, target) {
    gl_matrix_1.vec3.subtract(out, target, base);
    let d_2 = Math.sqrt(gl_matrix_1.vec3.dot(out, out));
    if (d_2 < EPSILON) {
        out[0] = out[1] = 0;
        out[2] = 1;
        d_2 = 1;
    }
    gl_matrix_1.vec3.scaleAndAdd(out, base, out, length / d_2);
}
// we use an explicit analytic solver here for the IK chain
// this is optimized for a humanoid skeleton and avoids robustness problems and tuning present in a
// more general ik solver at the expense of less generality and more code.
function solveIKPoints(outPoints, skeleton, pose, scale) {
    // solve lower ik chains
    gl_matrix_1.mat3.fromQuat(HIP_FRAME, pose.hipOrientation);
    gl_matrix_1.vec3.copy(outPoints.hips, pose.hipPosition);
    for (let i = 0; i < 3; ++i) {
        outPoints.leftHip[i] =
            outPoints.hips[i] + 0.5 * scale * skeleton.hipWidth * HIP_FRAME[i];
        outPoints.rightHip[i] =
            outPoints.hips[i] - 0.5 * scale * skeleton.hipWidth * HIP_FRAME[i];
    }
    solveLink(outPoints.leftFoot, outPoints.leftKnee, outPoints.leftHip, scale * skeleton.upperLegLength, scale * skeleton.lowerLegLength, pose.leftFootPosition, pose.leftKneeDirection);
    solveLink(outPoints.rightFoot, outPoints.rightKnee, outPoints.rightHip, scale * skeleton.upperLegLength, scale * skeleton.lowerLegLength, pose.rightFootPosition, pose.rightKneeDirection);
    solveUnit(outPoints.leftToe, outPoints.leftFoot, skeleton.footLength, pose.leftToePosition);
    solveUnit(outPoints.rightToe, outPoints.rightFoot, scale * skeleton.footLength, pose.rightToePosition);
    // backward pass for upper ik chain
    solveLink(outPoints.leftShoulder, outPoints.leftElbow, pose.leftHandPosition, scale * skeleton.lowerArmLength, scale * skeleton.upperArmLength, pose.leftShoulderPosition, pose.leftElbowDirection);
    solveLink(outPoints.rightShoulder, outPoints.rightElbow, pose.rightHandPosition, scale * skeleton.lowerArmLength, scale * skeleton.upperArmLength, pose.rightShoulderPosition, pose.rightElbowDirection);
    gl_matrix_1.vec3.lerp(outPoints.neck, outPoints.leftShoulder, outPoints.rightShoulder, 0.5);
    // solve upper ik chain forward pass
    solveLink(outPoints.neck, outPoints.spine, outPoints.hips, scale * skeleton.lowerTorsoLength, scale * skeleton.upperTorsoLength, outPoints.neck, pose.spineDirection);
    solveUnit(outPoints.leftShoulder, outPoints.neck, 0.5 * scale * skeleton.shoulderWidth, outPoints.leftShoulder);
    solveUnit(outPoints.rightShoulder, outPoints.neck, 0.5 * scale * skeleton.shoulderWidth, outPoints.rightShoulder);
    solveLink(outPoints.leftHand, outPoints.leftElbow, outPoints.leftShoulder, scale * skeleton.upperArmLength, scale * skeleton.lowerArmLength, pose.leftHandPosition, pose.leftElbowDirection);
    solveLink(outPoints.rightHand, outPoints.rightElbow, outPoints.rightShoulder, scale * skeleton.upperArmLength, scale * skeleton.lowerArmLength, pose.rightHandPosition, pose.rightElbowDirection);
    solveUnit(outPoints.head, outPoints.neck, scale * skeleton.neckLength, pose.headPosition);
}
const SHOULDER_X = gl_matrix_1.vec3.create();
const SHOULDER_Y = gl_matrix_1.vec3.create();
const SHOULDER_Z = gl_matrix_1.vec3.create();
const UP_VECTOR = gl_matrix_1.vec3.create();
const RIGHT = gl_matrix_1.vec3.create();
const VIEW = gl_matrix_1.vec3.create();
const CENTER = gl_matrix_1.vec3.create();
let PLANT_THRESHOLD = 0.85;
function linkMatrix(out, position, orientation) {
    gl_matrix_1.mat4.fromQuat(out, orientation);
    out[12] = position[0];
    out[13] = position[1];
    out[14] = position[2];
    out[15] = 1;
}
function orthoNormalize(a, b) {
    gl_matrix_1.vec3.scaleAndAdd(a, a, b, -gl_matrix_1.vec3.dot(a, b));
    gl_matrix_1.vec3.normalize(a, a);
}
function assembleMatrix(out, x, y, z, c) {
    for (let i = 0; i < 3; ++i) {
        out[i] = x[i];
        out[i + 4] = y[i];
        out[i + 8] = z[i];
        out[i + 12] = 0;
        out[12 + i] = c[i];
    }
    out[15] = 1;
}
function computeShoulderFrame(out, up, a, b, shoulder) {
    gl_matrix_1.vec3.subtract(SHOULDER_X, a, b);
    gl_matrix_1.vec3.normalize(SHOULDER_X, SHOULDER_X);
    gl_matrix_1.vec3.copy(SHOULDER_Y, up);
    orthoNormalize(SHOULDER_Y, SHOULDER_X);
    gl_matrix_1.vec3.cross(SHOULDER_Z, SHOULDER_X, SHOULDER_Y);
    gl_matrix_1.vec3.normalize(SHOULDER_Z, SHOULDER_Z);
    assembleMatrix(out, SHOULDER_X, SHOULDER_Y, SHOULDER_Z, shoulder);
}
function computeArmFrame(out, a, b, elbowDir) {
    gl_matrix_1.vec3.lerp(CENTER, a, b, 0.5);
    gl_matrix_1.vec3.subtract(RIGHT, b, a);
    gl_matrix_1.vec3.normalize(RIGHT, RIGHT);
    gl_matrix_1.vec3.negate(VIEW, elbowDir);
    orthoNormalize(VIEW, RIGHT);
    gl_matrix_1.vec3.cross(UP_VECTOR, VIEW, RIGHT);
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}
function computeLegFrame(out, a, b, kneeDir) {
    gl_matrix_1.vec3.lerp(CENTER, a, b, 0.5);
    gl_matrix_1.vec3.subtract(UP_VECTOR, b, a);
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    gl_matrix_1.vec3.copy(VIEW, kneeDir);
    orthoNormalize(VIEW, UP_VECTOR);
    gl_matrix_1.vec3.cross(RIGHT, UP_VECTOR, VIEW);
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}
function computeFootFrame(out, foot, toe, knee, kneeDir, plant) {
    gl_matrix_1.vec3.subtract(VIEW, toe, foot);
    gl_matrix_1.vec3.normalize(VIEW, VIEW);
    gl_matrix_1.vec3.subtract(UP_VECTOR, knee, foot);
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    const d = gl_matrix_1.vec3.dot(UP_VECTOR, VIEW);
    gl_matrix_1.vec3.scaleAndAdd(UP_VECTOR, UP_VECTOR, kneeDir, Math.max(0, -d));
    const h = clamp(0, 1, 1 + 10 * (plant - PLANT_THRESHOLD));
    gl_matrix_1.vec3.scale(UP_VECTOR, UP_VECTOR, 1 - h);
    UP_VECTOR[1] += h;
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    orthoNormalize(VIEW, UP_VECTOR);
    gl_matrix_1.vec3.cross(RIGHT, UP_VECTOR, VIEW);
    gl_matrix_1.vec3.normalize(RIGHT, RIGHT);
    gl_matrix_1.vec3.lerp(CENTER, foot, knee, 0.1);
    assembleMatrix(out, RIGHT, UP_VECTOR, VIEW, CENTER);
}
function solveIKConfiguration(outPose, points, pose) {
    linkMatrix(outPose.leftHand, points.leftHand, pose.leftHandOrientation);
    linkMatrix(outPose.rightHand, points.rightHand, pose.rightHandOrientation);
    linkMatrix(outPose.head, points.head, pose.headOrientation);
    linkMatrix(outPose.hips, points.hips, pose.hipOrientation);
    // construct matrix for neck
    gl_matrix_1.vec3.subtract(UP_VECTOR, points.head, points.neck);
    gl_matrix_1.vec3.normalize(UP_VECTOR, UP_VECTOR);
    gl_matrix_1.vec3.subtract(RIGHT, points.leftShoulder, points.rightShoulder);
    orthoNormalize(RIGHT, UP_VECTOR);
    gl_matrix_1.vec3.cross(VIEW, RIGHT, UP_VECTOR);
    gl_matrix_1.vec3.normalize(VIEW, VIEW);
    assembleMatrix(outPose.neck, RIGHT, UP_VECTOR, VIEW, points.neck);
    // construct matrix for torso
    for (let i = 0; i < 3; ++i) {
        VIEW[i] = 0.5 * (outPose.hips[8 + i] + outPose.neck[8 + i]);
    }
    gl_matrix_1.vec3.normalize(VIEW, VIEW);
    gl_matrix_1.vec3.subtract(UP_VECTOR, points.neck, points.hips);
    orthoNormalize(UP_VECTOR, VIEW);
    gl_matrix_1.vec3.cross(RIGHT, UP_VECTOR, VIEW);
    gl_matrix_1.vec3.normalize(RIGHT, RIGHT);
    gl_matrix_1.vec3.lerp(CENTER, points.neck, points.hips, 0.5);
    gl_matrix_1.vec3.lerp(CENTER, CENTER, points.spine, 0.2);
    assembleMatrix(outPose.torso, RIGHT, UP_VECTOR, VIEW, CENTER);
    // keep up vector from head
    computeShoulderFrame(outPose.leftShoulder, UP_VECTOR, points.leftElbow, points.leftShoulder, points.leftShoulder);
    computeShoulderFrame(outPose.rightShoulder, UP_VECTOR, points.rightShoulder, points.rightElbow, points.rightShoulder);
    computeArmFrame(outPose.leftUpperArm, points.leftShoulder, points.leftElbow, pose.leftElbowDirection);
    computeArmFrame(outPose.rightUpperArm, points.rightElbow, points.rightShoulder, pose.rightElbowDirection);
    computeArmFrame(outPose.leftLowerArm, points.leftElbow, points.leftHand, pose.leftElbowDirection);
    computeArmFrame(outPose.rightLowerArm, points.rightHand, points.rightElbow, pose.rightElbowDirection);
    computeLegFrame(outPose.leftUpperLeg, points.leftKnee, points.leftHip, pose.leftKneeDirection);
    computeLegFrame(outPose.leftLowerLeg, points.leftFoot, points.leftKnee, pose.leftKneeDirection);
    computeLegFrame(outPose.rightUpperLeg, points.rightKnee, points.rightHip, pose.rightKneeDirection);
    computeLegFrame(outPose.rightLowerLeg, points.rightFoot, points.rightKnee, pose.rightKneeDirection);
    computeFootFrame(outPose.leftFoot, points.leftFoot, points.leftToe, points.leftKnee, pose.leftKneeDirection, pose.leftPlant);
    computeFootFrame(outPose.rightFoot, points.rightFoot, points.rightToe, points.rightKnee, pose.rightKneeDirection, pose.rightPlant);
}
//# sourceMappingURL=solve-ik.js.map