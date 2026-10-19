import { BlockInfo, BlockIndex } from './block-schema';

function fillAndZero(x: number[], count: number) {
  x.length = 0;
  for (let i = 0; i < count; ++i) {
    x.push(0);
  }
}

export function unpackBlockIndex(blockInfo: BlockInfo, outIndex: BlockIndex) {
  // first calculate max id
  let maxId = 0;
  for (let i = 0; i < blockInfo.ids.length; ++i) {
    maxId = Math.max(blockInfo.ids[i], maxId);
  }

  // reset tables
  fillAndZero(outIndex.fluid, maxId);
  fillAndZero(outIndex.mass, maxId);
  fillAndZero(outIndex.friction, maxId);
  fillAndZero(outIndex.restitution, maxId);
  fillAndZero(outIndex.texture, 6 * maxId);
  fillAndZero(outIndex.emissive, maxId);
  fillAndZero(outIndex.velocity, 3 * maxId);
  outIndex.name.length = 0;
  outIndex.valid.length = 0;
  for (let i = 0; i < maxId; ++i) {
    outIndex.name.push('');
    outIndex.valid.push(false);
  }
  outIndex.fluidInfo.length = 0;
  outIndex.id = {};

  // populate index
  for (let i = 0; i < blockInfo.ids.length; ++i) {
    const id = blockInfo.ids[i];
    const name = blockInfo.names[i];
    outIndex.id[name] = id;
    outIndex.name[id] = name;
    outIndex.valid[id] = true;
    outIndex.emissive[id] = blockInfo.emissive[i];
    outIndex.restitution[id] = blockInfo.restitution[i];
    outIndex.friction[id] = blockInfo.friction[i];
    for (let j = 0; j < 6; ++j) {
      outIndex.texture[6 * id + j] =
        blockInfo.texture[6 * i + j] | (blockInfo.animLength[6 * i + j] << 24);
    }
    for (let j = 0; j < 3; ++j) {
      outIndex.velocity[3 * id + j] = blockInfo.velocity[3 * i + j];
    }
  }

  // update fluid index
  if (!outIndex.isFluid) {
    outIndex.isFluid = new Uint8Array(0xfff);
  }
  for (let i = 0; i < 0xfff; ++i) {
    outIndex.isFluid[i] = 0;
  }

  // fluid index
  outIndex.fluidInfo.push(0);
  for (let i = 0; i < blockInfo.fluids.length; ++i) {
    const { id, info, mass } = blockInfo.fluids[i];
    outIndex.fluid[id] = i + 1;
    outIndex.fluidInfo.push(info);
    outIndex.mass[id] = mass;
    outIndex.isFluid[id] = 1;
  }
}
