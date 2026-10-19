type ProjectMeshAsset = {
  modelId: number;
  hash: string;
  modelPreviewHash: string;
  animated: boolean;
};

const LOCAL_LIBRARY_MODEL_PATH = /__local_\d+\.vb$/;

export function projectModelNameFromPath(meshPath: string) {
  return meshPath.startsWith('mesh/') && meshPath.endsWith('.vb')
    ? meshPath.slice('mesh/'.length, -'.vb'.length)
    : meshPath;
}

export function findReusableProjectModel(
  meshAssets: Record<string, ProjectMeshAsset>,
  modelFileHash: string,
) {
  return Object.entries(meshAssets).find(
    ([meshPath, asset]) =>
      !LOCAL_LIBRARY_MODEL_PATH.test(meshPath) &&
      asset.hash === modelFileHash,
  );
}

export class AsyncSingleFlight<Key, Value> {
  private readonly pending = new Map<Key, Promise<Value>>();

  run(key: Key, operation: () => Promise<Value>): Promise<Value> {
    const existing = this.pending.get(key);
    if (existing) return existing;

    const promise = operation().finally(() => this.pending.delete(key));
    this.pending.set(key, promise);
    return promise;
  }
}
