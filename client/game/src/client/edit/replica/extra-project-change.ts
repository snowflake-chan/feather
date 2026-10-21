import type { ExtraProjectInfo } from '@box/schema/project/hot-schema';

export type ResourceChangeCount = {
  added: number;
  updated: number;
  removed: number;
};

export type ExtraProjectChange = {
  models: ResourceChangeCount;
  skins: ResourceChangeCount;
  scripts: ResourceChangeCount;
  defaultSkinChanged: boolean;
};

function countDictionaryChanges(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): ResourceChangeCount {
  const result = { added: 0, updated: 0, removed: 0 };
  for (const key of Object.keys(next)) {
    if (!(key in previous)) result.added += 1;
    else if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) {
      result.updated += 1;
    }
  }
  for (const key of Object.keys(previous)) {
    if (!(key in next)) result.removed += 1;
  }
  return result;
}

export function summarizeExtraProjectChange(
  previous: ExtraProjectInfo,
  next: ExtraProjectInfo,
): ExtraProjectChange {
  return {
    models: countDictionaryChanges(previous.meshAssets, next.meshAssets),
    skins: countDictionaryChanges(previous.skinAssets, next.skinAssets),
    scripts: countDictionaryChanges(previous.scriptAssets, next.scriptAssets),
    defaultSkinChanged: previous.defaultSkinName !== next.defaultSkinName,
  };
}

export function hasExtraProjectChange(change: ExtraProjectChange) {
  return (
    change.defaultSkinChanged ||
    [change.models, change.skins, change.scripts].some(
      ({ added, updated, removed }) => added + updated + removed > 0,
    )
  );
}
