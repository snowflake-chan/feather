import { TerrainSpec } from '.';

export function defaultTerrain(spec: TerrainSpec) {
  const voxels = spec.voxels;
  voxels
    .slice([0, 0, 0], [voxels.shape[0] - 1, 1, voxels.shape[2] - 1])
    .fill(spec.bottomBlock);
  voxels
    .slice([0, 1, 0], [voxels.shape[0] - 1, 8, voxels.shape[2] - 1])
    .fill(spec.baseBlock);
  voxels
    .slice([0, 8, 0], [voxels.shape[0] - 1, 9, voxels.shape[2] - 1])
    .fill(spec.surfaceBlock);
  return voxels;
}
