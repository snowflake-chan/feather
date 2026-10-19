"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyRaycastSchema = void 0;
exports.raycastBoxes = raycastBoxes;
const boolean_1 = require("@box/mudb/schema/boolean");
const float64_1 = require("@box/mudb/schema/float64");
const struct_1 = require("@box/mudb/schema/struct");
const uint32_1 = require("@box/mudb/schema/uint32");
const math_schema_1 = require("../utils/math-schema");
const box_collide_1 = require("./box-collide");
const gl_matrix_1 = require("gl-matrix");
exports.BodyRaycastSchema = new struct_1.MuStruct({
    hit: new boolean_1.MuBoolean(),
    hitTime: new float64_1.MuFloat64(),
    hitId: new uint32_1.MuUint32(0),
    hitPosition: math_schema_1.Vec3Schema,
    hitNormal: math_schema_1.Vec3Schema,
});
const EPSILON = 1e-6;
function raycastBoxes(result, boxes, ox, oy, oz, dx, dy, dz, skipId) {
    result.hitTime = Infinity;
    result.hit = false;
    let count = 0;
    let idx;
    let idy;
    let idz;
    if (Math.abs(dx) > EPSILON) {
        idx = 1 / dx;
    }
    else {
        idx = Infinity;
        ++count;
    }
    if (Math.abs(dy) > EPSILON) {
        idy = 1 / dy;
    }
    else {
        idy = Infinity;
        ++count;
    }
    if (Math.abs(dz) > EPSILON) {
        idz = 1 / dz;
    }
    else {
        idz = Infinity;
        ++count;
    }
    // handle case where ray has no direction
    if (count < 3) {
        let axis = 0;
        for (let i = 0; i < boxes.length; ++i) {
            const { id, px, py, pz, rx, ry, rz } = boxes[i];
            if (id === skipId) {
                continue;
            }
            const hit = (0, box_collide_1.boxRayIntersectRecip)(px - rx, py - ry, pz - rz, px + rx, py + ry, pz + rz, idx, idy, idz, ox, oy, oz);
            if (hit.collides && hit.t < result.hitTime) {
                result.hit = true;
                result.hitId = id;
                result.hitTime = hit.t;
                axis = hit.axis;
            }
        }
        if (result.hit) {
            const P = result.hitPosition;
            const N = result.hitNormal;
            const t = result.hitTime;
            P[0] = ox + dx * t;
            P[1] = oy + dy * t;
            P[2] = oz + dz * t;
            N[0] = N[1] = N[2] = 0;
            const d = axis === 0 ? dx : axis === 1 ? dy : dz;
            N[axis] = d < 0 ? -1 : 1;
            return true;
        }
    }
    result.hitId = 0;
    gl_matrix_1.vec3.set(result.hitPosition, ox, oy, oz);
    gl_matrix_1.vec3.set(result.hitNormal, 0, 0, 0);
    return false;
}
