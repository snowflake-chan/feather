import { MuArray, MuSortedArray, MuVarint } from '@box/mudb/schema';
export declare const CollisionGroupSchema: MuSortedArray<MuVarint>;
export type CollisionGroup = typeof CollisionGroupSchema.identity;
export declare const CollisionFilterSchema: MuArray<MuSortedArray<MuVarint>>;
export type CollisionFilter = typeof CollisionFilterSchema.identity;
export declare function testCollisionGroup(objects: CollisionGroup, id: number): boolean;
export declare function testCollisionFilter(filter: CollisionFilter, groupA: number, groupB: number): boolean;
//# sourceMappingURL=collision-filter.d.ts.map