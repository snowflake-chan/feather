import { MuStruct, MuArray, MuUTF8, MuVarint } from '@box/mudb/schema';
export declare const RemoteChannelEventSchema: MuStruct<{
    tick: MuVarint;
    args: MuUTF8;
    id: MuVarint;
}>;
export declare const RemoteChannelEventsSchema: MuArray<MuStruct<{
    tick: MuVarint;
    args: MuUTF8;
    id: MuVarint;
}>>;
export declare const RemoteClientEventSchema: MuStruct<{
    tick: MuVarint;
    args: MuUTF8;
}>;
export declare const RemoteClientEventsSchema: MuArray<MuStruct<{
    tick: MuVarint;
    args: MuUTF8;
}>>;
//# sourceMappingURL=remote-channel-event-schema.d.ts.map