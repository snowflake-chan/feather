import {
  AssetEntry,
  AssetEntryRDA,
  AssetType,
} from '@box/schema/project/project-rda';

type ProjectAssetRecoveryAction = {
  deleteAssets: { splice(index: number, deleteCount: number): unknown };
  audioAssets: { set(name: string, value: GroupAssetValue): unknown };
  pictureAssets: { set(name: string, value: GroupAssetValue): unknown };
  assets: { set(name: string, value: AssetEntry): unknown };
};

type ProjectAssetRecoveryTransaction = {
  push(
    callback: (action: ProjectAssetRecoveryAction) => unknown,
  ): ProjectAssetRecoveryTransaction;
  commit(label?: unknown, allowUndo?: boolean): void;
};

type GroupAssetValue = {
  id: string;
  hash: string;
  previewImage: string;
  type: AssetType;
  size: number;
  updateAt: number;
};

/**
 * Builds the restore actions before removing the recycle-bin entry.
 *
 * MuRDA frees a list item's backing state as soon as splice is applied. The
 * caller must therefore never read `asset` after queuing that splice.
 */
export function appendProjectAssetRecovery(
  transaction: ProjectAssetRecoveryTransaction,
  index: number,
  restoredName: string,
  asset: AssetEntry,
): ProjectAssetRecoveryTransaction {
  const recovered = AssetEntryRDA.stateSchema.clone(asset);

  transaction.push((action) => action.deleteAssets.splice(index, 1));
  if (recovered.type === AssetType.AUDIO) {
    transaction.push((action) =>
      action.audioAssets.set(restoredName, {
        id: String(recovered.contentId),
        hash: recovered.hash,
        previewImage: recovered.previewImage,
        type: AssetType.AUDIO,
        size: recovered.size,
        updateAt: Date.now(),
      }),
    );
  } else if (recovered.type === AssetType.PICTURE) {
    transaction.push((action) =>
      action.pictureAssets.set(restoredName, {
        id: String(recovered.contentId),
        hash: recovered.hash,
        previewImage: recovered.previewImage,
        type: AssetType.PICTURE,
        size: recovered.size,
        updateAt: Date.now(),
      }),
    );
  } else {
    transaction.push((action) => action.assets.set(restoredName, recovered));
  }

  return transaction;
}
