import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.10';
export const toVersion = '0.0.11';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.11';
  project.prevHash = hash;
  project.timestamp = 0;
  return bs.storeJSON(project);
}
