import { BuildSystem } from '../../type';

export const name = 'permission';
export const fromVersion = '0.1.1';
export const toVersion = '0.1.2';

export async function migration(bs: BuildSystem, hash: string) {
  const permissions = await bs.retrieveJSON(hash);
  permissions.version = '0.1.2';
  permissions.type = 'permission';
  permissions.prevHash = hash;

  //  will be handled when we call fromJSON on the project

  const vcHash = permissions.versionControl;
  const versionControl = await bs.retrieveJSON(vcHash);
  versionControl.branches = {
    master: {
      name: 'master',
      headHash: versionControl.branches['master'].headHash,
    },
  };

  versionControl.currentBranch = 'master';

  const versionControlHash = await bs.storeJSON(versionControl);

  permissions.versionControl = versionControlHash;

  return bs.storeJSON(permissions);
}
