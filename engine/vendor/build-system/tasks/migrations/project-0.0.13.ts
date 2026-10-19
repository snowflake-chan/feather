import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.13';
export const toVersion = '0.0.14';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.14';
  project.prevHash = hash;

  const sky = project.environment.sky;
  if (sky.fogHeightOffset === 0 && sky.fogHeightFalloff === 0.8) {
    sky.fogHeightOffset = -10;
    sky.fogHeightFalloff = 0.2;
  }

  return bs.storeJSON(project);
}
