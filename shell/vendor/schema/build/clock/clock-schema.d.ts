import { MuStruct } from '@box/mudb/schema/struct';
import { MuFloat64 } from '@box/mudb/schema/float64';
import { MuVarint } from '@box/mudb/schema/varint';
export declare const MS_PER_TICK = 64;
export declare const FRAMESKIP: number;
export declare const TICK_RATE: number;
export declare const ClockProtocol: {
    name: string;
    client: {
        pong: MuStruct<{
            clientClock: MuFloat64;
            serverClock: MuFloat64;
            frameSkip: MuVarint;
        }>;
        frameSkip: MuVarint;
    };
    server: {
        ping: MuFloat64;
    };
};
