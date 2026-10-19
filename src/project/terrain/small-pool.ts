import { TerrainSpec } from '.';
import { CircleMask } from './masks';

export function smallPool(spec: TerrainSpec) {
  const { voxels, surfaceBlock, seed } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);
  const [l, mapH, w] = voxels.shape;

  const baseHeight = 40;

  const water = new CircleMask({
    voxels,
    center: [l / 3, w / 3],
    radius: 40,
    baseBlock: spec.waterBlock,
    bottomBlock: baseBlock,
    mapH,
    seed,
  });
  water.setOuterEdgeNoise({ scale: 12, frequency: 22 });

  const land = new CircleMask({
    voxels,
    center: [l / 2, w / 2],
    radius: Math.min(l, w) / 2,
    mapH,
    baseBlock,
    surfaceBlock,
    seed,
  });
  land.noise.setSpec(60, 1, 0.3, 1, baseHeight + 10);
  land.setOuterEdgeNoise({ scale: 8, frequency: 90 });
  land.setFloatIsland(2.5, 80);

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      water.draw([x, z], () => baseHeight) ||
        land.draw([x, z], (h) => {
          if (h < 50) {
            return h;
          }
          if (h < 52) {
            return h + 5;
          }
          if (h < 55) {
            return h + 8;
          }
          if (h > 58) {
            return 68;
          }
          return h + 9;
        });
    }
  }

  return voxels;
}
