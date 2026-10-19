import { TerrainSpec } from '.';
import { CircleMask } from './masks';

export function volcano(spec: TerrainSpec) {
  const { voxels, surfaceBlock, seed } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);
  const [l, mapH, w] = voxels.shape;

  const grand = new CircleMask({
    surfaceBlock,
    baseBlock,
    voxels,
    center: [l / 2, w / 2],
    radius: Math.min(l, w) / 2,
    mapH,
    seed,
  });
  grand.noise.setSpec(41, 1, 0.1, 0.1, 4);
  grand.setOuterEdgeNoise({ scale: 10, frequency: 100 });

  const outerGrand = grand.copy();
  outerGrand.innerRadius = grand.radius - 25;
  outerGrand.noise.setSpec(30, 1, 0.5, 1, 3);

  const vol = grand.copy();
  vol.radius = grand.radius;
  vol.noise.setSpec(30, 1, 0.2, 1.7, 60);
  vol.setIsland(1.2);
  vol.setOuterEdgeNoise({ scale: 10, frequency: 100 });

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      grand.draw([x, z]) && outerGrand.draw([x, z]);
      vol.draw([x, z], (h) => {
        if (h > 45 || h < 1) {
          return 0;
        }
        return [h - 2, h];
      });
    }
  }

  return voxels;
}
