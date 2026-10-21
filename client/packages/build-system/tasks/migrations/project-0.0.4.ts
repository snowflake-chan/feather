import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.4';
export const toVersion = '0.0.5';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.5';
  project.prevHash = hash;
  project.player.scale = 1;
  return bs.storeJSON(project);
}
