import { MuStruct, MuUTF8, MuSchema, MuUint8 } from '@box/mudb/schema';

export enum TaskTypeEnum {
  Get,
  Image,
  Downloaded,
  Mesh,
  Steam,
  Chunk,
  Decompress,
  Normal,
}

export const TaskSchema = new MuStruct({
  // ... some property
  taskName: new MuUTF8(),
  taskType: <MuSchema<TaskTypeEnum>>new MuUint8(0),
});

export type Task = typeof TaskSchema.identity;
