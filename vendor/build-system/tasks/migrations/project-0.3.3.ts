import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.2';
export const toVersion = '0.3.3';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.3';
  project.prevHash = hash;

  const assets = await bs.retrieveJSON(project.assets);
  Object.keys(assets).forEach((n) => {
    const asset = assets[n];
    asset.hash = (asset.hash || '').replace(/\.part$/, '.png');
    asset.previewImage = (asset.previewImage || '').replace(/\.part$/, '.png');
  });
  project.assets = await bs.storeJSON(assets);

  return bs.storeJSON(project);
}
