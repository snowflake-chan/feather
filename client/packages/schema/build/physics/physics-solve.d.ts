import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { RigidBody, ContactIndex, PhysicsParams, RigidBodySet } from './physics-schema';
import { BlockIndex } from '../voxel/block-schema';
import { TaggedId } from '@box/utils/id';
import { CollisionFilter } from './collision-filter';
import { PhysicsZoneIndex } from './zone-index';
export * from './def';
export declare function rebuildBodyTree(bodies: RigidBody[]): import("./body-rbush").BodyRBushNode;
/**
 *
 * @param physics
 * @param bodies
 * @param dt
 * @param blockIndex
 * @param geom
 * @param filter
 * @param zones
 */
export declare function solvePhysics(physics: PhysicsParams, bodies: RigidBodySet, dt: number, blockIndex: BlockIndex, geom: VoxelCollision, filter: CollisionFilter, zones: PhysicsZoneIndex): void;
export declare function extractContactIndex(physics: PhysicsParams, bodies: TaggedId[], contactIndex: ContactIndex): void;
export declare function clearBodyLocks(bodies: RigidBodySet): void;
export declare function propagateLocks(physics: PhysicsParams, skipPlayers: boolean): void;
//# sourceMappingURL=physics-solve.d.ts.map