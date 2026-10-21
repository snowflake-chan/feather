import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.11';
export const toVersion = '0.3.12';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.12';
  project.prevHash = hash;

  const player = await bs.retrieveJSON(project.player);
  player.showIndicator = false;
  project.player = await bs.storeJSON(player);
  return bs.storeJSON(project);
}
