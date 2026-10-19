import { MuStruct, MuVarint, MuFloat64, MuSortedArray } from '@box/mudb/schema';
import { compareId } from '@box/utils/id';

export const InteractEventSchema = new MuStruct({
  id: new MuVarint(),
  targetId: new MuVarint(),
  tick: new MuFloat64(),
});

export type InteractEvent = typeof InteractEventSchema.identity;

export const InteractiveEventSetSchema = new MuSortedArray(
  InteractEventSchema,
  Infinity,
  compareId,
);

export const InteractServerStateSchema = new MuStruct({
  // interaction state
});
