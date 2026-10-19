import { MuArray } from '@box/mudb/schema/array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuVarint } from '@box/mudb/schema/varint';

export const ClientKeyboardEventSchema = new MuStruct({
  id: new MuVarint(),
  tick: new MuVarint(),
  keyDownState: new MuArray(new MuUint8(), Infinity),
  prevKeyDownState: new MuArray(new MuUint8(), Infinity),
});

export const ClientKeyboardEventsSchema = new MuArray(
  ClientKeyboardEventSchema,
  Infinity,
);

export enum KeyBoardEventType {
  KeyDown,
  keyUp,
}
