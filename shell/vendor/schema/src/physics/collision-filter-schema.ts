import { MuArray } from '@box/mudb/schema/array';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuVarint } from '@box/mudb/schema/varint';

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
