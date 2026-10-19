import ndarray from 'ndarray';
import grad from 'ndarray-gradient';
import ops from 'ndarray-ops';
import resample from 'ndarray-resample';

import { NDArrayLikeImage } from './pixels';

export function bumpDerivative(img) {
  const height = img.pick(-1, -1, 0);
  const dHeight = ndarray(new Float64Array(img.shape[0] * img.shape[1] * 2), [
    img.shape[0],
    img.shape[1],
    2,
  ]);
  grad(dHeight, height, 'wrap');
  ops.muls(dHeight, dHeight, 4);
  ops.adds(img.hi(-1, -1, 2), dHeight, 128);
  ops.assigns(img.lo(0, 0, 3), 255);
}

function upsampleImage(img: any, scale: number): any {
  const output = ndarray(
    new Float64Array(img.shape[0] * img.shape[1] * scale * scale),
    [img.shape[0] * scale, img.shape[1] * scale],
  );
  if (scale !== 1) {
    resample(output, img, 0, 255);
  } else {
    ops.assign(output, img);
  }
  return output;
}

function computeBumpGrad(img) {
  const height = img.pick(-1, -1, 0);
  const dHeight = ndarray(new Float64Array(img.shape[0] * img.shape[1] * 2), [
    img.shape[0],
    img.shape[1],
    2,
  ]);
  grad(dHeight, height, 'wrap');
  return dHeight;
}

function computeCavityMap(height) {
  const nx = height.shape[0];
  const ny = height.shape[1];
  const cavity = ndarray(new Float64Array(nx * ny), [nx, ny]);

  for (let i = 0; i < nx; ++i) {
    for (let j = 0; j < ny; ++j) {
      const c = height.get(i, j);
      let crease = 0;
      for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
          const h = height.get((i + dx + nx) % nx, (j + dy + ny) % ny);
          crease += Math.max(h - c, 0);
        }
      }
      cavity.set(i, j, 255 - crease / 8);
    }
  }

  return cavity;
}

export function computeBumpImage(
  img: NDArrayLikeImage,
  scaleFactor: number,
  heightScale: number,
) {
  const height = upsampleImage((<any>img).pick(-1, -1, 0), scaleFactor);
  const dHeight = computeBumpGrad(height);
  const cavity = computeCavityMap(height);

  const result = ndarray(
    new Uint8Array(height.shape[0] * height.shape[1] * 4),
    [height.shape[0], height.shape[1], 4],
  );

  const outHeight = result.pick(-1, -1, 0);
  const outGrad = result.lo(-1, -1, 1).hi(-1, -1, 2);
  const outCavity = result.pick(-1, -1, 3);

  ops.assign(outHeight, height);
  ops.adds(outGrad, dHeight, 128);
  ops.assign(outCavity, cavity);

  return result;
}
