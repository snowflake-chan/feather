import { MuArray, MuStruct, MuUint8, MuVarint } from '@box/mudb/schema';

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
