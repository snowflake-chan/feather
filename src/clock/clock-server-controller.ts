import { MuServer, MuServerProtocol } from '@box/mudb/server';
import { MuScheduler } from '@box/mudb/scheduler/scheduler';
import { ClockProtocol, TICK_RATE } from '@box/schema/clock/clock-schema';
import { GameServerState } from '../game-server-schema';
import { Logger } from '@box/utils/logger';

export class ClockServer {
  private _protocol: MuServerProtocol<typeof ClockProtocol>;
  private _scheduler: MuScheduler;
  private _state: GameServerState;
  private _logger: Logger;

  private _bufferedPing: { [id: string]: number } = {};
  private _bufferedReliable: { [id: string]: boolean } = {};

  constructor(spec: {
    server: MuServer;
    scheduler: MuScheduler;
    state: GameServerState;
  }) {
    this._scheduler = spec.scheduler;
    this._state = spec.state;
    this._logger = this._state.logger.create('clock');

    this._protocol = spec.server.protocol(ClockProtocol);
    this._protocol.configure({
      ready: () => {
        this._state.clock.systemClockStart = this._scheduler.now();
      },
      message: {
        ping: ({ sessionId }, clientClock, unreliable) => {
          this._bufferedPing[sessionId] = Math.max(
            clientClock,
            this._bufferedPing[sessionId] || 0,
          );
          this._bufferedReliable[sessionId] =
            !unreliable || !!this._bufferedReliable[sessionId];
        },
      },
    });
  }

  public poll = () => {
    this._state.clock.clock =
      this._scheduler.now() - this._state.clock.systemClockStart;
  };

  public tick = () => {
    const state = this._state.clock;
    const clock = state.clock;

    // update tick and handle any frame skipping
    const prevTick = state.tick;
    const nextTick = Math.max(2, TICK_RATE * clock - state.frameSkip);
    if (nextTick >= prevTick + 2) {
      const n = Math.floor(nextTick);
      const b = Math.floor(prevTick + 1);
      state.frameSkip += n - b;
      state.tick = Math.floor(Math.max(1, TICK_RATE * clock - state.frameSkip));

      // notify all clients of frame skip
      this._protocol.broadcast.frameSkip(state.frameSkip, true);
    } else {
      state.tick = Math.floor(nextTick);
    }

    // return true if a tick is necessary
    return Math.floor(state.tick) > Math.floor(prevTick);
  };

  public processPings() {
    const serverClock = this._state.clock.clock;
    const frameSkip = this._state.clock.frameSkip;
    const buffered = Object.keys(this._bufferedPing);
    for (let i = 0; i < buffered.length; ++i) {
      const id = buffered[i];
      if (this._bufferedPing[id]) {
        const client = this._protocol.clients[id];
        if (client && this._bufferedPing[id]) {
          client.message.pong(
            {
              serverClock,
              clientClock: this._bufferedPing[id],
              frameSkip,
            },
            !this._bufferedReliable[id],
          );
        }
        delete this._bufferedPing[id];
        delete this._bufferedReliable[id];
      }
    }
  }
}
