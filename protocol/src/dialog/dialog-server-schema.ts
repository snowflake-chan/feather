import {
  MuStruct,
  MuVarint,
  MuDictionary,
  MuASCII,
  MuSchema,
  MuFloat64,
  MuArray,
} from '@box/mudb/schema';
import {
  DialogConfig,
  DialogResultSchema,
} from '@box/schema/dialog/dialog-protocol';

export const PendingDialogSchema = new MuStruct({
  promiseId: new MuVarint(),
  type: <MuSchema<DialogConfig['type']>>new MuASCII(),
});

export const DialogConnectionSchema = new MuStruct({
  rpcCounter: new MuVarint(),
  pendingDialogs: new MuDictionary(PendingDialogSchema, Infinity),
});

export const DialogEventSchema = new MuStruct({
  tick: new MuFloat64(),
  id: new MuVarint(),
  promiseId: new MuVarint(),
  result: DialogResultSchema,
});

export const DialogEventSetSchema = new MuArray(DialogEventSchema, Infinity);
