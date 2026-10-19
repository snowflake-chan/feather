import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.1.5';
export const toVersion = '0.1.6';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.1.6';
  project.prevHash = hash;
  project.timestamp = new Date();

  project.bannerImages = [];

  return bs.storeJSON(project);
}
