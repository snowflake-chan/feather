import {
  BlockIndexSchema,
  BlockInfo,
  BlockInfoSchema,
} from '@box/schema/voxel/block-schema';
import { unpackBlockIndex } from '@box/schema/voxel/blocks';
import { MuWriteStream } from '@box/mudb/stream';

export const TEST_BLOCK_INFO: BlockInfo = {
  names: ['air', 'solid', 'liquid', 'ice', 'bounce'],
  ids: [0, 1, 2, 3, 5],
  emissive: [0, 0, 0, 0, 0],
  friction: [0, 1, 0, 0, 1],
  restitution: [0, 0, 0, 0, 1],
  fluids: [
    {
      id: 0,
      mass: 0,
      info: 0,
    },
    {
      id: 2,
      mass: 1,
      info: 0,
    },
  ],
  texture: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ],
  animLength: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
  ],
  velocity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  category: {},
  atlasRadius: 16,
  blockBumpShift: 6,
  blockColorShift: 4,
  colorAtlas: [],
  bumpAtlas: [],
  materialAtlas: [],
};
export const TEST_BLOCK_INDEX = BlockIndexSchema.alloc();
unpackBlockIndex(TEST_BLOCK_INFO, TEST_BLOCK_INDEX);

const stream = new MuWriteStream(1);
BlockInfoSchema.diff(BlockInfoSchema.identity, TEST_BLOCK_INFO, stream);
export const BLOCK_INFO_BYTES = stream.bytes();
