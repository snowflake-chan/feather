import {
  PermissionAction,
  PermissionRDA,
} from '@box/schema/permissions/permission-rda';
import { ClientStateType } from '../../edit-schema';
import {
  ClientEditAction,
  ClientEditActionSchema,
  ClientPermissionActionSchema,
  EditActionLabel,
} from '../replica-client-schema';

export class ClientPermissionTransaction {
  private forward: PermissionAction[] = [];
  private inverse: PermissionAction[] = [];

  constructor(
    private state: ClientStateType,
    private dispatch: (action: ClientEditAction, allowUndo: boolean) => void,
    private rollback: (action: ClientEditAction) => void,
  ) {}

  public push(
    cb: (action: ReturnType<typeof PermissionRDA.action>) => PermissionAction,
  ) {
    const { state, forward, inverse } = this;
    const replicaState = state.replica;
    const store = replicaState.permissionStore;

    for (let i = 0; i < forward.length; ++i) {
      store.apply(PermissionRDA, forward[i]);
    }
    const action = cb(PermissionRDA.action(store));
    const invAction = store.inverse(PermissionRDA, action);
    for (let i = inverse.length - 1; i >= 0; --i) {
      store.apply(PermissionRDA, inverse[i]);
    }

    forward.push(action);
    inverse.push(invAction);

    return this;
  }

  private _event() {
    const clientAction = ClientEditActionSchema.alloc();
    clientAction.type = 'permission';
    const action = (clientAction.data = ClientPermissionActionSchema.alloc());

    const tmpF = action.forward;
    action.forward = this.forward;
    this.forward = tmpF;

    const tmpR = action.inverse;
    action.inverse = this.inverse.reverse();
    this.inverse = tmpR;

    return clientAction;
  }

  public commit(
    label: EditActionLabel = EditActionLabel.PERMISSION,
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
