import {
  AssetEntry,
  AssetType,
} from '@box/schema/project/project-rda';
import type { ExtraProjectInfo } from '@box/schema/project/hot-schema';

export type DeletedAsset = { key: string; value: AssetEntry };

function findProjectModelTrashIndex(
  deleteAssets: DeletedAsset[],
  meshPath: string,
) {
  return deleteAssets.findIndex(
    ({ key, value }) =>
      key === meshPath && value.type === AssetType.VOXEL_MODEL,
  );
}

export function moveProjectModelToTrash(
  extraProject: ExtraProjectInfo,
  deleteAssets: DeletedAsset[],
  meshPath: string,
  bounds: [number, number, number] = [0, 0, 0],
  size = 0,
) {
  const asset = extraProject.meshAssets[meshPath];
  if (!asset) throw new Error('model not found');

  const previousTrashIndex = findProjectModelTrashIndex(deleteAssets, meshPath);
  if (previousTrashIndex >= 0) deleteAssets.splice(previousTrashIndex, 1);
  deleteAssets.push({
    key: meshPath,
    value: {
      ownerId: 0,
      contentId: asset.modelId,
      hash: asset.hash,
      previewImage: asset.modelPreviewHash,
      type: AssetType.VOXEL_MODEL,
      size,
      bounds,
      animated: asset.animated,
    },
  });
  delete extraProject.meshAssets[meshPath];
}

export function restoreProjectModelFromTrash(
  extraProject: ExtraProjectInfo,
  deleteAssets: DeletedAsset[],
  meshPath: string,
  updatedAt = new Date().toISOString(),
) {
  if (extraProject.meshAssets[meshPath]) {
    throw new Error('model name already exists');
  }
  const index = findProjectModelTrashIndex(deleteAssets, meshPath);
  if (index < 0) throw new Error('model not found in trash');
  const deleted = deleteAssets[index].value;
  extraProject.meshAssets[meshPath] = {
    modelId: deleted.contentId,
    hash: deleted.hash,
    modelPreviewHash: deleted.previewImage,
    animated: deleted.animated,
    updatedAt,
  };
  deleteAssets.splice(index, 1);
}

export function purgeProjectModelFromTrash(
  deleteAssets: DeletedAsset[],
  meshPath: string,
) {
  const index = findProjectModelTrashIndex(deleteAssets, meshPath);
  if (index < 0) throw new Error('model not found in trash');
  deleteAssets.splice(index, 1);
}
