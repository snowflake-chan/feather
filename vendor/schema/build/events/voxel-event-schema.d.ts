import { MuStruct, MuUint32, MuUint16, MuArray, MuBoolean } from '@box/mudb/schema';
export declare const VoxelChangeEventSchema: MuStruct<{
    x: MuUint32;
    y: MuUint32;
    z: MuUint32;
    b: MuUint16;
    p: MuUint16;
}>;
export declare const VoxelEventSchema: MuStruct<{
    voxelChange: MuArray<MuStruct<{
        x: MuUint32;
        y: MuUint32;
        z: MuUint32;
        b: MuUint16;
        p: MuUint16;
    }>>;
    voxelReset: MuBoolean;
}>;
//# sourceMappingURL=voxel-event-schema.d.ts.map