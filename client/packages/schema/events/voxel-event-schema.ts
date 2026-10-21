import {
  MuStruct,
  MuUint32,
  MuUint16,
  MuArray,
  MuBoolean,
} from '@box/mudb/schema';

export const VoxelChangeEventSchema = new MuStruct({
  x: new MuUint32(),
  y: new MuUint32(),
  z: new MuUint32(),
  b: new MuUint16(),
  p: new MuUint16(),
});

export const VoxelEventSchema = new MuStruct({
  voxelChange: new MuArray(VoxelChangeEventSchema, Infinity),
  voxelReset: new MuBoolean(false),
});
