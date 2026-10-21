import {
  ProjectAction,
  ProjectActionSchema,
} from '@box/schema/replica/replica-schema';
import { ClientStateType } from '../../edit-schema';
import {
  ClientEditAction,
  EditActionLabel,
  ClientEditActionSchema,
  ClientProjectActionSchema,
} from '../replica-client-schema';
import { ProjectRDA } from '@box/schema/project/project-rda';

export class ClientProjectTransaction {
  private forward: ProjectAction[] = [];
  private inverse: ProjectAction[] = [];

  constructor(
    private state: ClientStateType,
    private dispatch: (action: ClientEditAction, allowUndo: boolean) => void,
    private rollback: (action: ClientEditAction) => void,
    private optimisticDispatch: (action: ProjectAction[]) => void,
  ) {}

  public push(
    cb: (action: ReturnType<typeof ProjectRDA.action>) => ProjectAction,
  ) {
    const replicaState = this.state.replica;
    const store = replicaState.projectStore;

    // get user action
    const action = cb(ProjectRDA.action(store));

    // push action and inverse pair onto queue
    this.forward.push(action);
    this.inverse.push(store.inverse(ProjectRDA, action));

    // dispatch optimistically
    this.optimisticDispatch([action]);

    // special case for project actions:  apply them instantly
    store.apply(ProjectRDA, action);
    replicaState.projectDirty = true;

    return this;
  }

  // useful for sliders, updates the last action in the transaction optimistically
  public head(
    cb: (action: ReturnType<typeof ProjectRDA.action>) => ProjectAction,
  ) {
    const x = this.forward.pop();
    if (!x) {
      // queue is empty, push action directly
      return this.push(cb);
    }

    // delete previous action
    ProjectActionSchema.free(x);

    // get store references
    const replicaState = this.state.replica;
    const store = replicaState.projectStore;

    // invert previous action
    const invX = this.inverse.pop();
    if (invX) {
      store.apply(ProjectRDA, invX);
    }

    // get user action
    const action = cb(ProjectRDA.action(store));

    // perform optimistic dispatch
    if (invX) {
      this.optimisticDispatch([invX, action]);
      ProjectActionSchema.free(invX);
    } else {
      this.optimisticDispatch([action]);
    }

    // update queues
    this.forward.push(action);
    this.inverse.push(store.inverse(ProjectRDA, action));

    // apply forward action and set dirty flag = true
    store.apply(ProjectRDA, action);
    replicaState.projectDirty = true;

    return this;
  }

  private _event() {
    const clientAction = ClientEditActionSchema.alloc();
    clientAction.type = 'project';
    const projectAction = (clientAction.data = ClientProjectActionSchema.clone(
      ClientProjectActionSchema.identity,
    ));

    const tmpF = projectAction.forward;
    projectAction.forward = this.forward;
    this.forward = tmpF;

    const tmpR = projectAction.inverse;
    projectAction.inverse = this.inverse.reverse();
    this.inverse = tmpR;

    return clientAction;
  }

  public commit(
    label: EditActionLabel = EditActionLabel.PROJECT,
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
