import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.11';
export const toVersion = '0.0.12';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.12';
  project.prevHash = hash;

  // update project name and description
  project.description = '';
  project.previewImage = '';

  delete project.environment.fog;

  const sky = project.environment.sky;
  sky.skyType = 0;
  sky.sunDirection = { x: 0, y: 1, z: 0 };
  sky.sunColor = { r: 1000, g: 1000, b: 1000 };
  sky.skyLeft = { r: 0, g: 0, b: 0 };
  sky.skyRight = { r: 0, g: 0, b: 0 };
  sky.skyTop = { r: 0, g: 0, b: 0 };
  sky.skyBottom = { r: 0, g: 0, b: 0 };
  sky.skyFront = { r: 0, g: 0, b: 0 };
  sky.skyBack = { r: 0, g: 0, b: 0 };

  sky.fogStartDistance = 0;
  sky.fogHeightDensity = 0;
  sky.fogHeightOffset = 0;
  sky.fogHeightFalloff = 0.8;
  sky.fogDensity = 0;
  sky.maxFog = 1;

  return bs.storeJSON(project);
}
