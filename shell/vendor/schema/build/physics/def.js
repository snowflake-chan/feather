"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOXEL_EPSILON = exports.CONTACT_CUTOFF = exports.FRICTION_CUTOFF = exports.ACTIVE_ITER_COUNT = exports.MAX_RADIUS = exports.MIN_RADIUS = exports.CONTACT_BLOCK_SIZE = exports.MAX_MASS = exports.MIN_MASS = exports.VELOCITY_CUTOFF = exports.MAX_VELOCITY = exports.MAX_BODIES = void 0;
exports.combineFriction = combineFriction;
exports.combineRestitution = combineRestitution;
exports.calcQuatByVelocity = calcQuatByVelocity;
exports.clampVelocityAndSleep = clampVelocityAndSleep;
exports.MAX_BODIES = 3500;
exports.MAX_VELOCITY = 128;
exports.VELOCITY_CUTOFF = 1 / 256;
exports.MIN_MASS = 1 / 16;
exports.MAX_MASS = 256;
exports.CONTACT_BLOCK_SIZE = 1024;
exports.MIN_RADIUS = 1 / 256;
exports.MAX_RADIUS = 256;
exports.ACTIVE_ITER_COUNT = 2;
exports.FRICTION_CUTOFF = 1 / 1024;
exports.CONTACT_CUTOFF = 1 / 1024;
exports.VOXEL_EPSILON = 1 / 256;
function combineFriction(mu0, mu1) {
    return mu0 * mu1;
}
function combineRestitution(r0, r1) {
    return r0 * r1;
}
function calcQuatByVelocity(out, ax, ay, az, dt) {
    const qw = out[3], qx = out[0], qy = out[1], qz = out[2];
    dt *= 0.5;
    out[0] += dt * (ax * qw + ay * qz - az * qy);
    out[1] += dt * (ay * qw + az * qx - ax * qz);
    out[2] += dt * (az * qw + ax * qy - ay * qx);
    out[3] += dt * (-ax * qx - ay * qy - az * qz);
    const x = out[0];
    const y = out[1];
    const z = out[2];
    const w = out[3];
    let len = x * x + y * y + z * z + w * w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
    }
    out[0] = x * len;
    out[1] = y * len;
    out[2] = z * len;
    out[3] = w * len;
}
function clampVelocityAndSleep(v) {
    if (Math.abs(v) < exports.VELOCITY_CUTOFF) {
        return 0;
    }
    return Math.min(exports.MAX_VELOCITY, Math.max(-exports.MAX_VELOCITY, v));
}
