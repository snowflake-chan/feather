import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.3';
export const toVersion = '0.1.4';

// adds particles
export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.4';
  project.prevHash = hash;
  project.timestamp = new Date();

  delete project.player.fallSpeed;
  delete project.player.fallAcceleration;

  return bs.storeJSON(project);
}
