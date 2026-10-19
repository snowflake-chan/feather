import { AssetType } from '@box/schema/project/project-rda';
import { BuildSystem } from '../../type';

export const name = 'project';
export const fromVersion = '0.3.26';
export const toVersion = '0.3.27';

export async function migration(bs: BuildSystem, hash: string) {
  const project = await bs.retrieveJSON(hash);
  project.version = '0.3.27';
  project.prevHash = hash;

  const assets = await bs.retrieveJSON(project.assets);

  const pictureAssets = {};

  for (const key in assets) {
    const asset = assets[key];

    if (asset.type === AssetType.PICTURE) {
      // 构造pictureAssets结构，id在后面统一生成
      pictureAssets[key] = {
        id: '',
        updateAt: Date.now(),
        type: asset.type,
        hash: asset.hash,
        size: asset.size,
        previewImage: asset.previewImage,
      };

      // 删除asset中type为图片的字段
      delete assets[key];
    }

    // 删除asset中type为音频的字段
    if (asset.type === AssetType.AUDIO) {
      delete assets[key];
    }
  }

  // 生成并修改图片id
  const pictureIds = await getAssetsIds(bs, Object.keys(pictureAssets).length);
  Object.keys(pictureAssets).forEach(
    (key, idx) => (pictureAssets[key].id = pictureIds[idx]),
  );

  // 存储新assets字段和pictureAssets字段
  project.assets = await bs.storeJSON(assets);
  project.pictureAssets = await bs.storeJSON(pictureAssets);

  const audioAssets = await bs.retrieveJSON(project.audioAssets);
  // 生成音频资源id
  const audioIds = await getAssetsIds(bs, Object.keys(audioAssets).length);

  Object.keys(audioAssets).forEach((key, idx) => {
    const audioAsset = audioAssets[key];
    audioAssets[key] = {
      id: audioIds[idx],
      updateAt: Date.now(),
      type: audioAsset.type,
      hash: audioAsset.hash,
      size: audioAsset.size,
      previewImage: audioAsset.previewImage,
    };
  });

  project.audioAssets = await bs.storeJSON(audioAssets);

  return bs.storeJSON(project);
}

const MAX_FETCH_COUNT = 50;
async function getAssetsIds(bs: BuildSystem, num: number) {
  const loopCount = Math.ceil(num / MAX_FETCH_COUNT);
  const lastNum = num % MAX_FETCH_COUNT;
  const ids: string[] = [];
  for (let i = 0; i < loopCount; i++) {
    const fetchCount = i === loopCount - 1 ? lastNum : MAX_FETCH_COUNT;
    ids.push(...(await bs.nextUidListUsingGet({ num: fetchCount })));
  }
  return ids;
}
