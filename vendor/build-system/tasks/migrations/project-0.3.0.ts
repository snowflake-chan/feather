import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.2.2';
export const toVersion = '0.3.0';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.0';
  project.prevHash = hash;

  // split assets into subtypes and remove timestamps
  const assets: any = {};
  const scriptAssets: any = {};
  const keys = Object.keys(project.assets);
  keys.sort();
  for (let i = 0; i < keys.length; ++i) {
    const path = keys[i];
    const asset = project.assets[path];
    delete asset.createdAt;
    delete asset.lastModified;
    if (asset.type === 1) {
      scriptAssets[path] = asset;
    } else {
      assets[path] = asset;
    }
  }

  const [
    infoHash,
    entitiesHash,
    assetsHash,
    scriptAssetsHash,
    deleteAssetsHash,
    voxelsHash,
    playerHash,
    environmentHash,
    physicsHash,
    ambientSoundHash,
  ] = await Promise.all([
    bs.storeJSON({
      displayName: project.displayName,
      description: project.description,
      previewImage: project.previewImage,
      bannerImages: project.bannerImages,
    }),
    bs.storeJSON(project.entities),
    bs.storeJSON(assets),
    bs.storeJSON(scriptAssets),
    bs.storeJSON(project.deleteAssets || []),
    bs.storeJSON(project.voxels),
    bs.storeJSON(project.player),
    bs.storeJSON(project.environment),
    bs.storeJSON(project.physics),
    bs.storeJSON(project.ambientSound),
  ]);

  project.info = infoHash;
  project.entities = entitiesHash;
  project.assets = assetsHash;
  project.scriptAssets = scriptAssetsHash;
  project.deleteAssets = deleteAssetsHash;
  project.voxels = voxelsHash;
  project.player = playerHash;
  project.environment = environmentHash;
  project.physics = physicsHash;
  project.ambientSound = ambientSoundHash;

  // delete old display info
  delete project.displayName;
  delete project.description;
  delete project.previewImage;
  delete project.bannerImages;

  return bs.storeJSON(project);
}
