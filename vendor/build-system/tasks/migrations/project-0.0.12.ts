import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.12';
export const toVersion = '0.0.13';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.13';
  project.prevHash = hash;

  const sky = project.environment.sky;
  delete sky.fogHeightDensity;
  sky.fogColor = { r: 1, g: 1, b: 1 };

  return bs.storeJSON(project);
}
