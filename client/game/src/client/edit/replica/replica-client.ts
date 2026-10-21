import querystring from 'querystring';
import { MuClient, MuClientProtocol } from '@box/mudb/client';
import { MuReadStream } from '@box/mudb/stream';
import { VoxelWriteSchema, VoxelWrite } from '@box/schema/voxel/voxel-protocol';
import { GameClient } from 'src/engine/game-client';
import { ProjectRDA } from '@box/schema/project/project-rda';
import {
  PermissionRDA,
  PermissionSetSchema,
  combinePermissionSet,
  PermissionAction,
  PermissionActionSchema,
  PermissionSet,
  OWNER_PERMISSIONS,
  PermissionGroupRDA,
  PermissionUserRDA,
  PermissionsSchema,
} from '@box/schema/permissions/permission-rda';
import { clientConfig } from 'src/config/client';

import {
  EditReplicaProtocol,
  ProjectActionSchema,
  ProjectAction,
  RPCResult,
} from '@box/schema/replica/replica-schema';
import { ClientStateType } from '../edit-schema';
import {
  ClientEditActionSchema,
  ClientEditAction,
  ClientProjectAction,
  ClientVoxelAction,
  ClientPermissionAction,
  ClientEditSequenceSchema,
} from './replica-client-schema';
import { ClientProjectTransaction } from './transaction/client-project-transaction';
import { ClientVoxelTransaction } from './transaction/client-voxel-transaction';
import { ClientPermissionTransaction } from './transaction/client-permission-transaction';
import { Logger } from '@box/utils/logger';
import { EventBus } from '@box/utils/event';
import { VoxelMessageType } from 'src/engine/voxel/voxel-worker-schema';
import { reduxDispatch } from 'src/redux/edit';
import { setPermission } from 'src/redux/edit/permission';
import { ExtraProjectInfoSchema } from '@box/schema/project/hot-schema';
import {
  ExtraProjectChange,
  summarizeExtraProjectChange,
} from './extra-project-change';
import { setSelectedScreenId } from 'src/redux/edit/game-ui';

function actionPermitted(
  type: typeof ClientEditActionSchema.identity.type,
  permissions: PermissionSet,
) {
  if (type === 'voxel') {
    return permissions.editVoxels;
  } else if (type === 'project') {
    return permissions.editProject;
  } else if (type === 'permission') {
    return permissions.editPermissions;
  }
  return false;
}

function removeUnpermittedActions(
  actions: ClientEditAction[],
  permissions: PermissionSet,
) {
  let ptr = 0;
  for (let i = 0; i < actions.length; ++i) {
    const action = actions[i];
    if (actionPermitted(action.type, permissions)) {
      actions[ptr++] = action;
    } else {
      ClientEditActionSchema.free(action);
    }
  }
  actions.length = ptr;
}

export class EditReplicaClient {
  private _protocol: MuClientProtocol<typeof EditReplicaProtocol>;
  private _state: ClientStateType;
  private _logger: Logger;
  private _game: GameClient;

  public onProjectChange = new EventBus<void>();
  public onExtraProjectChange = new EventBus<ExtraProjectChange>();

  public onInviteGroupChange = new EventBus<string>();

  private _clearHistory() {
    const replicaState = this._state.replica;
    ClientEditSequenceSchema.assign(
      replicaState.undoHistory,
      ClientEditSequenceSchema.identity,
    );
    ClientEditSequenceSchema.assign(
      replicaState.redoHistory,
      ClientEditSequenceSchema.identity,
    );
  }

