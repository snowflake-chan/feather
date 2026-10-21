import { MuStruct, MuFloat64, MuVarint, MuUint32, MuDictionary, MuUTF8, MuSortedArray } from '@box/mudb/schema';

export const MessagePerfSchema = new MuStruct({
    name: new MuUTF8(''),
    bandwidth: new MuVarint(0),
    count: new MuVarint(0),
    totalBandwidth: new MuFloat64(0),
    totalCount: new MuFloat64(0),
});

export type MessagePerf = typeof MessagePerfSchema.identity;

export function compareMessage (a:MessagePerf, b:MessagePerf) {
    return b.bandwidth - a.bandwidth || (
        a.name < b.name ? 1 : (a.name === b.name ? 0 : -1)
    );
}

export const ProtocolPerfSchema = new MuStruct({
    upBandwidth: new MuVarint(0),
    downBandwidth: new MuVarint(0),
    upCount: new MuVarint(0),
    downCount: new MuVarint(0),

    totalUpBandwidth: new MuFloat64(0),
    totalDownBandwidth: new MuFloat64(0),
    totalUpCount: new MuFloat64(0),
    totalDownCount: new MuFloat64(0),

    sent: new MuDictionary(MessagePerfSchema, Infinity),
    recv: new MuDictionary(MessagePerfSchema, Infinity),
});

// technically this is gonna cause a double free....
export const MessageRankSchema = new MuSortedArray(MessagePerfSchema, Infinity, compareMessage);

export const PerfSchema = new MuStruct({
    // network performance stats
    upBandwidth: new MuVarint(0),
    downBandwidth: new MuVarint(0),
    upCount: new MuVarint(0),
    downCount: new MuVarint(0),

    totalUpBandwidth: new MuFloat64(0),
    totalDownBandwidth: new MuFloat64(0),
    totalUpCount: new MuFloat64(0),
    totalDownCount: new MuFloat64(0),

    protocolBandwidth: new MuDictionary(ProtocolPerfSchema, Infinity),

    // sorted messages by bandwidth use
    sentMessages: MessageRankSchema,
    recvMessages: MessageRankSchema,

    frametime: new MuVarint(0),
    numObjects: new MuUint32(0),
});
