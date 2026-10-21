import { MuStruct, MuFloat64, MuArray, MuInt32, MuBoolean } from '@box/mudb/schema';

export const ClientClockStateSchema = new MuStruct({
    // Flag, checks if system is ready
    ready: new MuBoolean(false),

    // clock counters
    lastTimeStamp: new MuFloat64(0),
    systemClockStart: new MuFloat64(0),
    clock: new MuFloat64(0),        // system clock time for client
    serverClock: new MuFloat64(0),  // system clock time estimate for server

    // tick counters
    tick: new MuFloat64(0),         // client tick
    deltaTick: new MuFloat64(0),    // elapsed time since last tick

    // internal tick stuff
    serverTick: new MuFloat64(0),   // server tick estimate
    lastTickClock: new MuFloat64(0),
    deltaClock: new MuFloat64(0),   // delta clock time

    // server tick warp factor
    serverTickWarpFactor: new MuFloat64(0),

    // if set, then last tick had to skip some frames
    frameskip: new MuBoolean(false),

    // ping = round trip time to server
    ping: new MuFloat64(0),

    // delay = clock shift from client -> server
    serverDelay: new MuFloat64(0),

    // ping and delay sample observations
    pingSamples: new MuArray(new MuFloat64(0), Infinity, []),
    sampleCount: new MuInt32(0),

    // delay estimates
    serverDelayLo: new MuFloat64(0),
    serverDelayHi: new MuFloat64(),

    // ping timer flags
    lastPingClock: new MuFloat64(-1000000),

    // server tick rate
    serverFrameskip: new MuFloat64(0),
});

export type ClientClockState = typeof ClientClockStateSchema.identity;