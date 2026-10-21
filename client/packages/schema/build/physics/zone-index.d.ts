import { PhysicsZone, ZoneSelectorGroup } from '../zone/zone-schema';
export declare class PhysicsZoneIndexNode {
    children: PhysicsZoneIndexNode[];
    boxes: PhysicsZone[];
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
}
export declare class PhysicsZoneIndex {
    pool: PhysicsZoneIndexNode[];
    poolPtr: number;
    root: PhysicsZoneIndexNode;
    selectors: ZoneSelectorGroup[];
    zones: PhysicsZone[];
    private allocNode;
    private createLeafNode;
    private createRBush;
    rebuild(zones: PhysicsZone[], selectors: ZoneSelectorGroup[]): void;
    fx: number;
    fy: number;
    fz: number;
    private _minX;
    private _minY;
    private _minZ;
    private _maxX;
    private _maxY;
    private _maxZ;
    private _groupBin;
    private _groupBit;
    private _invMass;
    private reportLeaves;
    private intersects;
    private searchRBush;
    accumulateForce(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, group: number, invMass: number): void;
}
//# sourceMappingURL=zone-index.d.ts.map