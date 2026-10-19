import { MuStruct, MuFloat64, MuUint32, MuBoolean } from '@box/mudb/schema';

export const ServerClockStateSchema = new MuStruct({
  // checks if server clock is ready
  ready: new MuBoolean(false),

  // System clock value
  systemClockStart: new MuFloat64(0),
  clock: new MuFloat64(0),

  // Current tick
  tick: new MuFloat64(2),

  // tick = clock * tickRate - frameSkip
  frameSkip: new MuUint32(0),
});

export type ServerClockState = typeof ServerClockStateSchema.identity;
