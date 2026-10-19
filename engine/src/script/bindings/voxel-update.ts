import {
  ScriptVoxelResetSchema,
  ScriptVoxelPreTickSchema,
  ScriptVoxelReset,
} from '../script-protocol';
import { GameServerState } from '../../game-server-schema';
import { getServerChunkBoxes, VoxelServer } from '../../voxel/voxel-server';
import { VoxelCollisionBoxListSchema } from '@box/schema/utils/rbush-schema';
import { ScriptVoxelUpdateSchema } from './voxel-synchronizer';
import { VoxelWriteSchema, VoxelWrite } from '@box/schema/voxel/voxel-protocol';
import { VoxelWriteSequenceSchema } from '@box/schema/replica/replica-schema';

export class EngineVoxelSync {
  constructor(private _state: GameServerState, private _voxels: VoxelServer) {}

  public getVoxelConfig(config: typeof ScriptVoxelResetSchema.identity) {
    config.x = this._state.voxels.shape[0];
    config.y = this._state.voxels.shape[1];
    config.z = this._state.voxels.shape[2];

    const chunks = this._state.voxelState.chunks;
    config.chunks.length = chunks.length;
    for (let i = 0; i < chunks.length; ++i) {
      config.chunks[i] = VoxelCollisionBoxListSchema.clone(
        getServerChunkBoxes(chunks[i]),
      );
    }
  }

  public applyVoxelUpdates(writes: typeof ScriptVoxelUpdateSchema.identity) {
    for (let j = 0; j < writes.length; ++j) {
      const w = writes[j];
      this._voxels.setVoxel(w.x, w.y, w.z, w.b);
    }
  }

  public bufferVoxelWrites() {
    const state = this._state;
    const voxel = state.script.curTickEvent.voxelUpdate;
    if (state.events.voxel.voxelReset) {
      if (voxel.type !== 'reset') {
        state.script.curTickEvent.voxelUpdate = ScriptVoxelPreTickSchema.assign(
          state.script.curTickEvent.voxelUpdate,
          {
            type: 'reset',
            data: ScriptVoxelResetSchema.alloc(),
          },
        );
      }
      return;
    }

    const changes = state.events.voxel.voxelChange;
    if (voxel.type === 'reset' || changes.length <= 0) {
      return;
    }

    if (voxel.type === 'none') {
      voxel.type = 'writes';
      voxel.data = VoxelWriteSequenceSchema.clone(
        VoxelWriteSequenceSchema.identity,
      );
    }

    const buf = <VoxelWrite[]>voxel.data;
    for (let i = 0; i < changes.length; ++i) {
      const c = changes[i];
      buf.push(VoxelWriteSchema.clone(c));
    }
  }

  public preTick(voxelUpdate: typeof ScriptVoxelPreTickSchema.identity) {
    const state = this._state;
    if (voxelUpdate.type === 'reset') {
      this.getVoxelConfig(<ScriptVoxelReset>voxelUpdate.data);
    }
  }
}
