import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.2.0';
export const toVersion = '0.2.1';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.2.1';
  project.prevHash = hash;
  project.timestamp = new Date();

  project.collisionFilter = {};

  return bs.storeJSON(project);
}
