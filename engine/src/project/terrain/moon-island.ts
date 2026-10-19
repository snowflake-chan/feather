import * as Mask from './masks';
import { TerrainSpec } from '.';

export function moonIsland(spec: TerrainSpec) {
  const { surfaceBlock, seed, voxels } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);

  const [l, h, w] = voxels.shape;

  // setup moon island
  const moonMask = new Mask.CircleMask({
    voxels,
    center: [l / 2, w / 2],
    radius: l / 2,
    baseBlock,
    surfaceBlock,
    seed,
    mapH: h,
  });
  moonMask.noise.setSpec(30, 1, 0.3, 1.1, 20);
  moonMask.setOuterEdgeNoise({
    scale: 10,
    frequency: 40,
  });

  // the higher level of moon island
  const moonMask2 = moonMask.copy();
  moonMask2.noise.setSpec(80, 1, 0.1, 1.5, 0);

  // setup waning part;
  const waningMask = new Mask.CircleMask({
    voxels,
    center: [l / 2 + moonMask.radius / 2, w / 2],
    radius: moonMask.radius / 2 + 20,
    baseBlock,
    surfaceBlock,
    mapH: h,
  });

  moonMask.innerRadius = waningMask.radius;
  moonMask.innerCenter = waningMask.center;
  moonMask.setInnerEdgeNoise({ scale: 70, frequency: 20 });

  // setup small islands
  const islandXRange = [l / 2, l];
  const islandZRange = [w / 2 - waningMask.radius, w / 2 + waningMask.radius];
  const islands: Mask.CircleMask[] = new Array(4);

  for (let i = 0; i < islands.length; i++) {
    islands[i] = new Mask.CircleMask({
      voxels,
      center: [
        getRandomInt(islandXRange[0], islandXRange[1]),
        getRandomInt(islandZRange[0], islandZRange[1]),
      ],
      radius: getRandomInt(8, 12),
      surfaceBlock,
      baseBlock,
      seed,
      mapH: h,
    });
    islands[i].noise.setSpec(30, 1, 0.3, 1.1, getRandomInt(4, 20));
  }

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      if (waningMask.inRange([x, z])) {
        for (let i = 0; i < islands.length; i++) {
          islands[i].draw([x, z]);
        }
      } else {
        moonMask2.draw([x, z], (dh) => {
          if (dh >= 0) {
            return 25 + dh;
          } else {
            return 0;
          }
        }) || moonMask.draw([x, z]);
      }
    }
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  return voxels;
}
