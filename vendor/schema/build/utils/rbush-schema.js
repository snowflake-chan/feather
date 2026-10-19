"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBushSchema = exports.VoxelCollisionBoxListSchema = exports.VoxelCollisionBoxSchema = void 0;
exports.compareBox = compareBox;
const schema_1 = require("@box/mudb/schema");
exports.VoxelCollisionBoxSchema = new schema_1.MuStruct({
    minX: new schema_1.MuUint8(), // 5-bits
    minY: new schema_1.MuUint8(), // 5-bits
    minZ: new schema_1.MuUint8(), // 5-bits
    maxX: new schema_1.MuUint8(), // 5-bits
    maxY: new schema_1.MuUint8(), // 5-bits
    maxZ: new schema_1.MuUint8(), // 5-bits
    faces: new schema_1.MuUint8(), // 6-bits (not strictly necessary)
    block: new schema_1.MuVarint(), // 16-bits
});
function compareBox(a, b) {
    return (a.minZ - b.minZ ||
        a.minY - b.minY ||
        a.minX - b.minX ||
        a.maxX - b.maxX ||
        a.maxY - b.maxY ||
        a.maxZ - b.maxZ ||
        a.block - b.block ||
        a.faces - b.faces);
}
exports.VoxelCollisionBoxListSchema = new schema_1.MuSortedArray(exports.VoxelCollisionBoxSchema, Infinity, compareBox);
const RBUSH_MUDATA = {
    children: null,
    boxes: exports.VoxelCollisionBoxListSchema,
    minX: new schema_1.MuFloat64(),
    minY: new schema_1.MuFloat64(),
    minZ: new schema_1.MuFloat64(),
    maxX: new schema_1.MuFloat64(),
    maxY: new schema_1.MuFloat64(),
    maxZ: new schema_1.MuFloat64(),
};
let baseSchema = {
    clone: (x) => x,
};
exports.RBushSchema = {
    muType: 'struct',
    muData: RBUSH_MUDATA,
    json: { type: 'rbush3d-node' },
    identity: {
        children: [],
        boxes: [],
        minX: 0,
        minY: 0,
        minZ: 0,
        maxX: 0,
        maxY: 0,
        maxZ: 0,
    },
    alloc: () => baseSchema.alloc(),
    clone: (x) => baseSchema.clone(x),
    free: (x) => baseSchema.free(x),
    assign: (x, y) => baseSchema.assign(x, y),
    equal: (x, y) => baseSchema.equal(x, y),
    diff: (a, b, c) => baseSchema.diff(a, b, c),
    patch: (a, b) => baseSchema.patch(a, b),
    toJSON: (a) => baseSchema.toJSON(a),
    fromJSON: (x) => baseSchema.fromJSON(x),
};
RBUSH_MUDATA.children = new schema_1.MuArray(exports.RBushSchema, Infinity);
baseSchema = new schema_1.MuStruct(RBUSH_MUDATA);
Object.assign(exports.RBushSchema, baseSchema);
//# sourceMappingURL=rbush-schema.js.map