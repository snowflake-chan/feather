import { ScriptWorldUpdate } from './world-synchronizer';
import { GameServerState } from '../../game-server-schema';
import {
  WorldPhysicsBinding,
  WorldSkyBinding,
  WorldSnowBinding,
  WorldRainBinding,
  WorldSoundBinding,
  WorldFogBinding,
} from './world-bindings';

export function applyScriptWorldUpdates(
  updates: ScriptWorldUpdate,
  state: GameServerState,
) {
  if (updates.physics.ids.length > 0) {
    WorldPhysicsBinding.synchronize(state.physics, updates.physics);
  }
  if (updates.sky.ids.length > 0) {
    WorldSkyBinding.synchronize(state.replica.environment.sky, updates.sky);
  }
  if (updates.fog.ids.length > 0) {
    WorldFogBinding.synchronize(state.replica.environment.fog, updates.fog);
  }
  if (updates.snow.ids.length > 0) {
    WorldSnowBinding.synchronize(state.replica.environment.snow, updates.snow);
  }
  if (updates.rain.ids.length > 0) {
    WorldRainBinding.synchronize(state.replica.environment.rain, updates.rain);
  }
  if (updates.sound.ids.length > 0) {
    WorldSoundBinding.synchronize(state.sound.ambient, updates.sound);
    state.sound.ambientDirty = true;
  }
}
