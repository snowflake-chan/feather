import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.4';
export const toVersion = '0.1.5';

// adds particles
export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.5';
  project.prevHash = hash;
  project.timestamp = new Date();

  project.player.invisible = false;
  project.player.showName = true;

  return bs.storeJSON(project);
}
