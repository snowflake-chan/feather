import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.5';
export const toVersion = '0.3.6';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.6';
  project.prevHash = hash;

  project.committerId = 0;

  return bs.storeJSON(project);
}
