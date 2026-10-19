import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.1';
export const toVersion = '0.1.2';

// adds particles
export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.2';
  project.prevHash = hash;
  project.timestamp = new Date();

  project.player.allowAction0 = true;
  project.player.allowAction1 = true;

  return bs.storeJSON(project);
}