  constructor(spec: {
    client: MuClient;
    state: ClientStateType;
    game: GameClient;
    logger: Logger;
  }) {
    const protocol = (this._protocol =
      spec.client.protocol(EditReplicaProtocol));
    const state = (this._state = spec.state);
    this._game = spec.game;
    this._logger = spec.logger.create('replica');

    const replicaState = state.replica;

    // initialize stores
    replicaState.projectStore = ProjectRDA.createStore(
      ProjectRDA.stateSchema.identity,
    );
    replicaState.permissionStore = PermissionRDA.createStore(
      PermissionRDA.stateSchema.identity,
    );
    this._updatePermissions();

    const { name, description, image } = clientConfig.mapInfo;
    // HACK: copy in client config to initialize project
    replicaState.project.info.displayName = name;
    replicaState.project.info.description = description;
    replicaState.project.info.previewImage = image;

    protocol.configure({
      message: {
        init: (info) => {
          // reset project store
          replicaState.projectStore.free(ProjectRDA);
          replicaState.projectStore = ProjectRDA.parse(info.project);
          replicaState.projectDirty = true;

          // reset permission stoare
          replicaState.permissionStore.free(PermissionRDA);
          replicaState.permissionStore = PermissionRDA.parse(info.permissions);
          this._updatePermissions();
          // 选中默认屏幕
          this._updateSelectedScreenId(info.project.defaultScreenId);

          // reset extra project info
          ExtraProjectInfoSchema.assign(
            replicaState.extraProjectInfo,
            info.extraProjectInfo,
          );

          this._clearHistory();
        },

        reset: (project) => {
          replicaState.projectStore.free(ProjectRDA);
          replicaState.projectStore = ProjectRDA.parse(project);
          replicaState.projectDirty = true;

          this._clearHistory();
        },

        project: (actions) => {
          this._applyProjectSequence(actions);
        },
        voxel: (actions) => {
          this._applyVoxelSequence(actions);
        },
        permissions: (actions) => {
          this._applyPermissionSequence(actions);
        },

        updateBusyState: (busyState) => {
          replicaState.playButtonBusy = busyState;
        },

        rpcResponse: (rpcResult: RPCResult) => {
          const handler = replicaState.pendingRPC[rpcResult.token];
          if (handler) {
            delete replicaState.pendingRPC[rpcResult.token];
            if (rpcResult.error) {
              handler.reject && handler.reject(rpcResult.error);
            } else {
              handler.resolve && handler.resolve(rpcResult.result);
            }
          }
        },
        updateApplications: (applications) => {
          this._state.replica.applications = [...applications];
        },
        updateNewApplicants: (newApplicants) => {
          this._state.replica.newApplicants = { ...newApplicants };
        },
        applicationAccepted: () => {
          // reloadFlag没有用到此属性的地方
          // this._state.UIState.reloadFlag = true;
        },
        inviteLinkExpired: (expired) => {
          this._state.replica.isInviteLinkExpired = expired;
        },
        inviteLinkGroup: (group) => {
          this._game.state.inviteLinkGroup = group || '';
        },
      },
      ready: () => {
        this.onInviteGroupChange.notify('ready');
        this.inviteLinkGroup().catch((err) => {
          this._logger.error(`inviteLinkGroup err: ${err}`);
        });
        this.isInviteLinkExpired();
      },
      raw: (bytes) => {
        if (typeof bytes === 'string' || bytes.length < 1) {
          return;
        }

        const previous = ExtraProjectInfoSchema.clone(
          this._state.replica.extraProjectInfo,
        );
        this._state.replica.extraProjectInfo = ExtraProjectInfoSchema.patch(
          this._state.replica.extraProjectInfo,
          new MuReadStream(bytes),
        );
        this.onExtraProjectChange.notify(
          summarizeExtraProjectChange(
            previous,
            this._state.replica.extraProjectInfo,
          ),
        );
        ExtraProjectInfoSchema.free(previous);
      },
    });
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
  }

  private _updateSelectedScreenId(screenId: string) {
    reduxDispatch(setSelectedScreenId(screenId));
  }

