import {
  MuArray,
  MuBoolean,
  MuStruct,
  MuASCII,
  MuSchema,
  MuDictionary,
} from '@box/mudb/schema';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Semaphore } from '@box/utils/semaphore';
import { ScriptNetInputSetSchema } from '@box/schema/events/net-events';
import { RemoteClientEventsSchema } from '@box/schema/events/remote-channel-event-schema';

// TODO: 和server script类型一致可以抽出公共类型

export enum GameScriptRunState {
  STOPPED,
  RUNNING,
  TRANSITION,
}
export const ClientScriptEventsSchema = new MuStruct({
  input: ScriptNetInputSetSchema,
  remoteChannel: RemoteClientEventsSchema,
});

export const ClientScriptStateSchema = new MuStruct({
  // run state semaphores
  runSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),
  isolateStartSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),
  stopSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),
  isolateStopSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),

  // number of active scripts
  activeScriptId: new MuASCII(), // session id for active script

  // isolates which are marked for death explictly
  markedForDeath: new MuDictionary(new MuBoolean(), Infinity),

  // last sync packet from script
  scriptBlocked: new MuBoolean(false),

  events: ClientScriptEventsSchema,
});

export type ClientScriptState = typeof ClientScriptStateSchema.identity;

export function scriptRunState(state: ClientScriptState) {
  if (state.runSemaphore.counter > state.stopSemaphore.counter) {
    return GameScriptRunState.RUNNING;
  } else if (state.stopSemaphore.counter > state.runSemaphore.counter) {
    return GameScriptRunState.STOPPED;
  }
  return GameScriptRunState.TRANSITION;
}
