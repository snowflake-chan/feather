import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.13';
export const toVersion = '0.3.14';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.14';
  project.prevHash = hash;

  const player = await bs.retrieveJSON(project.player);
  player.allowCrouch = true;
  project.player = await bs.storeJSON(player);
  return bs.storeJSON(project);
}
