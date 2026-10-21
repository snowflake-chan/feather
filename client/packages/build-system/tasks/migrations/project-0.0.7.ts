import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.7';
export const toVersion = '0.0.8';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.8';
  project.prevHash = hash;
  project.physics.gravity = -0.1;
  project.physics.velocityDamping = 0.01;
  return bs.storeJSON(project);
}
