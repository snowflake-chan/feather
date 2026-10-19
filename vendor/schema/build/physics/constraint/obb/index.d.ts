import type { VoxelCollision } from '../../../voxel/voxel-collision-schema';
import { ContactConstraint } from '../interface';
export declare class OBBContact implements ContactConstraint {
    private contactTerrains;
    private contactTerrainsAxis;
    clearContacts(): void;
    sortContacts(): void;
    private addBodiesContactRecord;
    private addVoxelContactList;
    updateContactIndex(): void;
    propagateLocks(): void;
    processActiveContact(ai: number, bi: number, filter: number[][]): void;
    processFixedContact(ai: number, fi: number, filter: number[][]): void;
    findTerrainContacts(geom: VoxelCollision): void;
    presolveCollisions(): void;
    solveCollisions(): void;
}
