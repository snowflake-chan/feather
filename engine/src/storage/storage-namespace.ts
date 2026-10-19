export type StorageNamespaceIdentity = {
  groupStorageNamespace?: unknown;
  groupId?: unknown;
  dataStorageNamespace?: unknown;
  containerName?: unknown;
  contentId?: unknown;
  serverId?: unknown;
};

function identityPart(value: unknown) {
  const normalized = String(value ?? '').trim();
  return normalized && normalized !== '0' ? normalized : '';
}

/**
 * Resolve getGroupStorage without a process-wide global fallback. Explicit
 * group identity wins; a misconfigured standalone runtime remains isolated by
 * its best available map identity.
 */
export function resolveGroupStorageNamespace(config: StorageNamespaceIdentity) {
  const explicit = identityPart(config.groupStorageNamespace);
  if (explicit) return explicit;
  const groupId = identityPart(config.groupId);
  if (groupId) return groupId;
  const projectIdentity =
    identityPart(config.dataStorageNamespace) ||
    identityPart(config.containerName) ||
    identityPart(config.contentId);
  if (projectIdentity) return projectIdentity;
  return `isolated-${identityPart(config.serverId) || 'standalone'}`;
}
