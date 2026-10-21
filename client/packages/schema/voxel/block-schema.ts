import {
  MuArray,
  MuVarint,
  MuStruct,
  MuDictionary,
  MuUTF8,
  MuUint32,
  MuUint16,
  MuFloat64,
  MuBoolean,
  MuRelativeVarint,
  MuFloat32,
  MuQuantizedFloat,
} from '@box/mudb/schema';
import { HashSchema } from '../content-server/index';
import { MuRefSchema } from '../utils/ref-schema';
import { RelativeArray } from '../utils/relative-array';

export enum BlockSoundGroup {
  default,
}

export enum BlockCategory {
  default,
  symbol,
  number,
  letter,
  color,
  nature,
  structure,
  light,
  food,
  element,
}

export const BlockInfoSchema = new MuStruct({
  // voxel info
  ids: new RelativeArray(new MuRelativeVarint(), Infinity, [0]),
  names: new MuArray(new MuUTF8(), Infinity, ['air']),

  // run length encode these arrays
  emissive: new RelativeArray(new MuVarint(), Infinity, [0]),
  texture: new RelativeArray(
    new MuRelativeVarint(),
    Infinity,
    [0, 0, 0, 0, 0, 0],
  ),
  animLength: new RelativeArray(new MuVarint(1), Infinity, [1, 1, 1, 1, 1, 1]),
  friction: new RelativeArray(new MuQuantizedFloat(1 / 256, 1), Infinity, [0]),
  restitution: new RelativeArray(new MuQuantizedFloat(1 / 256, 0), Infinity, [
    0,
  ]),
  velocity: new RelativeArray(new MuFloat32(0), Infinity, [0, 0, 0]),

  // fluids
  fluids: new MuArray(
    new MuStruct({
      id: new MuVarint(),
      info: new MuUint32(),
      mass: new MuFloat64(1),
    }),
    Infinity,
    [
      {
        id: 0,
        info: 0,
        mass: 0,
      },
    ],
  ),

  // category list
  category: new MuDictionary(
    new RelativeArray(new MuRelativeVarint(), Infinity),
    Infinity,
    {
      default: [0],
    },
  ),

  // texture info
  atlasRadius: new MuVarint(16),
  blockBumpShift: new MuVarint(6),
  blockColorShift: new MuVarint(4),

  // texture atlases
  colorAtlas: new MuArray(HashSchema, Infinity),
  materialAtlas: new MuArray(HashSchema, Infinity),
  bumpAtlas: new MuArray(HashSchema, Infinity),
});

export type BlockInfo = typeof BlockInfoSchema.identity;

export const BlockIndexSchema = new MuStruct({
  id: new MuDictionary(new MuVarint(), Infinity, { air: 0 }),
  valid: new MuArray(new MuBoolean(false), Infinity),
  name: new MuArray(new MuUTF8(), Infinity, ['air']),
  emissive: new MuArray(new MuUint16(), Infinity, [0]),
  texture: new MuArray(new MuUint32(), Infinity, [0, 0, 0, 0, 0, 0]),
  mass: new MuArray(new MuFloat64(), Infinity, [0]),
  restitution: new MuArray(new MuFloat64(), Infinity, [0]),
  friction: new MuArray(new MuFloat64(), Infinity, [0]),
  fluid: new MuArray(new MuVarint(), Infinity, [1]),
  fluidInfo: new MuArray(new MuUint32(), Infinity, [0, 0]),
  velocity: new MuArray(new MuFloat32(0), Infinity, [0, 0, 0]),

  isFluid: new MuRefSchema<Uint8Array>(),
});

export type BlockIndex = typeof BlockIndexSchema.identity;
