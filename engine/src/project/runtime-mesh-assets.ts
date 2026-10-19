import type { ExtraProjectInfo } from '@box/schema/project/hot-schema';
import type { RuntimeMeshInfo } from '@box/build-system/project/bake';
import { isContentHash } from './content-hash';

/**
 * Lists library models that are about to be sent through the runtime mesh
 * builder. This boundary must never pass partial legacy entries through to
 * `migrateVoxel`.
 */
export function runtimeMeshAssets(meshAssets: ExtraProjectInfo['meshAssets']) {
  return Object.entries(meshAssets).filter(([, asset]) => isContentHash(asset.hash));
}

/**
 * Model names are encoded in mesh paths, but an entity's modelId is stable.
 * After a project model is renamed, resolve an entity's old path to the live
 * path only when that model id still points at an existing project asset.
 * A deleted model intentionally has no such live path and is not repaired.
 */
export function resolveRenamedProjectMesh(
  meshPath: string,
  modelId: number,
  meshAssets: ExtraProjectInfo['meshAssets'],
  meshIdSetCache: Record<number, RuntimeMeshInfo>,
): RuntimeMeshInfo | undefined {
  if (meshAssets[meshPath]) return undefined;
  const current = meshIdSetCache[modelId];
  return current && meshAssets[current.path] ? current : undefined;
}
