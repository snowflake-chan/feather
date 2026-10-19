import * as Mask from './masks';
import { TerrainSpec } from '.';

export function brokenPlanet(spec: TerrainSpec) {
  const { voxels, surfaceBlock, seed } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);
  const [l, mapH, w] = voxels.shape;

  const level1 = new Mask.CircleMask({
    voxels,
    center: [l / 2, w / 2],
    radius: Math.min(l, w) * 0.5,
    seed,
    baseBlock,
    surfaceBlock,
    mapH,
  });
  level1.noise.setSpec(75, 1, 0.2, 2.1, 2);

  const level2 = level1.copy();
  level2.noise.setSpec(50, 1, 0.2, 2.1, 16);
  level2.setIsland();

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      level1.draw([x, z], (h) => (h < 0.5 ? 0 : h + 20)) &&
        level2.draw([x, z], (h) => {
          if (h < 3) {
            return h + 49;
          } else if (h < 10) {
            return [h + 50, h + 50];
          } else {
            return 0;
          }
        });
    }
  }

  return voxels;
}
