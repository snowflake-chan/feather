import { TerrainSpec } from '.';
import { defaultTerrain } from './plane';

/** A neutral stone circuit; game mechanics remain entirely creator-defined. */
export function raceway(spec: TerrainSpec) {
  const { voxels, bottomBlock } = spec;
  defaultTerrain(spec);
  const [width, , depth] = voxels.shape;
  const centerX = (width - 1) / 2;
  const centerZ = (depth - 1) / 2;
  const outerX = Math.max(12, width * 0.42);
  const outerZ = Math.max(12, depth * 0.42);
  const innerX = Math.max(6, width * 0.24);
  const innerZ = Math.max(6, depth * 0.24);

  for (let x = 0; x < width; x++) {
    for (let z = 0; z < depth; z++) {
      const normalizedOuter = (x - centerX) ** 2 / outerX ** 2 + (z - centerZ) ** 2 / outerZ ** 2;
      const normalizedInner = (x - centerX) ** 2 / innerX ** 2 + (z - centerZ) ** 2 / innerZ ** 2;
      if (normalizedOuter <= 1 && normalizedInner >= 1) voxels.setVoxel(x, 9, z, bottomBlock);
    }
  }
  return voxels;
}