  public _updatePermissions() {
    const state = this._state;
    const userId = this._game.state.secret.userId;
    const replicaState = state.replica;
    // update user id
    replicaState.userId = parseInt(userId);

    // recompute state
    const permissions = replicaState.permissionStore.state(
      PermissionRDA,
      replicaState.permissions,
    );
    const localGroups = replicaState.localGroups;
    localGroups.length = 0;
    // update local user permission set for fast access
    if (!userId) {
      PermissionSetSchema.assign(
        replicaState.localPermissions,
        PermissionSetSchema.identity,
      );
      replicaState.localOwner = false;
    } else if (userId === permissions.owner || this._state.isAdmin) {
      PermissionSetSchema.assign(
        replicaState.localPermissions,
        OWNER_PERMISSIONS,
      );
      replicaState.localOwner = true;
    } else {
      const groups = permissions.groups;
      const groupIds = Object.keys(groups);
      const localPermissions = PermissionSetSchema.assign(
        replicaState.localPermissions,
        PermissionSetSchema.identity,
      );
      for (let i = 0; i < groupIds.length; ++i) {
        const group = groups[groupIds[i]];
        if (group.members[userId] && groupIds[i] !== 'guest') {
          localGroups.push(groupIds[i]);
          combinePermissionSet(localPermissions, group.permissions);
        }
      }
      replicaState.localOwner = false;
    }

    // scan through undo/redo history and remove invalid actions if permissions have been revoked
    removeUnpermittedActions(
      replicaState.undoHistory,
      replicaState.localPermissions,
    );
    removeUnpermittedActions(
      replicaState.redoHistory,
      replicaState.localPermissions,
    );

    // 更新redux中的permission（后续接后端权限）
    const localPermissions = PermissionSetSchema.toJSON(
      replicaState.localPermissions,
    );
    const permissionsData = PermissionsSchema.toJSON(replicaState.permissions);

    reduxDispatch(
      setPermission({
        ...localPermissions,
        localOwner: replicaState.localOwner,
        localGroups: [...replicaState.localGroups],
        accessLevel: replicaState.permissions.accessLevel,
        owner: permissionsData.owner,
        users: permissionsData.users,
        collaborators: permissionsData.collaborators,
        groups: permissionsData.groups,
        banned: permissionsData.banned,
      }),
    );
  }

  // transaction constructors
  private _projectOptimisticDispatch = (action: ProjectAction[]) => {
    this._protocol.server.message.optimisticProjectAction(action);
  };
  public projectTransaction() {
    return new ClientProjectTransaction(
      this._state,
      this._dispatch,
      this._rollback,
      this._projectOptimisticDispatch,
    );
  }
  public voxelTransaction() {
    return new ClientVoxelTransaction(
      this._game,
      this._dispatch,
      this._rollback,
    );
  }
  public permissionsTransaction() {
    return new ClientPermissionTransaction(
      this._state,
      this._dispatch,
      this._rollback,
    );
  }
  public updateExtraProject() {
    this._protocol.server.message.updateExtraProject();
  }

  private _applyProjectSequence(actions: ProjectAction[]) {
    const replicaState = this._state.replica;
    const store = replicaState.projectStore;
    for (let i = 0; i < actions.length; ++i) {
      store.apply(ProjectRDA, actions[i]);
    }
    replicaState.projectDirty = true;
  }

  private _applyVoxelSequence(writes: VoxelWrite[]) {
    const voxels = this._game.voxel;
    for (let i = 0; i < writes.length; ++i) {
      const w = writes[i];
      voxels.setVoxelOptimistic(w.x, w.y, w.z, w.b);
    }
  }

  private _applyPermissionSequence(actions: PermissionAction[]) {
    const store = this._state.replica.permissionStore;
    for (let i = 0; i < actions.length; ++i) {
      store.apply(PermissionRDA, actions[i]);
    }
    this._updatePermissions();
  }

  // 4 different dispatch methods:
  //  dispatch: place a new event at head of queue, clear redo buffer and send to server
  //  rollback: opportunistically rollback action and request a server-side rollback
  //  undo: apply reverse action and send reverse action request to server
  //  redo: undoes the last undo operation
  private _dispatch = (action: ClientEditAction, allowUndo: boolean) => {
    const replicaState = this._state.replica;
    if (action.type === 'project') {
      const projectAction = action.data as ClientProjectAction;
      this._protocol.server.message.project(projectAction.forward);
      replicaState.projectDirty = true;
    } else if (action.type === 'voxel') {
      const voxelAction = action.data as ClientVoxelAction;
      this._protocol.server.message.voxel(voxelAction.forward);
    } else if (action.type === 'permission') {
      const permissionAction = action.data as ClientPermissionAction;
      this._protocol.server.message.permission(permissionAction.forward);
      this._updatePermissions();
    }

    if (allowUndo) {
      // clear redo history
      const redoHistory = replicaState.redoHistory;
      for (let i = 0; i < redoHistory.length; ++i) {
        ClientEditActionSchema.free(redoHistory[i]);
      }
      redoHistory.length = 0;

      // push to undo history
      replicaState.undoHistory.push(action);
    } else {
      ClientEditActionSchema.free(action);
    }
  };

