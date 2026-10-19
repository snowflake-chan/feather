import * as Mask from './masks';
import { TerrainSpec } from '.';

export function fuji(spec: TerrainSpec) {
  const { voxels, surfaceBlock } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);
  const [l, mapH, w] = voxels.shape;

  const center: [number, number] = [l / 2, w / 2];
  const landMask = new Mask.CircleMask({
    voxels,
    center,
    radius: Math.min(l, w) * 0.5 + 10,
    seed: spec.seed,
    baseBlock,
    surfaceBlock,
    mapH,
  });
  landMask.noise.setSpec(30, 1, 0.3, 1.1, 4);
  landMask.setIsland();

  const mountainMask = new Mask.CircleMask({
    voxels,
    center,
    radius: Math.min(l, w) * 0.5 - 40,
    seed: spec.seed,
    baseBlock,
    surfaceBlock,
    mapH,
  });
  mountainMask.noise.setSpec(1, 2, 0.1, 0.1, 1);

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      // generate the base land
      const dist = landMask.dist([x, z]);
      mountainMask.draw([x, z], (mountain) => {
        let height = (mountain * 3000) / (dist + 15);
        height -= 27;
        if (height > 0) {
          return height;
        }
        return 0;
      }) ||
        landMask.draw([x, z], (land) => {
          if (land <= 1 && dist >= w / 2 - 20) {
            return 0;
          }
          return land;
        });
    }
  }

  return voxels;
}
