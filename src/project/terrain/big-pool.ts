import * as Mask from './masks';
import { TerrainSpec } from '.';

export function bigPool(spec: TerrainSpec) {
  const { voxels, surfaceBlock } = spec;
  const baseBlock = spec.baseBlock;

  voxels.fill(0);
  const [l, h, w] = voxels.shape;

  const center: [number, number] = [l / 2, w / 2];

  const waterCircle = new Mask.CircleMask({
    voxels,
    center,
    radius: l * 0.5 - 30,
    baseBlock: spec.waterBlock,
    bottomBlock: baseBlock,
    mapH: h,
  });
  const landCircle = new Mask.CircleMask({
    voxels,
    center,
    radius: l * 0.5,
    surfaceBlock,
    baseBlock,
    seed: spec.seed,
    mapH: h,
    innerRadius: waterCircle.radius - 15,
  });
  landCircle.noise.setSpec(10, 1, 2.4, 0.13, 48);
  landCircle.setInnerEdgeNoise({ scale: 5, frequency: 30 });

  const waterHeight = 30;

  for (let x = 0; x < l; x++) {
    for (let z = 0; z < w; z++) {
      waterCircle.draw([x, z], () => waterHeight);
      landCircle.draw([x, z]);
    }
  }

  return voxels;
}
