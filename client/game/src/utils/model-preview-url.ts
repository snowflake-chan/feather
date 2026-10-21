import { resolveRuntimeURL } from './runtime-url';

/** Resolve a project-model thumbnail without assuming a public OSS CDN. */
export function getModelPreviewURL({
  previewHash,
  isLocalGameServer,
  runtimeURL,
  ossCDNURL,
}: {
  previewHash: string;
  isLocalGameServer: boolean;
  runtimeURL?: string;
  ossCDNURL?: string;
}) {
  if (!previewHash) return '';
  const hash = encodeURIComponent(previewHash);
  if (isLocalGameServer) {
    return resolveRuntimeURL(runtimeURL || '', `block/${hash}`);
  }
  return `${(ossCDNURL || '').replace(/\/$/, '')}/engine/m/${hash}`;
}
