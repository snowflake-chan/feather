// FIXME: switch this to use squoosh

import { BuildSystem } from '../type';
import { Hash } from '@box/content-server';
import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import ndarray from 'ndarray';
import interp from 'ndarray-linear-interpolate';
import * as http from 'http';
import * as https from 'https';
let sharp;
if (typeof window === 'undefined') {
  sharp = require('sharp');
}

const MINIMAGELENGTH = 10;
const CHECKLENGTH = 8;
const RETRIEVE_TIMEOUT = 2000;

function typeCheck(data: Uint8Array): string {
  const typeTable = {
    jpg: [0xff, 0xd8], // see struct detail in wikipidia
    png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // stand for png
    gif: [0x47, 0x49, 0x46, 0x38], // stand for gif
    bmp: [0x42, 0x4d], // stand for bm
    svg: [0x3c, 0x3f, 0x78, 0x6d], // stand for xml
    webp: [0x52, 0x49, 0x46, 0x46], // stand for riff
  };
  const startWith = Buffer.from(data).slice(0, CHECKLENGTH);

  for (const type in typeTable) {
    let flag = true;
    for (let i = 0; i < typeTable[type].length; i++) {
      if (startWith[i] !== typeTable[type][i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      return type;
    }
  }
  return 'unknow';
}

function loadPixels(data: Uint8Array): Promise<[any, string]> {
  const type = typeCheck(data);
  if (!['png', 'jpg', 'bmp', 'gif'].includes(type)) {
    throw new Error('TYPE NOT SUPPORTED!');
  }
  return new Promise((resolve, reject) => {
    getPixels(Buffer.from(data), 'image/' + type, (error, genPixels) => {
      if (error) {
        reject(error);
      } else {
        resolve([genPixels, type]);
      }
    });
  });
}

function savePixelsPromise(pixels: any, type: string): Promise<Uint8Array> {
  const imgStream = savePixels(pixels, type);
  return new Promise((resolve, reject) => {
    const temp: Buffer[] = [];
    imgStream.on('error', reject);
    imgStream.on('data', (streamData: Buffer) => {
      temp.push(streamData);
    });
    imgStream.on('end', () => {
      resolve(Uint8Array.from(Buffer.concat(temp)));
    });
  });
}

async function loadPixelsHash(bs: BuildSystem, hash: Hash) {
  const pureHash = hash.match(/^(.*?)(\..*?)?$/)![1];
  const imgData = await bs.retrieveContent(pureHash);
  return await loadPixels(imgData);
}

async function savePixelsHash(bs: BuildSystem, image: any, type: string) {
  return await bs.storeContent(await savePixelsPromise(image, type));
}

async function thumbnailProcess(
  data: Uint8Array,
  size: number,
): Promise<Uint8Array> {
  if (typeof window !== 'undefined') {
    return thumbnailProcessWithGetPixels(data, size);
  } else {
    return thumbnailProcessWithSharp(data, size);
  }
}

async function thumbnailProcessWithGetPixels(
  data: Uint8Array,
  size: number,
): Promise<Uint8Array> {
  let [pixels, type] = await loadPixels(data);
  if (type === 'gif') {
    pixels = pixels.pick(0, null, null, null);
    type = 'jpg';
  }
  const maxSquareLength = Math.min(pixels.shape[0], pixels.shape[1]);
  if (size > Math.max(pixels.shape[0], pixels.shape[1])) {
    return await savePixelsPromise(pixels, type);
  }
  if (size > maxSquareLength) {
    return await savePixelsPromise(
      pixels
        .lo(
          (pixels.shape[0] - maxSquareLength) / 2,
          (pixels.shape[1] - maxSquareLength) / 2,
        )
        .hi(Math.min(size, pixels.shape[0]), Math.min(size, pixels.shape[1])),
      type,
    );
  }
  const stepLength = Math.floor(maxSquareLength / size);
  const squareLength = stepLength * size;
  return await savePixelsPromise(
    pixels
      .lo(
        (pixels.shape[0] - squareLength) / 2,
        (pixels.shape[1] - squareLength) / 2,
      )
      .hi(squareLength, squareLength)
      .step(stepLength, stepLength),
    type,
  );
}

async function thumbnailProcessWithSharp(
  data: Uint8Array,
  size: number,
): Promise<Uint8Array> {
  const imageData = sharp(Buffer.from(data));
  const metadata = await imageData.metadata();
  let result;
  if (metadata.width < size && metadata.height < size) {
    result = await imageData.png().toBuffer();
  } else {
    result = await imageData
      .resize({
        width: size,
        height: size,
      })
      .png()
      .toBuffer();
  }
  return Uint8Array.from(result);
}

export async function genThumbnail(bs: BuildSystem, hash: Hash, size: number) {
  if (hash === '') {
    return hash;
  }
  const pureHash = hash.match(/^(.*?)(\..*?)?$/)![1];
  const imgData = await new Promise<Uint8Array>((resolve, reject) => {
    bs.retrieveContent(pureHash).then(resolve).catch(reject);
    setTimeout(() => {
      reject('Connection Error');
    }, RETRIEVE_TIMEOUT);
  });
  if (imgData.length < MINIMAGELENGTH) {
    return pureHash;
  }
  try {
    const result = await thumbnailProcess(imgData, size);
    return await bs.storeContent(result);
  } catch (e) {
    return pureHash;
  }
}

export async function optimizeAvatar(
  bs: BuildSystem,
  url: string,
  size: number,
) {
  const imgData = Uint8Array.from(
    await new Promise((resolve, reject) => {
      try {
        const req = url.match('https') ? https : http;
        req
          .get(encodeURI(url), (res) => {
            const chunkList: any[] = [];
            res.on('error', (e) => {
              reject(e);
            });
            res.on('data', (chunk) => {
              chunkList.push(chunk);
            });
            res.on('end', () => {
              resolve(Buffer.concat(chunkList));
            });
          })
          .on('error', (e) => {
            reject(e);
          });
      } catch (e) {
        reject(e);
      }
    }),
  );
  if (imgData.length < MINIMAGELENGTH) {
    throw new Error('wrong url');
  }
  try {
    const result = await thumbnailProcess(imgData, size);
    return await bs.storeContent(result);
  } catch (e) {
    if (e.message === 'TYPE NOT SUPPORTED!' && typeCheck(imgData) === 'webp') {
      return await bs.storeContent(imgData);
    }
    throw e;
  }
}

// apply a color lut to an image
export async function applyLUT(
  bs: BuildSystem,
  imageHash: Hash,
  lutHash: Hash,
) {
  if (imageHash === '' || lutHash === '') {
    return imageHash;
  }
  const [[imagePixels], [lutPixels]] = await Promise.all([
    loadPixelsHash(bs, imageHash),
    loadPixelsHash(bs, lutHash),
  ]);
  if (
    lutPixels.shape[0] < 256 ||
    lutPixels.shape[1] < 16 ||
    lutPixels.shape[2] < 3
  ) {
    throw new Error('invalid color LUT');
  }
  const out = ndarray(
    new Uint8Array(imagePixels.data.length),
    imagePixels.shape,
    imagePixels.stride,
    imagePixels.offset,
  );
  const lut3D = ndarray(
    lutPixels.data,
    [16, 16, 16, 3],
    [
      lutPixels.stride[0],
      lutPixels.stride[1],
      lutPixels.stride[0] * 16,
      lutPixels.stride[2],
    ],
    lutPixels.offset,
  );
  const lutR = lut3D.pick(null, null, null, 0);
  const lutG = lut3D.pick(null, null, null, 1);
  const lutB = lut3D.pick(null, null, null, 2);
  for (let i = 0; i < imagePixels.shape[0]; ++i) {
    for (let j = 0; j < imagePixels.shape[1]; ++j) {
      const r = imagePixels.get(i, j, 0) / 16;
      const g = imagePixels.get(i, j, 1) / 16;
      const b = imagePixels.get(i, j, 2) / 16;
      out.set(i, j, 0, interp.d3(lutR, r, g, b));
      out.set(i, j, 1, interp.d3(lutG, r, g, b));
      out.set(i, j, 2, interp.d3(lutB, r, g, b));
      out.set(i, j, 3, 255);
    }
  }
  return await savePixelsHash(bs, out, 'png');
}

export async function applyLutDir(
  bs: BuildSystem,
  previewImage: Hash,
  luts: Hash,
  mergeDirs?: boolean,
) {
  const lutDir = await bs.retrieveJSON(luts);
  const result: any = {};
  await Promise.all(
    Object.keys(lutDir).map(async (lut) => {
      if (lut === '.') {
        return;
      }
      if (mergeDirs) {
        const base = lut.replace('.png', '');
        result[base + '.lut.preview'] = await bs.build(
          'applyLUT',
          previewImage,
          lutDir[lut],
        );
        result[base + '.lut'] = lutDir[lut];
      } else {
        result[lut] = await bs.build('applyLUT', previewImage, lutDir[lut]);
      }
    }),
  );
  return await bs.storeJSON(result);
}
