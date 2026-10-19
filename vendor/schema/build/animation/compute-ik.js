"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyIK = copyIK;
exports.scaleIKPose = scaleIKPose;
exports.clearV = clearV;
exports.accumV = accumV;
exports.scaleV = scaleV;
exports.normV = normV;
exports.mixIK = mixIK;
exports.hermiteInterpolatePose = hermiteInterpolatePose;
exports.playEmotePose = playEmotePose;
exports.playCollapsePose = playCollapsePose;
const gl_matrix_1 = require("gl-matrix");
const ik_schema_1 = require("./ik-schema");
const EPSILON = 1e-3;
function copyIK(dst, src) {
    ik_schema_1.IKPoseSchema.assign(dst, src);
}
function scaleIKPose(outIK, s) {
    if (s === 1) {
        return;
    }
    scaleV(outIK.leftFootPosition, s);
    scaleV(outIK.rightFootPosition, s);
    scaleV(outIK.leftShoulderPosition, s);
    scaleV(outIK.rightShoulderPosition, s);
    scaleV(outIK.leftHandPosition, s);
    scaleV(outIK.rightHandPosition, s);
    scaleV(outIK.headPosition, s);
    scaleV(outIK.hipPosition, s);
    scaleV(outIK.leftToePosition, s);
    scaleV(outIK.rightToePosition, s);
}
function clearV(v) {
    v[0] = v[1] = v[2] = 0;
}
function accumV(out, x, w) {
    out[0] += w * x[0];
    out[1] += w * x[1];
    out[2] += w * x[2];
}
function scaleV(out, w) {
    out[0] *= w;
    out[1] *= w;
    out[2] *= w;
}
function normV(out) {
    gl_matrix_1.vec3.normalize(out, out);
}
function mixIK(outIK, poses, weights, scale) {
    if (poses.length === 1) {
        copyIK(outIK, poses[0]);
        scaleIKPose(outIK, scale);
        return;
    }
    let wtotal = 0;
    clearV(outIK.leftFootPosition);
    clearV(outIK.rightFootPosition);
    clearV(outIK.leftShoulderPosition);
    clearV(outIK.rightShoulderPosition);
    clearV(outIK.leftHandPosition);
    clearV(outIK.rightHandPosition);
    clearV(outIK.headPosition);
    clearV(outIK.hipPosition);
    clearV(outIK.leftToePosition);
    clearV(outIK.rightToePosition);
    clearV(outIK.spineDirection);
    clearV(outIK.leftElbowDirection);
    clearV(outIK.rightElbowDirection);
    clearV(outIK.leftKneeDirection);
    clearV(outIK.rightKneeDirection);
    let leftPlantWeight = 0;
    let rightPlantWeight = 0;
    gl_matrix_1.quat.identity(outIK.leftHandOrientation);
    gl_matrix_1.quat.identity(outIK.rightHandOrientation);
    gl_matrix_1.quat.identity(outIK.headOrientation);
    gl_matrix_1.quat.identity(outIK.hipOrientation);
    for (let i = 0; i < poses.length; ++i) {
        const w = weights[i];
        const p = poses[i];
        if (w < EPSILON) {
            continue;
        }
        wtotal += w;
        leftPlantWeight += w * p.leftPlant;
        rightPlantWeight += w * p.rightPlant;
        accumV(outIK.leftFootPosition, p.leftFootPosition, w);
        accumV(outIK.rightFootPosition, p.rightFootPosition, w);
        accumV(outIK.leftToePosition, p.leftToePosition, w);
        accumV(outIK.rightToePosition, p.rightToePosition, w);
        accumV(outIK.leftShoulderPosition, p.leftShoulderPosition, w);
        accumV(outIK.rightShoulderPosition, p.rightShoulderPosition, w);
        accumV(outIK.leftHandPosition, p.leftHandPosition, w);
        accumV(outIK.rightHandPosition, p.rightHandPosition, w);
        accumV(outIK.headPosition, p.headPosition, w);
        accumV(outIK.hipPosition, p.hipPosition, w);
        accumV(outIK.spineDirection, p.spineDirection, w);
        accumV(outIK.leftElbowDirection, p.leftElbowDirection, w);
        accumV(outIK.rightElbowDirection, p.rightElbowDirection, w);
        accumV(outIK.leftKneeDirection, p.leftKneeDirection, w);
        accumV(outIK.rightKneeDirection, p.rightKneeDirection, w);
        const t = w / wtotal;
        gl_matrix_1.quat.slerp(outIK.leftHandOrientation, outIK.leftHandOrientation, p.leftHandOrientation, t);
        gl_matrix_1.quat.slerp(outIK.rightHandOrientation, outIK.rightHandOrientation, p.rightHandOrientation, t);
        gl_matrix_1.quat.slerp(outIK.headOrientation, outIK.headOrientation, p.headOrientation, t);
        gl_matrix_1.quat.slerp(outIK.hipOrientation, outIK.hipOrientation, p.hipOrientation, t);
    }
    const s = 1 / wtotal;
    scaleIKPose(outIK, scale * s);
    normV(outIK.spineDirection);
    normV(outIK.leftElbowDirection);
    normV(outIK.rightElbowDirection);
    normV(outIK.leftKneeDirection);
    normV(outIK.rightKneeDirection);
    outIK.leftPlant = s * leftPlantWeight;
    outIK.rightPlant = s * rightPlantWeight;
}
const HERMITE_WEIGHTS = [0, 0, 0, 0];
const HERMITE_POSES = [
    ik_schema_1.IKPoseSchema.identity,
    ik_schema_1.IKPoseSchema.identity,
    ik_schema_1.IKPoseSchema.identity,
    ik_schema_1.IKPoseSchema.identity,
];
function hermiteInterpolatePose(out, keyframes, phase) {
    const t = phase * keyframes.length;
    const ti = Math.floor(t);
    const u = t - ti;
    const ui = 1 - u;
    HERMITE_WEIGHTS[0] = Math.pow(ui, 3);
    HERMITE_WEIGHTS[1] = 3 * Math.pow(u, 3) - 6 * Math.pow(u, 2) + 4;
    HERMITE_WEIGHTS[2] = -3 * Math.pow(u, 3) + 3 * Math.pow(u, 2) + 3 * u + 1;
    HERMITE_WEIGHTS[3] = Math.pow(u, 3);
    for (let i = 0; i < 4; ++i) {
        HERMITE_POSES[i] = keyframes[(i + ti) % keyframes.length];
    }
    mixIK(out, HERMITE_POSES, HERMITE_WEIGHTS, 1);
}
const EMOTE_POSE = ik_schema_1.IKPoseSchema.alloc();
function playEmotePose(out, emoteInfo, palette, phase, dt, iterations = 1) {
    const { ikState, WEIGHTS, BLENDS } = out;
    const { poses, rate, cycle } = emoteInfo;
    // 无限循环播放就不管一个动作cycle的次数了，也不用回到idle的状态
    // 播就完事了
    if (iterations <= 0 || !isFinite(iterations)) {
        hermiteInterpolatePose(EMOTE_POSE, poses, phase);
        WEIGHTS.push(1);
        BLENDS.push(EMOTE_POSE);
        ikState.groundEmotePhase = (phase + dt * rate) % 1;
        ikState.jitterPhase = 0;
        return;
    }
    // 动画播放完成后需要丝滑回归到idle状态，将idle的数据加入动画帧前三帧中，用于计算动作帧插值
    const idles = [palette.idle, palette.idle, palette.idle];
    const poseLen = poses.length;
    const idleLen = idles.length;
    // 一次动画重复播放cycle
    const oncePose = [];
    for (let i = 0; i < cycle; i++) {
        oncePose.push(...poses);
    }
    const playPoses = [];
    for (let i = 0; i < iterations; i++) {
        playPoses.push(...oncePose);
    }
    hermiteInterpolatePose(EMOTE_POSE, idles.concat(playPoses), phase);
    WEIGHTS.push(1);
    BLENDS.push(EMOTE_POSE);
    ikState.groundEmotePhase = Math.min(phase + dt * rate * (poseLen / (playPoses.length + idleLen)), 1);
    ikState.jitterPhase = 0;
}
function playCollapsePose(out, palette, phase, dt, iterations = 1) {
    const { ikState, WEIGHTS, BLENDS } = out;
    // 无限循环播就不用回到idle的状态也不用延长
    // 播就完事了
    if (iterations <= 0 || !isFinite(iterations)) {
        hermiteInterpolatePose(EMOTE_POSE, palette.collapse, phase);
        WEIGHTS.push(1);
        BLENDS.push(EMOTE_POSE);
        ikState.groundEmotePhase = (phase + dt * palette.collapseRate) % 1;
        ikState.jitterPhase = 0;
        return;
    }
    const idles = [palette.idle, palette.idle, palette.idle];
    const collapseLen = palette.collapse.length;
    const idleLen = idles.length;
    // 最后一帧延长3(collapsePause)秒，计算暂停秒占用的帧数
    const lastFrames = Math.round((0, ik_schema_1.getTicksBySecond)(palette.collapsePause) *
        palette.collapseRate *
        collapseLen);
    // 生成最后一帧延长的数据
    const lastPoses = [];
    lastPoses.length = lastFrames;
    lastPoses.fill(palette.collapse[collapseLen - 1]);
    // 计算一个pose的数据
    const oncePose = palette.collapse.concat(lastPoses);
    // 计算整个pose的数据
    const poses = [];
    for (let i = 0; i < iterations; i++) {
        poses.push(...oncePose);
    }
    hermiteInterpolatePose(EMOTE_POSE, idles.concat(poses), phase);
    WEIGHTS.push(1);
    BLENDS.push(EMOTE_POSE);
    ikState.groundEmotePhase = Math.min(phase +
        dt * palette.collapseRate * (collapseLen / (poses.length + idleLen)), 1);
    ikState.jitterPhase = 0;
}
//# sourceMappingURL=compute-ik.js.map