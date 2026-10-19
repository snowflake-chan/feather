import { buildMigrate } from '../migrations';
import { BuildSystemAPI } from '../type';
import {
  PermissionRDA,
  Permissions,
} from '@box/schema/permissions/permission-rda';

const CURRENT_VERSION = PermissionRDA.stateSchema.identity.version;

export async function storePermissions(
  bs: BuildSystemAPI,
  permissions: Permissions,
): Promise<string> {
  const rawJSON = PermissionRDA.stateSchema.toJSON(permissions);

  const [
    versionControlHash,
    groupsHash,
    usersHash,
    bannedHash,
    collaboratorsHash,
  ] = await Promise.all([
    bs.storeJSON(rawJSON.versionControl),
    bs.storeJSON(rawJSON.groups),
    bs.storeJSON(rawJSON.users),
    bs.storeJSON(rawJSON.banned),
    bs.storeJSON(rawJSON.collaborators),
  ]);

  rawJSON.versionControl = versionControlHash;
  rawJSON.groups = groupsHash;
  rawJSON.users = usersHash;
  rawJSON.banned = bannedHash;
  rawJSON.collaborators = collaboratorsHash;

  return bs.storeJSON(rawJSON);
}

export async function retrievePermissions(
  bs: BuildSystemAPI,
  hash: string,
): Promise<{ hash: string; permissions: Permissions }> {
  const json = await bs.retrieveJSON(hash);

  if (!(json.type === 'permission' || json.type === 'permissions')) {
    throw new Error('invalid permissions hash, incorrect type: ' + json.type);
  }

  if (json.version !== CURRENT_VERSION) {
    bs.logger.info(
      `permssions ${hash} is an older version ${json.version}, migrating to ${CURRENT_VERSION}`,
    );
    const nextHash = await buildMigrate(
      bs,
      bs.logger,
      'permission',
      json.version,
      CURRENT_VERSION,
      hash,
    );
    if (!nextHash) {
      throw new Error(
        `error migrating permissions ${hash} from ${json.version} to ${CURRENT_VERSION}`,
      );
    }
    bs.logger.info(
      `successfully migrated permssions ${hash} from ${json.version} to ${CURRENT_VERSION}.  new hash = ${nextHash}`,
    );
    return retrievePermissions(bs, nextHash);
  }

  const [versionControl, groups, users, banned, collaborators] =
    await Promise.all([
      bs.retrieveJSON(json.versionControl),
      bs.retrieveJSON(json.groups),
      bs.retrieveJSON(json.users),
      bs.retrieveJSON(json.banned),
      bs.retrieveJSON(json.collaborators),
    ]);

  json.versionControl = versionControl;
  json.groups = groups;
  json.users = users;
  json.banned = banned;
  json.collaborators = collaborators;

  return {
    hash,
    permissions: PermissionRDA.stateSchema.fromJSON(json),
  };
}
