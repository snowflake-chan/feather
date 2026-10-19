import { MuArray } from '@box/mudb/schema/array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUint8 } from '@box/mudb/schema/uint8';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const ClientKeyboardEventSchema: MuStruct<{
    id: MuVarint;
    tick: MuVarint;
    keyDownState: MuArray<MuUint8>;
    prevKeyDownState: MuArray<MuUint8>;
}>;
export declare const ClientKeyboardEventsSchema: MuArray<MuStruct<{
    id: MuVarint;
    tick: MuVarint;
    keyDownState: MuArray<MuUint8>;
    prevKeyDownState: MuArray<MuUint8>;
}>>;
export declare enum KeyBoardEventType {
    KeyDown = 0,
    keyUp = 1
}
