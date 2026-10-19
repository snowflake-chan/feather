import type { Logger } from 'pino';

import { BuildSystemAPI } from '../type';
import { ContentServer } from '@box/content-server';
import {
  PermissionAccessLevel,
  PermissionGroupMemberRDA,
  PermissionGroupRDA,
  PermissionsSchema,
  PermissionUserRDA,
  VersionControlRDA,
} from '@box/schema/permissions/permission-rda';
import { storePermissions } from './permission-serialize';

const PermissionGroupSchema = PermissionGroupRDA.stateSchema;

const VersionControlSchema = VersionControlRDA.stateSchema;

export async function createDefaultPermissions(spec: {
  userId: number;
  projectHash: string;
  contentServer: ContentServer;
  buildSystem: BuildSystemAPI;
  logger: Logger;
}) {
  const { userId, contentServer, logger } = spec;
  const permissions = PermissionsSchema.clone(PermissionsSchema.identity);

  logger.info(`creating default permissions.  owner id = ${userId}`);

  // set owner hash
  permissions.owner = userId.toString();
  permissions.prevHash = '';

  {
    // guest
    const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
    const groupPermissions = group.permissions;
    group.defaultGroup = true;
    groupPermissions.chatEnabled = true;
    permissions.groups['guest'] = group;
  }
  {
    // contributors
    const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
    const groupPermissions = group.permissions;
    groupPermissions.editProject =
      groupPermissions.editModel =
      groupPermissions.editPlayer =
      groupPermissions.editScene =
      groupPermissions.editFile =
      groupPermissions.editHierarchy =
      groupPermissions.editScripts =
      groupPermissions.editVoxels =
      groupPermissions.playButton =
      groupPermissions.chatEnabled =
      groupPermissions.debugger =
        true;
    permissions.groups['contributor'] = group;
  }

  if (userId) {
    const userRecord = (permissions.users[userId] =
      PermissionUserRDA.stateSchema.alloc());
    userRecord.createdAt = new Date();
  } else {
    // admin
    const group = PermissionGroupSchema.clone(PermissionGroupSchema.identity);
    const groupPermissions = group.permissions;
    groupPermissions.versionControl =
      groupPermissions.editPermissions =
      groupPermissions.editProject =
      groupPermissions.editModel =
      groupPermissions.editPlayer =
      groupPermissions.editScene =
      groupPermissions.editFile =
      groupPermissions.editHierarchy =
      groupPermissions.editScripts =
      groupPermissions.editVoxels =
      groupPermissions.playButton =
      groupPermissions.publish =
      groupPermissions.chatEnabled =
      groupPermissions.debugger =
        true;

    group.defaultGroup = true;

    if (userId) {
      const ownerRecord = PermissionGroupMemberRDA.stateSchema.alloc();
      ownerRecord.addedAt = new Date();
      group.members[userId] = ownerRecord;
    }

    permissions.groups['test-admin'] = group;
    permissions.accessLevel = PermissionAccessLevel.REGISTERED_ONLY;
  }

  // initialize permissions
  const versionControl = VersionControlSchema.clone(
    VersionControlSchema.identity,
  );
  versionControl.branches = {
    master: {
      name: 'master',
      headHash: spec.projectHash,
    },
  };
  versionControl.currentBranch = 'master';
  permissions.versionControl = versionControl;

  permissions.collaborators = [];

  // store permissions hash
  return storePermissions(spec.buildSystem, permissions);
}
