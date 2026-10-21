import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { GameClientState, CloseType } from '../game-client-schema';
import {
  NetProtocolSchema,
  NetSecretSchema,
  NetClientInput,
  TimestampedClientInputSchema,
  TimestampedClientInput,
  NetClientInputSchema,
  MAX_CLIENT_INPUT_ENTITIES,
  NetMessageType,
  NetPublicSchema,
  NetPublicSetSchema,
  NetPositionCorrectionSchema,
  NetInputEvent,
  NetInputEventSchema,
  MAX_INPUT_EVENTS,
  PUBLIC_BUFFER_DIVISOR,
  ClientScriptSrcSchema,
} from '@box/schema/net/net-schema';
import { GameReplicaSchema } from '@box/schema/replica/game-replica';
import { setAuthoritativeClientNetState } from './net-client-tick';
import { MuReadStream } from '@box/mudb/stream';
import {
  CLIENT_UNRELIABLE,
  CLIENT_DELTA_BUFFER as CLIENT_PUBLIC_BUFFER_SIZE,
} from './net-client-state';
import { Logger } from '@box/utils/logger';
import { HurtEventSchema } from '@box/schema/events/damage-event-schema';
import { MuSocket } from '@box/mudb/socket/socket';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { setClientKeyframeDirty } from '../keyframes/keyframe-client';

function compareTick(a: NetInputEvent, b: NetInputEvent) {
  return a.tick - b.tick;
}

// -----------------------------------------------------------------------
// Network IO implementation details below here
// -----------------------------------------------------------------------
export class NetClient {
  private _protocol: MuClientProtocol<typeof NetProtocolSchema>;
  private _state: GameClientState;
  private _logger: Logger;
  private _socket: MuSocket;

  constructor(spec: {
    client: MuClient;
    state: GameClientState;
    idle: () => void;
  }) {
    this._socket = (<any>spec.client)._socket;
    this._state = spec.state;
    this._state.net.zoneIndex = new PhysicsZoneIndex();
    this._logger = this._state.logger.create('net');
    this._protocol = spec.client.protocol(NetProtocolSchema);
    this._protocol.configure({
      message: {
        scriptEvents: ({ damage: { hurt, die, respawn } }) => {
          const damageEvents = this._state.events.damage;
          for (let i = 0; i < hurt.length; ++i) {
            damageEvents.hurt.push(HurtEventSchema.clone(hurt[i]));
          }
          for (let i = 0; i < die.length; ++i) {
            damageEvents.die.push(die[i]);
          }
          for (let j = 0; j < respawn.length; ++j) {
            damageEvents.respawn.push(respawn[j]);
          }
        },
        exceedUserLimit: (limit) => {
          this._state.exceedUserLimit = limit;
        },
        kickSessionReason: (reason: CloseType) => {
          this._state.serverError = reason;
        },
        syncClientScriptModules: (modules) => {
          this._state.clientModules = ClientScriptSrcSchema.clone(modules);
        },
      },
      raw: (bytes) => {
        if (typeof bytes === 'string' || bytes.length < 1) {
          return;
        }

        const stream = new MuReadStream(bytes);
        const code = stream.readVarint();

        const type = code & NetMessageType.MASK;
        const base = code >> NetMessageType.SHIFT;

        switch (type) {
          case NetMessageType.SECRET:
            this._parseSecret(stream);
            break;
          case NetMessageType.PUBLIC:
            this._parsePublic(stream, base);
            break;
        }

        // fire poll callback each time state changes
        spec.idle();
      },
    });
  }

  private _parseSecret(stream: MuReadStream) {
    try {
      const receivedSecret = this._state.net.receivedSecret;
      const nextSecret = NetSecretSchema.patch(receivedSecret, stream);

      if (nextSecret.netPaused) {
        this._state.net.netSkip = true;
      }
      NetSecretSchema.assign(receivedSecret, nextSecret);
      NetSecretSchema.assign(this._state.secret, receivedSecret);
      NetSecretSchema.free(nextSecret);
    } catch (e) {
      this._state.logger.error(`error parsing session ${e.stack}`);
    }
  }

