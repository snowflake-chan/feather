export function resolveActiveSeedMeshId(
  meshTableFiles: readonly string[],
  activeMeshAssets: Readonly<Record<string, unknown>>,
  seedMesh: string,
) {
  if (!seedMesh || !activeMeshAssets[seedMesh]) {
    return -1;
  }
  return meshTableFiles.lastIndexOf(seedMesh);
}
