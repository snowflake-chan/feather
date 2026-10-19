import {
  MuStruct,
  MuUint32,
  MuArray,
  MuBoolean,
  MuSortedArray,
  MuVarint,
  MuFloat64,
  MuSchema,
} from '@box/mudb/schema';
import {
  NetStateSchema,
  NetInputSchema,
  TimestampedClientInputSchema,
} from '@box/schema/net/net-schema';
import {
  NetSecretSchema,
  NetPublicSetSchema,
} from '@box/schema/net/net-schema';
import { ContactIndexSchema } from '@box/schema/physics/physics-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';

import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';

export const SERVER_MAX_CLIENT_INPUTS = 100;
export const SERVER_SECRET_PACKET_SIZE = 1 << 18;
export const SERVER_REPLICA_PACKET_SIZE = 1 << 18;

export const MAX_BUFFERED_BYTES = 64;

export const MAX_PUBLIC_BUFFER_SIZE = 16 * 2; // 2 seconds replay buffer

export const SERVER_REWIND_TICKS = 4;
export const SERVER_BUFFER_TICKS = 16;
export const SERVER_MAX_NET_BUFFER = SERVER_BUFFER_TICKS + SERVER_REWIND_TICKS;

export const SERVER_UNRELIABLE = true;

export const NetServerStateSchema = new MuStruct({
  oldestTick: new MuUint32(0),
  lastInputTick: new MuUint32(0),

  // input[i] encodes transition from state[i] to state[i + 1]
  states: new MuArray(NetStateSchema, Infinity),
  inputs: new MuArray(NetInputSchema, Infinity),

  // last computed contact record
  lastContact: ContactIndexSchema,

  // buffered public data
  sentNetPublic: NetPublicSetSchema,

  // contact index
  zoneIndex: <MuSchema<PhysicsZoneIndex>>new MuRefSchema<PhysicsZoneIndex>(),
});

export type NetServerState = typeof NetServerStateSchema.identity;

export const NetReceivedInputSetSchema = new MuSortedArray(
  TimestampedClientInputSchema,
  Infinity,
  function (a, b) {
    return a.tick - b.tick;
  },
);

export const NetServerConnectionSchema = new MuStruct({
  // pause state updates for this client
  statePaused: new MuBoolean(true),

  // buffered amount
  bufferedAmount: new MuFloat64(0),
  unreliableBufferedAmount: new MuFloat64(0),

  // pause input state updates for this client,
  inputPauseCounter: new MuUint32(0),

  // state of last sent secret
  lastSentSecret: NetSecretSchema,

  // last acknowledge tick
  lastPublicAck: new MuUint32(),
  maxAck: new MuUint32(),

  // most recent input
  lastInput: new MuVarint(),
});

export type NetServerConnection = typeof NetServerConnectionSchema.identity;
