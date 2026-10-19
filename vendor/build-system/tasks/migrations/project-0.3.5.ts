import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.4';
export const toVersion = '0.3.5';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.5';
  project.prevHash = hash;

  const info = await bs.retrieveJSON(project.info);

  delete info.customUrl;

  project.info = await bs.storeJSON(info);

  return bs.storeJSON(project);
}
