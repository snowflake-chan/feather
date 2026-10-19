import {
  MuStruct,
  MuInt32,
  MuASCII,
  MuSortedArray,
  MuDictionary,
} from '@box/mudb/schema';
import { compareId } from '@box/utils/id';

export const SeedLinkSchema = new MuStruct({
  id: new MuInt32(0), // entity id
  seedId: new MuASCII(), // linked seed
});

export const EntitySeedLinkSetSchema = new MuSortedArray(
  SeedLinkSchema,
  Infinity,
  compareId,
);

export const SeedEntityLinkSchema = new MuDictionary(new MuInt32(0), Infinity);

export const SeedStateSchema = new MuStruct({
  // link data structures and indexes
  entityToSeed: EntitySeedLinkSetSchema,
  seedToEntity: SeedEntityLinkSchema,
});
