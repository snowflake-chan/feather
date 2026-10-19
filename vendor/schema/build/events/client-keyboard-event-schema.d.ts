import { MuArray, MuStruct, MuUint8, MuVarint } from '@box/mudb/schema';
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
//# sourceMappingURL=client-keyboard-event-schema.d.ts.map