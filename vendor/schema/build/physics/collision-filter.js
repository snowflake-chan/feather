"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionFilterSchema = exports.CollisionGroupSchema = void 0;
exports.testCollisionGroup = testCollisionGroup;
exports.testCollisionFilter = testCollisionFilter;
const schema_1 = require("@box/mudb/schema");
exports.CollisionGroupSchema = new schema_1.MuSortedArray(new schema_1.MuVarint(), Infinity, (a, b) => a - b);
exports.CollisionFilterSchema = new schema_1.MuArray(exports.CollisionGroupSchema, Infinity);
function testCollisionGroup(objects, id) {
    if (objects.length === 0) {
        return true;
    }
    let l = 0;
    let h = objects.length - 1;
    let i = -1;
    while (l < h) {
        const a = objects[l];
        const b = objects[h];
        const t = (id - a) / (b - a);
        const m = Math.max(l, Math.min(h, Math.round((1 - t) * l + t * h) | 0));
        const x = objects[m];
        if (x <= id) {
            i = m;
            l = m + 1;
        }
        else {
            h = m - 1;
        }
    }
    if (l === h && objects[l] <= id) {
        return !!(l & 1);
    }
    return !!(i & 1);
}
function testCollisionFilter(filter, groupA, groupB) {
    const a = Math.min(groupA, groupB);
    const b = Math.max(groupA, groupB);
    if (a < 0 || filter.length <= b) {
        return true;
    }
    return testCollisionGroup(filter[b], a);
}
//# sourceMappingURL=collision-filter.js.map