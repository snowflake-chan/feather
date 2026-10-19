import {
  MuArray,
  MuBoolean,
  MuStruct,
  MuASCII,
  MuSchema,
  MuDictionary,
  MuUTF8,
} from '@box/mudb/schema';
import { ScriptPostTickSchema, ScriptTickSchema } from './script-protocol';
import { MuRefSchema } from '@box/schema/utils/ref-schema';
import { Semaphore } from '@box/utils/semaphore';

export enum GameScriptRunState {
  STOPPED,
  RUNNING,
  TRANSITION,
}

export const GameServerScriptStateSchema = new MuStruct({
  // run state semaphores
  runSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),
  stopSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),
  isolateStopSemaphore: <MuSchema<Semaphore>>new MuRefSchema<Semaphore>(),

  // number of active scripts
  activeScriptId: new MuASCII(), // session id for active script

  // isolates which are marked for death explictly
  markedForDeath: new MuDictionary(new MuBoolean(), Infinity),

  // last sync packet from script
  scriptBlocked: new MuBoolean(false),
  scriptSync: new MuArray(ScriptPostTickSchema, Infinity),

  // tick events
  prevTickEvent: ScriptTickSchema,
  curTickEvent: ScriptTickSchema,
});

export type GameServerScriptState = typeof GameServerScriptStateSchema.identity;

export function scriptRunState(state: GameServerScriptState) {
  if (state.runSemaphore.counter > state.stopSemaphore.counter) {
    return GameScriptRunState.RUNNING;
  } else if (state.stopSemaphore.counter > state.runSemaphore.counter) {
    return GameScriptRunState.STOPPED;
  }
  return GameScriptRunState.TRANSITION;
}

export const ScriptSrcSchema = new MuStruct({
  serverSrc: new MuDictionary(new MuUTF8(), Infinity),
  clientSrc: new MuDictionary(new MuUTF8(), Infinity),
});

export type ScriptSrc = typeof ScriptSrcSchema.identity;
