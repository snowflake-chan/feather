import ndarray from 'ndarray';
import { NDArrayLikeImage } from '../../utils/pixels';
import {
  BLOCK_BUMP_SHIFT,
  BLOCK_COLOR_SHIFT,
  VoxelTextureInfo,
  blankBumpImage,
  blankImage,
  VoxelAssetSpec,
  VoxelBlockInfo,
  readPixels,
  storePixelsOpt,
} from './voxel-utils';
import { BuildSystem } from '../../build-system';
import { computeAtlas } from './voxel-atlas';
import {
  BlockInfoSchema,
  BlockSoundGroup,
  BlockCategory,
} from '@box/schema/voxel/block-schema';

export async function buildBlocks(
  bs: BuildSystem,
  blockSpecHash: string,
  voxelsIndexHash: string,
) {
  const data = await readVoxelData(bs, blockSpecHash, voxelsIndexHash);
  computeAtlas(data);
  const blockInfoHash = await saveVoxelData(bs, data);
  const blockInfo = await bs.retrieveBinarySchema(
    BlockInfoSchema,
    blockInfoHash,
  );
  return await bs.storeJSON({
    blockInfo: blockInfoHash,
    textures: blockInfo.bumpAtlas
      .concat(blockInfo.colorAtlas)
      .concat(blockInfo.materialAtlas),
  });
}

// input block spec from JSON
interface BlockSpec {
  id: number;
  texture: string[];
  soundGroup: keyof BlockSoundGroup;
  transparent: boolean;
  color: number[];
  emissive: number[];
  friction: number;
  mass: number;
  restitution: number;
  category: keyof BlockCategory;
  fluid: boolean;
  fluidColor: number[];
  fluidExtinction: number;
  velocity?: number[];
}

interface BlockData {
  [name: string]: BlockSpec;
}

async function readVoxelData(
  buildSystem: BuildSystem,
  blockSpecHash: string,
  voxelsIndexHash: string,
) {
  const [blockSData, voxelsIndex]: [BlockData, any] = (await Promise.all([
    buildSystem.retrieveJSON(blockSpecHash),
    buildSystem.retrieveJSON(voxelsIndexHash),
  ])) as any;
  const readVoxel = async (texPath: string) => {
    const parts = texPath.split('/');
    let dir = voxelsIndex;
    for (let i = 0; i < parts.length; ++i) {
      if (parts[i].length > 0) {
        dir = dir[parts[i]];
      }
    }
    if (typeof dir !== 'string') {
      return null;
    }
    return readPixels(buildSystem, dir);
  };

  async function readTexture(texture: VoxelTextureInfo, texPath: string[]) {
    const [color, bump, emissive, metalness, smoothness] = await Promise.all([
      Promise.all(
        texPath.map(async (tex) => (await readVoxel(tex)) || blankImage),
      ),
      Promise.all(
        texPath.map(
          async (tex) => (await readVoxel(tex + '_bump')) || blankBumpImage,
        ),
      ),
      Promise.all(
        texPath.map(
          async (tex) => (await readVoxel(tex + '_emissive')) || blankImage,
        ),
      ),
      Promise.all(
        texPath.map(
          async (tex) => (await readVoxel(tex + '_metalness')) || blankImage,
        ),
      ),
      Promise.all(
        texPath.map(
          async (tex) => (await readVoxel(tex + '_smoothness')) || blankImage,
        ),
      ),
    ]);
    texture.color = color;
    texture.bump = bump;
    texture.emissive = emissive;
    texture.metalness = metalness;
    texture.smoothness = smoothness;
    texture.animLength = texPath.length;
  }

  let maxId = 0;
  const idList: number[] = [];

  // reassign voxel ids so first bit encodes transparent flag
  Object.keys(blockSData).forEach((id) => {
    const spec = blockSData[id];
    spec.id = (spec.id << 1) | (spec.transparent ? 0 : 1);
    idList.push(spec.id);
    maxId = Math.max(maxId, spec.id);
  });

  idList.sort((a, b) => a - b);
  for (let i = 1; i < idList.length; ++i) {
    if (idList[i - 1] === idList[i]) {
      throw new Error('duplicate id');
    }
  }

  const blockIds = Object.keys(blockSData);
  blockIds.sort((a, b) => blockSData[a].id - blockSData[b].id);

  const result = new VoxelAssetSpec();
  const textureIds: { [id: string]: number } = {};
  async function getTextureId(paths: string[]) {
    const id = paths.join(';');
    if (id in textureIds) {
      return textureIds[id];
    }
    const texture = new VoxelTextureInfo(result.textures.length);
    textureIds[id] = texture.id;
    result.textures.push(texture);
    await readTexture(texture, paths);
    return textureIds[id];
  }

  result.blocks = await Promise.all(
    blockIds.map(async (name) => {
      const block = blockSData[name];
      const texIds: number[] = block.fluid
        ? [0, 0, 0, 0, 0, 0]
        : await Promise.all(
            block.texture.map((tex) => {
              if (Array.isArray(tex)) {
                return getTextureId(tex);
              }
              return getTextureId([tex]);
            }),
          );
      return new VoxelBlockInfo(
        block.id,
        name,
        texIds,
        block.soundGroup,
        block.category,
        !!block.transparent,
        block.emissive,
        +block.friction,
        +block.mass,
        +block.restitution || 0,
        !!block.fluid,
        block.fluidColor || [0, 0, 0],
        +block.fluidExtinction || 0,
        block.velocity || [0, 0, 0],
      );
    }),
  );

  result.blocks.sort((a, b) => a.id - b.id);

  return result;
}

