import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.2';
export const toVersion = '0.1.3';

// adds particles
export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.3';
  project.prevHash = hash;
  project.timestamp = new Date();

  project.player.allowJump = true;
  project.player.allowDoubleJump = true;

  return bs.storeJSON(project);
}
