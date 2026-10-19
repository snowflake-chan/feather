import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.10';
export const toVersion = '0.3.11';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.11';
  project.prevHash = hash;
  return bs.storeJSON(project);
}