  private _rollback = (action: ClientEditAction) => {
    if (action.type === 'project') {
      const projectAction = action.data as ClientProjectAction;
      this._applyProjectSequence(projectAction.inverse);
      this._protocol.server.message.rollbackProject(projectAction.inverse);
    } else if (action.type === 'voxel') {
      const voxelAction = action.data as ClientVoxelAction;
      this._applyVoxelSequence(voxelAction.inverse);
      this._protocol.server.message.rollbackVoxel(voxelAction.forward);
    } else if (action.type === 'permission') {
      const permissionAction = action.data as ClientPermissionAction;
      this._applyPermissionSequence(permissionAction.inverse);
      this._protocol.server.message.rollbackPermission(
        permissionAction.forward,
      );
    }

    ClientEditActionSchema.free(action);
  };

  public undo() {
    const replicaState = this._state.replica;
    const undo = replicaState.undoHistory;
    const action = undo.pop();
    if (!action) {
      return;
    }

    if (action.type === 'project') {
      const projectAction = action.data as ClientProjectAction;
      this._applyProjectSequence(projectAction.inverse);
      this._protocol.server.message.project(projectAction.inverse);
    } else if (action.type === 'voxel') {
      const voxelAction = action.data as ClientVoxelAction;
      this._applyVoxelSequence(voxelAction.inverse);
      this._protocol.server.message.voxel(voxelAction.inverse);
    } else if (action.type === 'permission') {
      const permissionAction = action.data as ClientPermissionAction;
      this._applyPermissionSequence(permissionAction.inverse);
      this._protocol.server.message.permission(permissionAction.inverse);
    }

    replicaState.redoHistory.push(action);
  }

  // redo is tricky because we need to update the inverse as we apply each action
  public redo() {
    const replicaState = this._state.replica;

    const redoHistory = replicaState.redoHistory;
    const action = redoHistory.pop();
    if (!action) {
      return;
    }

    if (action.type === 'project') {
      const projectAction = action.data as ClientProjectAction;

      const inverse = projectAction.inverse;
      for (let i = 0; i < inverse.length; ++i) {
        ProjectActionSchema.free(inverse[i]);
      }
      inverse.length = 0;

      const store = replicaState.projectStore;
      const forward = projectAction.forward;
      for (let i = 0; i < forward.length; ++i) {
        const a = forward[i];
        inverse.push(store.inverse(ProjectRDA, a));
        store.apply(ProjectRDA, a);
      }
      inverse.reverse();
      replicaState.projectDirty = true;

      this._protocol.server.message.project(forward);
    } else if (action.type === 'voxel') {
      const voxelAction = action.data as ClientVoxelAction;

      const inverse = voxelAction.inverse;
      for (let i = 0; i < inverse.length; ++i) {
        VoxelWriteSchema.free(inverse[i]);
      }
      inverse.length = 0;

      const forward = voxelAction.forward;
      const voxel = this._game.voxel;
      for (let i = 0; i < forward.length; ++i) {
        const w = VoxelWriteSchema.clone(forward[i]);
        const { x, y, z, b } = w;
        w.b = voxel.getVoxel(x, y, z);
        inverse.push(w);
        voxel.setVoxelOptimistic(x, y, z, b);
      }

      this._protocol.server.message.voxel(forward);
    } else if (action.type === 'permission') {
      const permissionAction = action.data as ClientPermissionAction;

      const inverse = permissionAction.inverse;
      for (let i = 0; i < inverse.length; ++i) {
        PermissionActionSchema.free(inverse[i]);
      }
      inverse.length = 0;

      const store = replicaState.permissionStore;
      const forward = permissionAction.forward;
      for (let i = 0; i < forward.length; ++i) {
        const a = forward[i];
        inverse.push(store.inverse(PermissionRDA, a));
        store.apply(PermissionRDA, a);
      }
      inverse.reverse();
      this._updatePermissions();

      this._protocol.server.message.permission(forward);
    }

    replicaState.undoHistory.push(action);
  }

