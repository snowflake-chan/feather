import { MuStruct, MuUTF8, MuSchema } from '@box/mudb/schema';
export declare enum TaskTypeEnum {
    Get = 0,
    Image = 1,
    Downloaded = 2,
    Mesh = 3,
    Steam = 4,
    Chunk = 5,
    Decompress = 6,
    Normal = 7
}
export declare const TaskSchema: MuStruct<{
    taskName: MuUTF8;
    taskType: MuSchema<TaskTypeEnum>;
}>;
export type Task = typeof TaskSchema.identity;
//# sourceMappingURL=loading-schema.d.ts.map