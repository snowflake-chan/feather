import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.3';
export const toVersion = '0.0.4';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.4';
  project.prevHash = hash;
  project.player.colorLUT = '';
  return bs.storeJSON(project);
}
