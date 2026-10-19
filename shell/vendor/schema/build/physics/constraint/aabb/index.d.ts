import type { VoxelCollision } from '../../../voxel/voxel-collision-schema';
import { ContactConstraint } from '../interface';
export declare class AABBContact implements ContactConstraint {
    clearContacts(): void;
    sortContacts(): void;
    updateContactIndex(): void;
    propagateLocks(): void;
    processActiveContact(ai: number, bi: number, filter: number[][]): void;
    processFixedContact(ai: number, fi: number, filter: number[][]): void;
    findTerrainContacts(geom: VoxelCollision): void;
    presolveCollisions(): void;
    solveCollisions(): void;
}