  private _parsePublic(stream: MuReadStream, baseTick: number) {
    if (this._state.secret.netPaused || this._state.idle) {
      return;
    }

    // find base packet and clear out any packets which are older than baseTick
    let basePublic = NetPublicSchema.identity;
    const receivedPublic = this._state.net.receivedPublic;
    if (baseTick !== 0) {
      for (let i = 0; i < receivedPublic.length; ++i) {
        const recv = receivedPublic[i];
        if (recv.tick === baseTick) {
          basePublic = recv;
        }
      }
    }

    // if we missed a packet let the server know that they need to catch us up
    if (basePublic.tick !== baseTick) {
      const lastAckTick =
        receivedPublic.length > 0
          ? receivedPublic[receivedPublic.length - 1].tick
          : 0;
      this._protocol.server.message.acknowledge(lastAckTick, true);
      return;
    }

    // try parsing packetGameServerDebugger
    const nextPublic = NetPublicSchema.patch(basePublic, stream);

    // discard old packets
    if (receivedPublic.length > 0 && nextPublic.tick < receivedPublic[0].tick) {
      NetPublicSchema.free(nextPublic);
      return;
    }

    // discard duplicate packets
    for (let i = 0; i < receivedPublic.length; ++i) {
      if (receivedPublic[i].tick === nextPublic.tick) {
        this._logger.error(
          `received duplicated state packet from server @ tick ${nextPublic.tick}`,
        );
        NetPublicSchema.free(nextPublic);
        return;
      }
    }

    // update pause counter
    const nextInputPauseCounter = stream.readVarint();

    if (stream.offset !== stream.length) {
      this._logger.warn('bytes left in output stream, major problem');
    }

    // update clock state
    this._state.clock.serverFrameskip = Math.max(
      this._state.clock.serverFrameskip,
      nextPublic.frameSkip,
    );

    // update common replica data
    const mostRecentTick = this._state.net.mostRecentTick;
    if (nextPublic.tick >= mostRecentTick) {
      this._state.net.mostRecentTick = nextPublic.tick;

      GameReplicaSchema.assign(this._state.replica, nextPublic.replica);

      setClientKeyframeDirty(this._state);
    }

    // update net state
    if (nextInputPauseCounter > this._state.net.netPauseCounter) {
      this._state.net.netPauseCounter = nextInputPauseCounter;
      this._state.net.netSkip = true;
      setAuthoritativeClientNetState(
        this._state.net,
        nextPublic.tick,
        nextPublic.state,
        true,
      );
    } else {
      setAuthoritativeClientNetState(
        this._state.net,
        nextPublic.tick,
        nextPublic.state,
        false,
      );
    }

    if (nextPublic.tick % PUBLIC_BUFFER_DIVISOR === 0) {
      // acknowledge state update
      this._protocol.server.message.acknowledge(nextPublic.tick, true);

      // update stream state
      receivedPublic.push(nextPublic);
      receivedPublic.sort(NetPublicSetSchema.compare);

      // clear out old states
      let ptr = 0;
      for (let i = 0; i < receivedPublic.length; ++i) {
        const pub = receivedPublic[i];
        if (receivedPublic.length - i >= CLIENT_PUBLIC_BUFFER_SIZE) {
          NetPublicSchema.free(pub);
        } else {
          receivedPublic[ptr++] = pub;
        }
      }
      receivedPublic.length = ptr;
    } else {
      NetPublicSchema.free(nextPublic);
    }
  }

  private _unreliableBufferedAmount() {
    return this._socket.unreliableBufferedAmount();
  }

  public input(
    input: NetClientInput,
    tick: number,
    cb?: (input: TimestampedClientInput) => void,
  ) {
    if (
      this._state.secret.netPaused ||
      this._state.idle ||
      tick <= 0 ||
      (this._unreliableBufferedAmount() > 0 &&
        this._state.net.inputEventBuffer.length < MAX_INPUT_EVENTS / 2)
    ) {
      return;
    }

    // compute input packet
    const nextInput = TimestampedClientInputSchema.alloc();
    nextInput.events.length = 0;
    nextInput.tick = tick;
    nextInput.pauseCounter = this._state.net.netPauseCounter;
    NetClientInputSchema.assign(nextInput.input, input);

    // truncate input vector
    const inputBodies = nextInput.input.bodies;
    while (inputBodies.length > MAX_CLIENT_INPUT_ENTITIES) {
      const b = inputBodies.pop();
      if (b) {
        NetPositionCorrectionSchema.free(b);
      }
    }

    // append input events
    const events = this._state.net.inputEventBuffer;
    events.sort(compareTick);

    while (events.length > MAX_INPUT_EVENTS) {
      const e = events.shift();
      if (e) {
        NetInputEventSchema.free(e);
      }
    }

    // swap buffers
    const prev = nextInput.events;
    nextInput.events = events;
    this._state.net.inputEventBuffer = prev;
    prev.length = 0;

    // send packet to server
    this._protocol.server.message.input(nextInput, CLIENT_UNRELIABLE);
    // send packet to client script
    cb && cb(nextInput);
    TimestampedClientInputSchema.free(nextInput);
  }

  public setPause(pause: boolean) {
    if (pause) {
      this._protocol.server.message.pause();
    } else {
      const recv = this._state.net.receivedPublic;
      this._protocol.server.message.unpause(
        recv.length > 0 ? recv[recv.length - 1].tick : 0,
      );
    }

    // set net skip flag
    this._state.net.netSkip = true;
  }

  public join() {
    this._protocol.server.message.join();
  }

  public sendKeyBoardEvent() {
    this._state.net.keyboardEvents.forEach((event) => {
      this._protocol.server.message.sendKeyBoardEvent(event);
    });
    this._state.net.keyboardEvents.length = 0;
  }
}
