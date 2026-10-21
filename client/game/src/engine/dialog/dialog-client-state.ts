import { MuStruct, MuArray } from '@box/mudb/schema';
import { OpenDialogSchema } from '@box/schema/dialog/dialog-protocol';

export const ClientDialogStateSchema = new MuStruct({
  dialogQueue: new MuArray(OpenDialogSchema, Infinity),
});

export type ClientDialogQueue =
  typeof ClientDialogStateSchema.identity.dialogQueue;

export type ClientDialogState = typeof ClientDialogStateSchema.identity;
