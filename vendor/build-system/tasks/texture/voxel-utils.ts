import ndarray from 'ndarray';
import getPixels from 'get-pixels';
import savePixels from 'save-pixels';
import { NDArrayLikeImage } from '../../utils/pixels';
import { BuildSystem } from '../../type';
import { BlockSoundGroup, BlockCategory } from '@box/schema/voxel/block-schema';

export const BLOCK_BUMP_SHIFT = 6;
export const BLOCK_BUMP_SIZE = 1 << BLOCK_BUMP_SHIFT;
export const BLOCK_COLOR_SHIFT = 4;
export const BLOCK_COLOR_SIZE = 1 << BLOCK_COLOR_SHIFT;

export const blankImage: NDArrayLikeImage = ndarray(
  new Uint8Array(BLOCK_COLOR_SIZE * BLOCK_COLOR_SIZE * 4),
  [BLOCK_COLOR_SIZE, BLOCK_COLOR_SIZE, 4],
);

export const blankBumpImage: NDArrayLikeImage = ndarray(
  new Uint8Array(BLOCK_BUMP_SIZE * BLOCK_BUMP_SIZE * 4),
  [64, 64, 4],
);

export class VoxelTextureInfo {
  public row = 0;
  public column = 0;
  public animLength = 1;

  public color: NDArrayLikeImage[] = [blankImage];
  public emissive: NDArrayLikeImage[] = [blankImage];
  public metalness: NDArrayLikeImage[] = [blankImage];
  public smoothness: NDArrayLikeImage[] = [blankImage];
  public bump: NDArrayLikeImage[] = [blankBumpImage];

  constructor(public id: number) {}
}

export class VoxelBlockInfo {
  public soundGroup: BlockSoundGroup;
  public category: BlockCategory;

  public emissive: number; // RGB packed integer

  // approximate face color
  public averageColor: number[] = [0, 0, 0];

  constructor(
    public id: number,
    public name: string,
    public textureId: number[],
    soundGroup: string,
    category: string,
    public transparent: boolean,
    emissive: number[],
    public friction: number,
    public mass: number,
    public restitution: number,
    public fluid: boolean,
    public fluidColor: number[],
    public fluidExtinction: number,
    public velocity: number[],
  ) {
    this.soundGroup = BlockSoundGroup[soundGroup] || BlockSoundGroup.default;
    this.category = BlockCategory[category] || BlockCategory.default;
    this.emissive =
      (emissive[0] & 0xf) |
      ((emissive[1] & 0xf) << 4) |
      ((emissive[2] & 0xf) << 8);
  }
}

export class VoxelAssetSpec {
  public blocks: VoxelBlockInfo[] = [];
  public textures: VoxelTextureInfo[] = [];

  // texture atlas resources
  public atlasShift = 0;
  public atlasRadius = 0;
  public colorAtlas: NDArrayLikeImage[] = [];
  public bumpAtlas: NDArrayLikeImage[] = [];
  public materialAtlas: NDArrayLikeImage[] = [];
}

export function storePixels(buildSystem: BuildSystem, image: NDArrayLikeImage) {
  return new Promise<string>((resolve, reject) => {
    const bufs: any[] = [];
    const stream = savePixels(image, 'png');
    // TODO: maybe this way is not good, just improve it
    stream.on('data', (d) => bufs.push(d));
    stream.on('error', reject);
    stream.on('end', async () => {
      resolve(buildSystem.storeContent(Buffer.concat(bufs)));
    });
  });
}

export async function storePixelsOpt(
  buildSystem: BuildSystem,
  image: NDArrayLikeImage,
) {
  return await buildSystem.build(
    'optimizePNG',
    await storePixels(buildSystem, image),
  );
}

export async function readPixels(buildSystem: BuildSystem, hash: string) {
  const data = await buildSystem.retrieveContent(hash);
  const type = getImageFormat(data);
  return new Promise<NDArrayLikeImage>((resolve, reject) => {
    getPixels(Buffer.from(data), type, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function getImageFormat(data: Uint8Array) {
  const intView = new Uint32Array(data.buffer, data.byteOffset, 4);
  const magic4 = intView[0];
  const magic2 = magic4 & 0xffff;
  if (magic4 === 0x474e5089) {
    return 'image/png';
  } else if (magic4 === 0x38464947) {
    return 'image/gif';
  } else if (magic2 === 0xd8ff) {
    return 'image/jpg';
  } else if (magic2 === 0x4d42) {
    return 'image/bmp';
  }
  return `unknown/${magic4.toString(16)}`;
}
