import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.14';
export const toVersion = '0.0.15';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.15';
  project.prevHash = hash;

  const snow = project.environment.snow;

  const parts = snow.texture.match(/block\/(.*)$/);
  if (parts) {
    snow.texture = parts[1];
  } else {
    snow.texture = '';
  }

  return bs.storeJSON(project);
}
