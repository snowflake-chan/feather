import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.4';
export const toVersion = '0.1.5';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.5';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  // migrate the collaborator list duplicate

  permissions.owner = permissions.owner.toString();

  const collaboratorsHash = permissions.collaborators;
  let collaborators = await bs.retrieveJSON(collaboratorsHash);
  const newCollaborators = collaborators.map((id) => id.toString());
  const newCollaboratorsHash = await bs.storeJSON(newCollaborators);
  permissions.collaborators = newCollaboratorsHash;

  return bs.storeJSON(permissions);
}