async function saveVoxelData(buildSystem: BuildSystem, voxels: VoxelAssetSpec) {
  async function saveMipMap(mipmap: NDArrayLikeImage[]) {
    const hashes = await Promise.all(
      mipmap.map(({ data, shape }) =>
        storePixelsOpt(
          buildSystem,
          ndarray(data, [shape[0] * shape[2], shape[1] * shape[3], shape[4]]),
        ),
      ),
    );
    return hashes.map((h) => h + '.png');
  }

  const [
    colorAtlas,
    bumpAtlas,
    materialAtlas,
    // thumbnail,
  ] = await Promise.all([
    saveMipMap(voxels.colorAtlas),
    saveMipMap(voxels.bumpAtlas),
    saveMipMap(voxels.materialAtlas),
    // storePixelsOpt(buildSystem, <any>voxels.thumbnails),
  ]);

  const result = BlockInfoSchema.clone(BlockInfoSchema.identity);

  // copy texture info
  result.colorAtlas = colorAtlas;
  result.bumpAtlas = bumpAtlas;
  result.materialAtlas = materialAtlas;
  result.blockBumpShift = BLOCK_BUMP_SHIFT;
  result.blockColorShift = BLOCK_COLOR_SHIFT;
  result.atlasRadius = voxels.atlasRadius;

  // copy blocks
  voxels.blocks.sort((a, b) => a.id - b.id);
  voxels.blocks.forEach((block) => {
    if (!block.id) {
      return;
    }

    result.ids.push(block.id);
    result.restitution.push(block.restitution);
    result.friction.push(block.friction);
    result.names.push(block.name);
    result.emissive.push(block.emissive);
    for (let i = 0; i < 6; ++i) {
      const id = block.textureId[i];
      const index = voxels.textures[id];
      result.texture.push(index.column + (index.row << 8));
      result.animLength.push(index.animLength);
    }
    const category = block.category;
    if (category in result.category) {
      result.category[category].push(block.id);
    } else {
      result.category[category] = [block.id];
    }
    result.velocity.push(
      +block.velocity[0] || 0,
      +block.velocity[1] || 0,
      +block.velocity[2] || 0,
    );

    if (block.fluid) {
      result.fluids.push({
        id: block.id,
        mass: block.mass,
        info:
          (Math.floor(255 * block.fluidColor[0]) +
            (Math.floor(255 * block.fluidColor[1]) << 8) +
            (Math.floor(255 * block.fluidColor[2]) << 16) +
            (Math.floor(255 * block.fluidExtinction) << 24)) >>>
          0,
      });
    }
  });

  return await buildSystem.storeBinarySchema(BlockInfoSchema, result);
}
