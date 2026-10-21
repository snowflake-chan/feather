import { MuArray, MuSortedArray, MuVarint } from '@box/mudb/schema';

export const CollisionGroupSchema = new MuSortedArray(
  new MuVarint(),
  Infinity,
  (a, b) => a - b,
);

export type CollisionGroup = typeof CollisionGroupSchema.identity;

export const CollisionFilterSchema = new MuArray(
  CollisionGroupSchema,
  Infinity,
);

export type CollisionFilter = typeof CollisionFilterSchema.identity;

export function testCollisionGroup(
  objects: CollisionGroup,
  id: number,
): boolean {
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
    } else {
      h = m - 1;
    }
  }
  if (l === h && objects[l] <= id) {
    return !!(l & 1);
  }
  return !!(i & 1);
}

export function testCollisionFilter(
  filter: CollisionFilter,
  groupA: number,
  groupB: number,
) {
  const a = Math.min(groupA, groupB);
  const b = Math.max(groupA, groupB);
  if (a < 0 || filter.length <= b) {
    return true;
  }
  return testCollisionGroup(filter[b], a);
}
