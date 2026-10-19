import { VoxelCollisionBox } from '../../../utils/rbush-schema';
import { ArrayType } from '../../prepare-bodies';
export declare class TerrainContactSet {
    outA: number[];
    outMu: number[];
    outBias: number[];
    outLambda: number[];
    outFriction: number[];
    /**
     * 当同一个刚体碰撞到不同地形的时候
     * xxxBoxOffset记录了同个刚体对应outBoxes中哪些地形
     * const boxStart = outBoxOffset[2 * i];
     * const boxEnd = outBoxOffset[2 * i + 1];
     * 从 outBoxes[boxStart] 到 outBoxes[boxEnd]
     */
    outBoxOffset: number[];
    outBoxes: VoxelCollisionBox[];
    outVel: number[];
    inA: number[];
    inMu: number[];
    inBias: number[];
    inLambda: number[];
    inFriction: number[];
    inBoxOffset: number[];
    inBoxes: VoxelCollisionBox[];
    clear(): void;
    pushMotor(ai: number, terrainBox: VoxelCollisionBox, depth: number, v: ArrayType): void;
    push(flip: boolean, ai: number, terrainBox: VoxelCollisionBox, depth: number, v: ArrayType): void;
    applyFrictionMotor(du: ArrayType, dv: ArrayType): void;
    applyFriction(du: ArrayType, dv: ArrayType): void;
    updateIndex(d: number): void;
}
export declare const TERRAIN_X_CONTACTS: TerrainContactSet;
export declare const TERRAIN_Y_CONTACTS: TerrainContactSet;
export declare const TERRAIN_Z_CONTACTS: TerrainContactSet;
export declare function clearTerrainContacts(): void;