  public tick() {
    const replicaState = this._state.replica;
    if (replicaState.projectDirty) {
      replicaState.projectStore.state(ProjectRDA, replicaState.project);
      replicaState.projectDirty = false;
      this.onProjectChange.notify();
    }
    if (replicaState.userId.toString() !== this._game.state.secret.userId) {
      this._updatePermissions();
    }
  }

  private _registerPromise(
    resolve: (hash: string) => void,
    reject: (error: string) => void,
  ) {
    const token = this._state.replica.rpcCounter++;
    this._state.replica.pendingRPC[token] = { resolve, reject };
    return token;
  }

  public setVoxelInvisible(value: boolean) {
    const w = this._game.state.voxelWorker;
    if (w) {
      w.postMessage({
        type: VoxelMessageType.SET_VOXEL_INVISIBLE,
        value,
      });
    }
  }

  public startProject = () => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.startProject(
        this._registerPromise(resolve, reject),
      );
    });
  };

  public stopProject = () => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.stopProject(
        this._registerPromise(resolve, reject),
      );
    });
  };

  public saveProject = (userId?: number) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.saveProject({
        token: this._registerPromise(resolve, reject),
        userId: userId ? userId.toString() : '',
      });
    });
  };

  public upgradeDatabase = async () => {
    await new Promise<string>((resolve, reject) => {
      this._protocol.server.message.upgradeDatabase({
        token: this._registerPromise(resolve, reject),
      });
    });
  };

  public restart = async () => {
    this._protocol.server.message.restart();
  };

  private _checkout(hash: string, oldHash: string) {
    return new Promise<string>((resolve, reject) =>
      this._protocol.server.message.checkoutProject({
        token: this._registerPromise(resolve, reject),
        hash,
        oldHash,
      }),
    );
  }

  public checkoutHash = (hash: string, oldHash: string) => {
    return this._checkout(hash, oldHash);
  };

  public createBranch = (branch: string) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.createBranch({
        token: this._registerPromise(resolve, reject),
        branch,
      });
    });
  };

  public switchBranch = (branch: string) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.switchBranch({
        token: this._registerPromise(resolve, reject),
        branch,
      });
    });
  };

  public renameBranch = (branch, oldBranch) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.renameBranch({
        token: this._registerPromise(resolve, reject),
        branch,
        oldBranch,
      });
    });
  };

  public requestToken = (durationMS: number, group: string) => {
    return new Promise<string>((resolve, reject) => {
      this._protocol.server.message.requestToken({
        token: this._registerPromise(resolve, reject),
        duration: durationMS,
        group,
      });
    });
  };

  public applyForEditing = () => {
    this._protocol.server.message.applyForEditing();
  };

  public acceptApplication = (id: string) => {
    this._protocol.server.message.acceptApplication(id);
  };

  public rejectApplication = (id: string) => {
    this._protocol.server.message.rejectApplication(id);
  };

  public clearNewApplicants = () => {
    this._protocol.server.message.clearNewApplicants();
  };

  public isInviteLinkExpired = () => {
    if (typeof window !== 'undefined') {
      const query = querystring.parse(window.location.search);
      if (query['?p']) {
        this._logger.info(`enter query:${JSON.stringify(query['?p'])}`);
        this._protocol.server.message.inviteLinkExpired('' + query['?p']);
      }
    }
  };
  public inviteLinkGroup = (): Promise<any> => {
    if (typeof window !== 'undefined') {
      const query = querystring.parse(window.location.search);
      return new Promise((resolve, reject) => {
        this._protocol.server.message.inviteLinkGroup({
          token: this._registerPromise(resolve, reject),
          linkString: '' + query['?p'],
        });
      });
    }
    return new Promise(() => {});
  };

  public addCollaborator = (id: string, group: string) => {
    this._protocol.server.message.addCollaborator({ id, group });
  };

  public cancelCollaborator = (id: string) => {
    this._protocol.server.message.cancelCollaborator(id);
  };
}
