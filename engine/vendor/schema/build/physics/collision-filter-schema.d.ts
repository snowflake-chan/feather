import { MuArray, MuSortedArray, MuVarint } from '@box/mudb/schema';
export declare const CollisionGroupSchema: MuSortedArray<MuVarint>;
export type CollisionGroup = typeof CollisionGroupSchema.identity;
export declare const CollisionFilterSchema: MuArray<MuSortedArray<MuVarint>>;
export type CollisionFilter = typeof CollisionFilterSchema.identity;
//# sourceMappingURL=collision-filter-schema.d.ts.map