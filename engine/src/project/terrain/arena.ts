import { TerrainSpec } from '.';
import { defaultTerrain } from './plane';

/** A compact, immediately playable block-out for combat-style maps. */
export function arena(spec: TerrainSpec) {
  const { voxels, baseBlock, bottomBlock } = spec;
  defaultTerrain(spec);
  const [width, height, depth] = voxels.shape;
  const inset = Math.max(8, Math.floor(Math.min(width, depth) * 0.08));
  const wallHeight = Math.min(15, Math.max(6, Math.floor(height * 0.12)));

  for (let y = 9; y < 9 + wallHeight; y++) {
    for (let x = inset; x < width - inset; x++) {
      voxels.setVoxel(x, y, inset, bottomBlock);
      voxels.setVoxel(x, y, depth - inset - 1, bottomBlock);
    }
    for (let z = inset; z < depth - inset; z++) {
      voxels.setVoxel(inset, y, z, bottomBlock);
      voxels.setVoxel(width - inset - 1, y, z, bottomBlock);
    }
  }

  // Four low cover blocks make the template useful before any custom assets
  // are imported, without imposing a game mode or scripts on the author.
  const coverSize = Math.max(4, Math.floor(Math.min(width, depth) / 18));
  const coverHeight = Math.min(6, Math.max(3, Math.floor(height / 20)));
  for (const [centerX, centerZ] of [
    [Math.floor(width * 0.32), Math.floor(depth * 0.32)],
    [Math.floor(width * 0.68), Math.floor(depth * 0.32)],
    [Math.floor(width * 0.32), Math.floor(depth * 0.68)],
    [Math.floor(width * 0.68), Math.floor(depth * 0.68)],
  ]) {
    for (let x = centerX - coverSize; x <= centerX + coverSize; x++) {
      for (let z = centerZ - coverSize; z <= centerZ + coverSize; z++) {
        for (let y = 9; y < 9 + coverHeight; y++) voxels.setVoxel(x, y, z, baseBlock);
      }
    }
  }
  return voxels;
}
