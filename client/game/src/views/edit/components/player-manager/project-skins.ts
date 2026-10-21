export type ProjectSkinData = {
  id: number;
  name: string;
  modelFileHash: string;
  previewHash: string;
  isDefault: boolean;
};

export function getProjectSkinPreviewUrl(
  previewHash: string,
  backendServerUrl: string,
  fallbackUrl: string,
) {
  if (!previewHash) return fallbackUrl;
  return `${backendServerUrl.replace(/\/$/, '')}/engine/m/${encodeURIComponent(
    previewHash,
  )}`;
}

function stableProjectSkinId(name: string) {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Project skin IDs are UI-only. Keep them negative so they can never be
  // mistaken for a VOXA/backend model ID by local CRUD actions.
  return -(Math.abs(hash | 0) + 1);
}

export function getProjectSkins(
  skinAssets: Record<string, { hash: string }>,
  defaultSkinName: string,
  skinPreviews: Record<string, string> = {},
): ProjectSkinData[] {
  return Object.entries(skinAssets)
    .filter(([name, asset]) =>
      Boolean(name && asset?.hash) && !/__local_\d+$/.test(name),
    )
    .map(([name, asset]) => ({
      id: stableProjectSkinId(name),
      name,
      modelFileHash: asset.hash,
      previewHash: skinPreviews[name] || '',
      isDefault: name === defaultSkinName,
    }));
}
