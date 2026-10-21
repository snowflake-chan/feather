import { VoxelWrite, VoxelWriteSchema } from '@box/schema/voxel/voxel-protocol';
import { GameClient } from 'src/engine/game-client';
import {
  ClientEditAction,
  EditActionLabel,
  ClientEditActionSchema,
  ClientVoxelActionSchema,
} from '../replica-client-schema';

export class ClientVoxelTransaction {
  private forward: VoxelWrite[] = [];
  private inverse: VoxelWrite[] = [];

  constructor(
    private game: GameClient,
    private dispatch: (a: ClientEditAction, allowUndo: boolean) => void,
    private rollback: (a: ClientEditAction) => void,
  ) {}

  public push(x_: number, y_: number, z_: number, b: number) {
    const voxels = this.game.state.voxel;
    const shape = voxels.shape;
    const x = Math.floor(x_);
    const y = Math.floor(y_);
    const z = Math.floor(z_);
    if (
      x < 0 ||
      y < 0 ||
      z < 0 ||
      shape[0] <= x ||
      shape[1] <= y ||
      shape[2] <= z
    ) {
      return this;
    }

    // store writes
    const w = VoxelWriteSchema.alloc();
    const m = VoxelWriteSchema.alloc();
    m.x = w.x = x;
    m.y = w.y = y;
    m.z = w.z = z;
    w.b = b;
    m.b = voxels.getVoxel(x, y, z);
    this.forward.push(w);
    this.inverse.push(m);

    // make an optimistic local update to voxel set
    this.game.voxel.setVoxelOptimistic(x, y, z, b);
    return this;
  }

  private _event() {
    const editAction = ClientEditActionSchema.alloc();
    editAction.type = 'voxel';
    const voxelAction = (editAction.data = ClientVoxelActionSchema.alloc());

    const tmpF = voxelAction.forward;
    voxelAction.forward = this.forward;
    this.forward = tmpF;

    const tmpR = voxelAction.inverse;
    voxelAction.inverse = this.inverse.reverse();
    this.inverse = tmpR;

    return editAction;
  }

  public commit(
    label: EditActionLabel = EditActionLabel.VOXEL,
    allowUndo: boolean = true,
  ) {
    const event = this._event();
    event.data.label = label;
    this.dispatch(event, allowUndo);
  }

  public abort() {
    this.rollback(this._event());
  }
}
