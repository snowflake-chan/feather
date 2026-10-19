import { MuArray } from '@box/mudb/schema/array';
import { MuStruct } from '@box/mudb/schema/struct';
import { MuUTF8 } from '@box/mudb/schema/utf8';
import { MuVarint } from '@box/mudb/schema/varint';
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
