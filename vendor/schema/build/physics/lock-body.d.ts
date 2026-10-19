import { RigidBodySet, ContactIndex } from './physics-schema';
export declare function expandLockSet(bodies: RigidBodySet, contact: ContactIndex, skipPlayers: boolean): void;
export declare const ISLAND_PARENT: Int32Array;
export declare const ISLAND_RANK: Int32Array;
export declare const LOCK_ISLAND = 3500;
export declare function islandFind(a: number): number;
export declare function islandLink(a: number, b: number): void;
//# sourceMappingURL=lock-body.d.ts.map