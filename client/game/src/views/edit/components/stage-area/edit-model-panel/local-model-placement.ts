import type { TreeNode } from '@box/schema/project/project-rda';

export type PlacementMeshInfo = {
  modelId: number;
  formatName: string;
  defaultMotionId: string;
};

export function createProjectModelSeedReplacement(
  node: TreeNode,
  mesh: PlacementMeshInfo,
): TreeNode | undefined {
  if (!node.value) return;
  return {
    ...node,
    childrenIds: [...node.childrenIds],
    value: {
      ...node.value,
      mesh: mesh.formatName,
      meshId: mesh.modelId,
      defaultMotionId: mesh.defaultMotionId,
    },
  };
}

export class LocalProjectModelImportCache {
  private readonly imports = new Map<
    string,
    Promise<PlacementMeshInfo>
  >();

  resolve(
    key: string,
    importer: () => Promise<PlacementMeshInfo>,
  ): Promise<PlacementMeshInfo> {
    const existing = this.imports.get(key);
    if (existing) return existing;

    const pending: Promise<PlacementMeshInfo> = importer().finally(() => {
      // This is a single-flight cache, not a permanent model-path cache. A
      // later placement must ask the server again because the project copy
      // may have been renamed or deleted after the previous import finished.
      if (this.imports.get(key) === pending) this.imports.delete(key);
    });
    this.imports.set(key, pending);
    return pending;
  }
}

export async function placeLocalModelImmediately(options: {
  seedId: string;
  addSeed: () => void;
  resolveProjectMesh: () => Promise<PlacementMeshInfo>;
  updateSeed: (seedId: string, mesh: PlacementMeshInfo) => void;
  removeSeed: (seedId: string) => void;
}) {
  options.addSeed();
  try {
    const mesh = await options.resolveProjectMesh();
    options.updateSeed(options.seedId, mesh);
  } catch (error) {
    options.removeSeed(options.seedId);
    throw error;
  }
}
