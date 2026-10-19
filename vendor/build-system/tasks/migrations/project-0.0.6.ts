import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.0.6';
export const toVersion = '0.0.7';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.0.7';
  project.prevHash = hash;
  const p = project.player;
  p.color = [1, 1, 1];
  p.emissive = p.shininess = p.metalness = 0;
  return bs.storeJSON(project);
}
