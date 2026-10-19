import { MuStruct } from '@box/mudb/schema/struct';
import { MuVarint, MuFloat64 } from '@box/mudb/schema';

export const MS_PER_TICK = 64;
export const FRAMESKIP = Infinity;
export const TICK_RATE = 1 / MS_PER_TICK;

export const ClockProtocol = {
  name: 'game-clock',
  client: {
    pong: new MuStruct({
      clientClock: new MuFloat64(),
      serverClock: new MuFloat64(),
      frameSkip: new MuVarint(),
    }),
    frameSkip: new MuVarint(),
  },
  server: {
    ping: new MuFloat64(),
  },
};
