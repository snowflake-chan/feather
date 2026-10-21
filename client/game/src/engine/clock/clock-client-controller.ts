import { GameClientState } from '../game-client-schema';
import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { MuScheduler } from '@box/mudb/scheduler';
import {
  ClockProtocol,
  TICK_RATE,
  MS_PER_TICK,
} from '@box/schema/clock/clock-schema';
import { estimateDelay } from './ping-filter';
import {
  ClientClockStateSchema,
  ClientClockState,
} from './clock-client-schema';
import { Logger } from '@box/utils/logger';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';

// minimum number of ping samples
const MIN_PING_SAMPLES = 10;

// ping filter buffer size
const MAX_PING_SAMPLES = 64;

// warp decay rate
const TICK_WARP_DECAY = 0.8;

// clamped bounds on delta tick rate
const MIN_DELTA_TICK = 0.4;
const MAX_DELTA_TICK = 1.3;

// frameskip
const MIN_FRAMESKIP = -20;
const MAX_FRAMESKIP = 8;

export function tickClientClock(clock_: ClientClockState) {
  // construct next clock state
  const clock = ClientClockStateSchema.clone(clock_);

  if (clock.ready) {
    // compute prev tick clock and delta
    const prevClock = clock.lastTickClock;
    clock.deltaClock = clock.clock - prevClock;
    clock.lastTickClock = clock.clock;

    // compute server tick
    clock.serverTick = Math.max(
      1,
      clock.serverClock * TICK_RATE -
        clock.serverFrameskip +
        clock.serverTickWarpFactor,
    );

    // scale down warp factor
    clock.serverTickWarpFactor *= TICK_WARP_DECAY;

    // compute target time value and server time value
    const clientDelta = clock.deltaClock * TICK_RATE;
    const serverDelta = clock.serverTick - clock.tick;
    clock.deltaTick = serverDelta;

    // if clock is way off, frameskip to resynchronize
    if (clock.deltaTick < MIN_FRAMESKIP || clock.deltaTick > MAX_FRAMESKIP) {
      clock.deltaTick = 0;
      clock.tick = Math.floor(clock.serverTick);
      clock.frameskip = true;
    } else {
      // clamp delta tick
      clock.deltaTick = Math.min(
        clientDelta * MAX_DELTA_TICK,
        Math.max(clientDelta * MIN_DELTA_TICK, clock.deltaTick),
      );
      const tick = clock.tick + clock.deltaTick;
      clock.tick = tick;
      clock.frameskip = false;
    }
  }

  return clock;
}

export class ClockClient {
  private _protocol: MuClientProtocol<typeof ClockProtocol>;
  private _state: GameClientState;
  private _scheduler: MuScheduler;
  private _logger: Logger;

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    scheduler: MuScheduler;
  }) {
    this._state = spec.state;
    this._scheduler = spec.scheduler;
    this._logger = this._state.logger.create('clock');

    this._state.clock.serverDelayHi = Infinity;
    this._state.clock.serverDelayLo = -Infinity;

    this._protocol = spec.client.protocol(ClockProtocol);
    this._protocol.configure({
      ready: () => {
        this._state.loadEvents.startTask(
          'synchronizingClock',
          TaskTypeEnum.Normal,
        );
        this._state.clock.systemClockStart = this._scheduler.now();
      },
      message: {
        pong: (event) => {
          // clear flag so new ping gets launched next poll
          const clock = this._state.clock;

          // update frame skip
          if (!isNaN(event.frameSkip)) {
            clock.serverFrameskip = Math.max(
              clock.serverFrameskip,
              event.frameSkip,
            );
          }

          // record ping and delay samples
          const nowClock =
            this._scheduler.now() - this._state.clock.systemClockStart;
          const ping = nowClock - event.clientClock;

          if (!isNaN(ping)) {
            clock.pingSamples.push(ping);
          }
          while (clock.pingSamples.length > MAX_PING_SAMPLES) {
            clock.pingSamples.shift();
          }
          clock.sampleCount++;

          // update ping
          clock.ping = estimateDelay(clock.pingSamples);

          // we add +ping to the clock upper bound here
          const lo = event.serverClock - nowClock;
          const hi = event.serverClock - event.clientClock;

          // check if the clock needs to be resync'd
          const oldestTick = this._state.net.oldestTick;
          let newestTick = oldestTick;
          for (let i = 0; i < this._state.net.authoritative.length; ++i) {
            if (this._state.net.authoritative[i]) {
              newestTick = i + oldestTick;
            }
          }

          clock.serverDelayLo = Math.max(clock.serverDelayLo, lo);
          clock.serverDelayHi = Math.min(clock.serverDelayHi, hi);
          if (clock.serverDelayHi < clock.serverDelayLo) {
            clock.serverDelayHi = hi;
            clock.serverDelayLo = lo;
          }

          // update estimates
          clock.serverDelay = 0.5 * (clock.serverDelayLo + clock.serverDelayHi);

          // clear tick warp factor
          this._state.clock.serverTickWarpFactor = 0;
        },
        frameSkip: (count) => {
          if (!isNaN(count)) {
            this._state.clock.serverFrameskip = Math.max(
              this._state.clock.serverFrameskip,
              count,
            );
          }
        },
      },
    });
  }

  public poll = (timeStamp: number) => {
    const clock = this._state.clock;
    clock.lastTimeStamp = timeStamp;

    if (!this._protocol.client.running) {
      clock.ready = false;
      return;
    }

    clock.clock = Math.max(
      clock.clock,
      timeStamp - this._state.clock.systemClockStart,
    );

    // clock is not ready until some fixed number of ping samples have been processed
    const prevReady = clock.ready;
    clock.ready = clock.sampleCount > 1;
    if (prevReady !== clock.ready && !this._state.loadFinished) {
      this._state.loadEvents.endTask('synchronizedClocks', TaskTypeEnum.Normal);
      this._state.logger.trace(
        'clock ready ' +
          ((Date.now() - this._state.enginePreconnectTimeStamp) / 1000).toFixed(
            2,
          ),
      );
    }

    // poll for sending new ping events
    if (
      clock.lastPingClock + (clock.sampleCount < MIN_PING_SAMPLES ? 64 : 2000) <
      clock.clock
    ) {
      clock.lastPingClock = clock.clock;
      this._protocol.server.message.ping(clock.clock, true);
      if (!clock.ready) {
        this._protocol.server.message.ping(clock.clock);
      }
    }

    // compute server clock values
    clock.serverClock = clock.clock + clock.serverDelay;
  };

  public timeWarp(targetTick: number) {
    // warp tick
    this._state.clock.tick = targetTick;
    this._state.clock.serverTickWarpFactor =
      targetTick - this._state.clock.serverTick;

    // clear delay counter and queue up a new ping
    this._state.clock.lastPingClock = 0;
  }

  public reset() {
    const prevLo = this._state.clock.serverDelayLo;
    const prevHi = this._state.clock.serverDelayHi;
    this._state.clock.serverDelayLo = Math.max(prevHi, prevLo);
    this._state.clock.serverDelayHi = Math.min(prevHi, prevLo);
    this._state.clock.sampleCount = 0;
    this._state.clock.pingSamples.length = 0;
  }
}
