import {
  MuSchema,
  MuStruct,
  MuArray,
  MuUint8,
  MuFloat64,
  MuSortedArray,
  MuVarint,
} from '@box/mudb/schema';

export const VoxelCollisionBoxSchema = new MuStruct({
  minX: new MuUint8(), // 5-bits
  minY: new MuUint8(), // 5-bits
  minZ: new MuUint8(), // 5-bits
  maxX: new MuUint8(), // 5-bits
  maxY: new MuUint8(), // 5-bits
  maxZ: new MuUint8(), // 5-bits
  faces: new MuUint8(), // 6-bits (not strictly necessary)
  block: new MuVarint(), // 16-bits
});
export type VoxelCollisionBox = typeof VoxelCollisionBoxSchema.identity;

export function compareBox(a: VoxelCollisionBox, b: VoxelCollisionBox) {
  return (
    a.minZ - b.minZ ||
    a.minY - b.minY ||
    a.minX - b.minX ||
    a.maxX - b.maxX ||
    a.maxY - b.maxY ||
    a.maxZ - b.maxZ ||
    a.block - b.block ||
    a.faces - b.faces
  );
}
export const VoxelCollisionBoxListSchema = new MuSortedArray(
  VoxelCollisionBoxSchema,
  Infinity,
  compareBox,
);
export type VoxelCollisionBoxList = typeof VoxelCollisionBoxListSchema.identity;

// dumb hack to create a recursive schema
export interface RBushNode {
  children: RBushNode[];
  boxes: VoxelCollisionBox[];
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}
const RBUSH_MUDATA = {
  children: <MuSchema<RBushNode[]>>(<any>null),
  boxes: VoxelCollisionBoxListSchema,
  minX: new MuFloat64(),
  minY: new MuFloat64(),
  minZ: new MuFloat64(),
  maxX: new MuFloat64(),
  maxY: new MuFloat64(),
  maxZ: new MuFloat64(),
};
let baseSchema: MuSchema<RBushNode> = <any>{
  clone: (x) => x,
};
export const RBushSchema: MuSchema<RBushNode> = {
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

RBUSH_MUDATA.children = new MuArray(RBushSchema, Infinity);
baseSchema = new MuStruct(RBUSH_MUDATA);
Object.assign(RBushSchema, baseSchema);
