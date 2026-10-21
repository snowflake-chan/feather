import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.17';
export const toVersion = '0.3.18';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.18';
  project.prevHash = hash;

  const physics = await bs.retrieveJSON(project.physics);
  physics.useOBB = false;
  project.physics = await bs.storeJSON(physics);
  return bs.storeJSON(project);
}
