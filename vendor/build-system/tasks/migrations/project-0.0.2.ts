import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.2';
export const toVersion = '0.0.3';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.3';
  project.player.cameraType = 'follow';
  project.player.initialPosition = {
    x: 64,
    y: 140,
    z: 64,
  };
  return bs.storeJSON(project);
}
