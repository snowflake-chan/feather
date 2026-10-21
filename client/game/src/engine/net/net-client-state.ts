import {
  MuStruct,
  MuUint32,
  MuArray,
  MuBoolean,
  MuSortedArray,
  MuFloat64,
  MuVarint,
  MuSchema,
} from '@box/mudb/schema';
import {
  NetStateSchema,
  NetInputSchema,
  NetPublicSetSchema,
  NetInputEventSchema,
  NetSecretSchema,
} from '@box/schema/net/net-schema';
import { compareId } from '@box/utils/id';
import { ContactIndexSchema } from '@box/schema/physics/physics-schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { PhysicsZoneIndex } from '@box/schema/physics/zone-index';
import { ClientKeyboardEventsSchema } from '@box/schema/events/client-keyboard-event-schema';

export const INPUT_PACKET_SIZE = 1024;
export const CLIENT_MAX_NET_BUFFER = 16;
export const CLIENT_DELTA_BUFFER = 16;
export const CLIENT_TICK_THRESHOLD = 4;
export const CLIENT_UNRELIABLE = true;

// client position error accumulator info
export const NetErrorAccumulatorSchema = new MuStruct({
  id: new MuUint32(),
  error: new MuFloat64(0),
});
export type NetErrorAccumulator = typeof NetErrorAccumulatorSchema.identity;
export const NetErrorListSchema = new MuSortedArray(
  NetErrorAccumulatorSchema,
  Infinity,
  compareId,
);
export type NetErrorList = typeof NetErrorListSchema.identity;

export const NetClientStateSchema = new MuStruct({
  // if flag is true, state in index i is authoritative from server
  oldestTick: new MuUint32(0),
  mostRecentTick: new MuVarint(0),
  authoritative: new MuArray(new MuBoolean(false), Infinity),
  dirty: new MuArray(new MuBoolean(true), Infinity),
  states: new MuArray(NetStateSchema, Infinity),
  inputs: new MuArray(NetInputSchema, Infinity),

  // Buffered events
  inputEventBuffer: new MuArray(NetInputEventSchema, Infinity),

  keyboardEvents: ClientKeyboardEventsSchema,

  // received state
  receivedPublic: NetPublicSetSchema,
  maxPublicAck: new MuUint32(),

  // received secret state
  receivedSecret: NetSecretSchema,

  // network skip state
  netSkip: new MuBoolean(true),
  prevNetPause: new MuBoolean(false),

  // pause counter
  netPauseCounter: new MuVarint(0),

  // error state
  errors: NetErrorListSchema,

  // net contact stuff
  lastContactIndex: ContactIndexSchema,

  // maximum number net ticks per frame
  frameNetTicks: new MuFloat64(2),

  // zone index
  zoneIndex: <MuSchema<PhysicsZoneIndex>>new MuRefSchema<PhysicsZoneIndex>(),
});

export type NetClientState = typeof NetClientStateSchema.identity;
