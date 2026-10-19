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
