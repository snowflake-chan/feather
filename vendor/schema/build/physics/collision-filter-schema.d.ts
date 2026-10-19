import { MuArray } from '@box/mudb/schema/array';
import { MuSortedArray } from '@box/mudb/schema/sorted-array';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const CollisionGroupSchema: MuSortedArray<MuVarint>;
export type CollisionGroup = typeof CollisionGroupSchema.identity;
export declare const CollisionFilterSchema: MuArray<MuSortedArray<MuVarint>>;
export type CollisionFilter = typeof CollisionFilterSchema.identity;
