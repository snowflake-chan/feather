import ndarray from 'ndarray';
import getPixels from 'get-pixels';

// import fs = require('fs');
// import savePixels = require('save-pixels');

export interface NDArrayLikeImage {
  data: Uint8Array;
  shape: number[];
  stride: number[];
  offset: number;
}

export function alloc(w, h): NDArrayLikeImage {
  return ndarray(new Uint8Array(w * h * 4), [w, h, 4]);
}

export async function readPixels(imgPath: string) {
  return new Promise<NDArrayLikeImage | void>((resolve, reject) => {
    getPixels(imgPath, (err, data) => {
      if (err) {
        resolve(void 0);
      } else {
        resolve(<NDArrayLikeImage>data);
      }
    });
  });
}

export function writePixels(imgPath: string, pixels: NDArrayLikeImage) {
  // savePixels(pixels, 'png').pipe(fs.createWriteStream(imgPath));
}
