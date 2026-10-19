import { MuStruct, MuUint32, MuFloat64, MuBoolean } from '@box/mudb/schema';
import { NetInput, NetState, NetClientInput } from './net-schema';
import { RigidBody, ContactIndex } from '../physics/physics-schema';
import { VoxelCollision } from '../voxel/voxel-collision-schema';
import { BlockIndex } from '../voxel/block-schema';
import { PhysicsZoneIndex } from '../physics/zone-index';
export declare function netTick(netState: NetState, netInput: NetInput, blockIndex: BlockIndex, collision: VoxelCollision, contact: ContactIndex, zoneIndex: PhysicsZoneIndex, updateLocks: boolean, fullContact: boolean): import("@box/mudb/schema/struct").Struct<{
    players: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        physGround: MuBoolean;
        physFluid: import("@box/mudb/schema").MuQuantizedFloat;
        platformX: import("@box/mudb/schema").MuQuantizedFloat;
        platformY: import("@box/mudb/schema").MuQuantizedFloat;
        platformZ: import("@box/mudb/schema").MuQuantizedFloat;
        occupancy: import("@box/mudb/schema").MuUint8;
        flags: import("@box/mudb/schema").MuSchema<import("../player/player-schema").PlayerFlags>;
        walkSpeed: import("@box/mudb/schema").MuQuantizedFloat;
        walkAcceleration: import("@box/mudb/schema").MuQuantizedFloat;
        runSpeed: import("@box/mudb/schema").MuQuantizedFloat;
        runAcceleration: import("@box/mudb/schema").MuQuantizedFloat;
        crouchSpeed: import("@box/mudb/schema").MuQuantizedFloat;
        crouchAcceleration: import("@box/mudb/schema").MuQuantizedFloat;
        swimSpeed: import("@box/mudb/schema").MuQuantizedFloat;
        swimAcceleration: import("@box/mudb/schema").MuQuantizedFloat;
        flySpeed: import("@box/mudb/schema").MuQuantizedFloat;
        flyAcceleration: import("@box/mudb/schema").MuQuantizedFloat;
        jumpSpeedFactor: import("@box/mudb/schema").MuQuantizedFloat;
        jumpAccelerationFactor: import("@box/mudb/schema").MuQuantizedFloat;
        jumpPower: import("@box/mudb/schema").MuQuantizedFloat;
        doubleJumpPower: import("@box/mudb/schema").MuQuantizedFloat;
        freezedForwardAngle: import("@box/mudb/schema").MuUint16;
        inputDirectionState: import("@box/mudb/schema").MuUint8;
        stepHeight: import("@box/mudb/schema").MuQuantizedFloat;
    }>>;
    playerInputs: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: MuUint32;
        state: import("@box/mudb/schema").MuUint16;
        angle: import("@box/mudb/schema").MuUint8;
        cameraAngle: import("@box/mudb/schema").MuUint8;
        pitch: import("@box/mudb/schema").MuUint8;
    }>>;
    physics: MuStruct<{
        gravity: MuFloat64;
        velocityDamping: MuFloat64;
        useOBB: MuBoolean;
    }>;
    bodies: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuSchema<RigidBody> & {
        pool: RigidBody[];
        stats: () => any;
    }>;
    collisionFilter: import("@box/mudb/schema").MuArray<import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuVarint>>;
    zones: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        minX: import("@box/mudb/schema").MuQuantizedFloat;
        minY: import("@box/mudb/schema").MuQuantizedFloat;
        minZ: import("@box/mudb/schema").MuQuantizedFloat;
        maxX: import("@box/mudb/schema").MuQuantizedFloat;
        maxY: import("@box/mudb/schema").MuQuantizedFloat;
        maxZ: import("@box/mudb/schema").MuQuantizedFloat;
        selectorGroup: import("@box/mudb/schema").MuVarint;
        massScale: import("@box/mudb/schema").MuQuantizedFloat;
        fx: import("@box/mudb/schema").MuQuantizedFloat;
        fy: import("@box/mudb/schema").MuQuantizedFloat;
        fz: import("@box/mudb/schema").MuQuantizedFloat;
    }>>;
    zoneSelectors: import("@box/mudb/schema").MuSortedArray<MuStruct<{
        id: import("@box/mudb/schema").MuVarint;
        groupBits: import("@box/mudb/schema").MuSortedArray<import("@box/mudb/schema").MuVarint>;
    }>>;
}>;
export declare function mergeNetInput(input: NetInput, id: number, clientInput: NetClientInput, allowBodyUpdates: boolean): void;
//# sourceMappingURL=net-tick.d.ts.map