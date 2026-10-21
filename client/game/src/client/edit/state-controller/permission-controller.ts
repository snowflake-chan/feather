import { EditReplicaClient } from '../replica/replica-client';
import { ClientPermissionTransaction } from '../replica/transaction/client-permission-transaction';
import {
  PermissionSet,
  PermissionGroupRDA,
  PermissionAccessLevel,
  VersionControlBranches,
} from '@box/schema/permissions/permission-rda';
import { GameClientState } from 'src/engine/game-client-schema';
import { ClientStateType } from '../edit-schema';

export class PermissionController {
  private _tx: ClientPermissionTransaction;

  constructor(
    private _replica: EditReplicaClient,
    private _state: ClientStateType,
    private _gameState: GameClientState,
  ) {
    this._tx = this._replica.permissionsTransaction();
  }

  public addPermissionSet = (permissionSet: PermissionSet, name: string) => {
    const permission = {
      permissions: permissionSet,
      members: {},
      defaultGroup: false,
    };
    this._tx.push((action) => action.groups.set(name, permission)).commit();
  };

  public removePermissionSet = (permissionName: string) => {
    this._tx.push((action) => action.groups.remove(permissionName)).commit();
  };

  public setPermission = (
    permissionName: string,
    newPermission: PermissionSet,
    newName?: string,
  ) => {
    const permission = PermissionGroupRDA.stateSchema.clone(
      this._state.replica.permissions.groups[permissionName],
    );
    permission.permissions = newPermission;
    if (newName) {
      this._tx
        .push((action) => action.groups.move(permissionName, newName))
        .push((action) => action.groups.set(newName, permission));
    } else {
      const { editModel, editScene, editFile, editHierarchy } = newPermission;
      const isEditProject = editModel || editScene || editFile || editHierarchy;
      this._tx
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.chatEnabled(newPermission.chatEnabled),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.debugger(newPermission.debugger),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editPermissions(newPermission.editPermissions),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editProject(isEditProject),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editModel(newPermission.editModel),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editScene(newPermission.editScene),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editFile(newPermission.editFile),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editHierarchy(newPermission.editHierarchy),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editScripts(newPermission.editScripts),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editPlayer(newPermission.editPlayer),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editVoxels(newPermission.editVoxels),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.playButton(newPermission.playButton),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.publish(newPermission.publish),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.versionControl(newPermission.versionControl),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editStatisticsData(newPermission.editStatisticsData),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editMarket(newPermission.editMarket),
        )
        .push((action) =>
          action.groups
            .update(permissionName)
            .permissions.editPublish(newPermission.editPublish),
        );
    }
    this._tx.commit();
  };

  public setUserPermission = (
    userId: string,
    currentPermission: string[],
    newPermission: string[],
  ) => {
    for (const permission of currentPermission) {
      this._tx.push((action) =>
        action.groups.update(permission).members.remove(userId),
      );
    }
    for (const permission of newPermission) {
      this._tx.push((action) =>
        action.groups.update(permission).members.set(userId, {
          addedAt: new Date(),
        }),
      );
    }
    this._tx.commit();
  };

  public setAccessLevel = (accessLevel: PermissionAccessLevel) => {
    this._tx.push((action) => action.accessLevel(accessLevel)).commit();
  };
  public banUser = (
    userId: string,
    bannedBy: string,
    reason: string,
    currentPermission: string[],
  ) => {
    for (const permission of currentPermission) {
      this._tx.push((action) =>
        action.groups.update(permission).members.remove(userId.toString()),
      );
    }
    this._tx
      .push((action) =>
        action.banned.set(userId.toString(), {
          bannedBy: bannedBy.toString(),
          reason: reason,
        }),
      )
      .commit();
    const idx = this._state.replica.permissions.collaborators.indexOf(
      userId.toString(),
    );
    if (idx >= 0) {
      this._tx.push((action) => action.collaborators.splice(idx, 1)).commit();
    }
  };

  public unbanUser = (userId: string) => {
    this._tx.push((action) => action.banned.remove(userId)).commit();
  };

  public acceptApplication = (
    userId: string,
    currentPermission: string[],
    permissions: string[],
  ) => {
    if (!userId) {
      return;
    }
    const time = new Date();
    this._tx.push((action) =>
      action.users.set(userId, {
        createdAt: time,
      }),
    );
    for (const permission of currentPermission) {
      this._tx.push((action) =>
        action.groups.update(permission).members.remove(userId),
      );
    }
    for (const permission of permissions) {
      this._tx.push((action) =>
        action.groups.update(permission).members.set(userId, {
          addedAt: time,
        }),
      );
    }
    this._tx.commit();
    this._replica.acceptApplication(userId);
  };

  public deniedApplication = (userId: string) => {
    this._replica.rejectApplication(userId);
  };

  public ApplyForEditing = () => {
    this._replica.applyForEditing();
  };
  public addCollaborator = (userId: string, group: string) => {
    if (!!group) {
      this._replica.addCollaborator(userId, group);
    } else if (
      this._state.replica.permissions.collaborators.indexOf(userId) === -1
    ) {
      this._tx.push((action) => action.collaborators.push(userId)).commit();
    }
  };
  public spliceCollaborators = (start: number, deleteCount?: number) => {
    this._tx
      .push((action) => action.collaborators.splice(start, deleteCount))
      .commit();
  };
  public moveCollaboratorToTop = (idx: number, userId: string) => {
    this._tx
      .push((action) => action.collaborators.splice(idx, 1))
      .push((action) => action.collaborators.unshift(userId));
    this._tx.commit();
  };
  public moveCollaboratorToBottom = (idx: number, userId: string) => {
    this._tx
      .push((action) => action.collaborators.splice(idx, 1))
      .push((action) => action.collaborators.push(userId))
      .commit();
  };
  public moveCollaborator(oldIndex: number, newIndex: number) {
    const newList = [...this._state.replica.permissions.collaborators];
    if (
      oldIndex === newIndex ||
      Math.min(oldIndex, newIndex) < 0 ||
      Math.max(oldIndex, newIndex) > newList.length - 1
    ) {
      return;
    }
    const temp = newList.filter((_: {}, index: number) => index !== oldIndex);
    temp.splice(newIndex, 0, newList[oldIndex]);
    this._tx.push((action) => action.collaborators.reset(temp)).commit();
  }

  public cancelCollaborator = (id: string) => {
    this._gameState.joinAsCollaborator = false;
    this._replica.cancelCollaborator(id);
  };
}
