import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.6';
export const toVersion = '0.3.7';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.7';
  project.storageMode = 'sqlite';
  project.prevHash = hash;
  return bs.storeJSON(project);
}
