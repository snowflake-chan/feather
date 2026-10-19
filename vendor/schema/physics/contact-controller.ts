import {
  ContactIndex,
  BodyContactSchema,
  ContactRecord,
  VoxelContactSchema,
  compareBodyContact,
  compareVoxelContact,
  VoxelContact,
  BodyContact,
} from './physics-schema';
import { indexEq } from '@box/utils/id';

const CONTACT_TOLERANCE = 1e-3;

export function findContact(index: ContactIndex, id: number) {
  const idx = indexEq(index, id);
  if (idx < 0) {
    return null;
  }
  return index[idx];
}

export function addBodyContactRecordByAABBContact(
  record: ContactRecord,
  otherId: number,
  s: number,
  d: number,
  lambda: number,
  frictionU: number,
  frictionV: number,
) {
  const contact = BodyContactSchema.alloc();

  contact.otherId = otherId;
  const axis = s * (d + 1);
  switch (axis) {
    case -1:
      contact.nx = -1;
      contact.ny = 0;
      contact.nz = 0;
      break;
    case 1:
      contact.nx = 1;
      contact.ny = 0;
      contact.nz = 0;
      break;
    case -2:
      contact.nx = 0;
      contact.ny = -1;
      contact.nz = 0;
      break;
    case 2:
      contact.nx = 0;
      contact.ny = 1;
      contact.nz = 0;
      break;
    case -3:
      contact.nx = 0;
      contact.ny = 0;
      contact.nz = -1;
      break;
    case 3:
      contact.nx = 0;
      contact.ny = 0;
      contact.nz = 1;
      break;
  }

  if (d === 0) {
    contact.fx = lambda;
    contact.fy = frictionU;
    contact.fz = frictionV;
  } else if (d === 1) {
    contact.fx = frictionV;
    contact.fy = lambda;
    contact.fz = frictionU;
  } else {
    contact.fx = frictionU;
    contact.fy = frictionV;
    contact.fz = lambda;
  }

  record.body.push(contact);
}

export function addBodyContactRecord(
  record: ContactRecord,
  otherId: number,
  nx: number,
  ny: number,
  nz: number,
  fx: number,
  fy: number,
  fz: number,
) {
  const contact = BodyContactSchema.alloc();

  contact.otherId = otherId;

  contact.nx = nx;
  contact.ny = ny;
  contact.nz = nz;
  contact.fx = fx;
  contact.fy = fy;
  contact.fz = fz;

  record.body.push(contact);
}

export function addFluidContactRecord(
  record: ContactRecord,
  block: number,
  volume: number,
) {
  const fluidBlocks = record.fluidVoxels;
  const fluidVolume = record.fluidVolumeFraction;
  for (let i = 0; i < fluidBlocks.length; ++i) {
    const b = fluidBlocks[i];
    if (b > block) {
      continue;
    } else if (b === block) {
      fluidVolume[i] += volume;
    } else {
      fluidBlocks.splice(i, 0, block);
      fluidVolume.splice(i, 0, volume);
    }
    return;
  }
  fluidBlocks.push(block);
  fluidVolume.push(volume);
}

function compactBodyForce(body: BodyContact[]) {
  body.sort(compareBodyContact);
}

function voxelContactLevel(v: VoxelContact) {
  const axis = v.axis;
  if (axis === 1 || axis === -1) {
    return v.x;
  } else if (axis === 2 || axis === -2) {
    return v.y;
  } else {
    return v.z;
  }
}

// combine all voxel contacts at same level and average forces uniformly
/**
 * 地形碰撞时候会将部分地形合并为一个碰撞盒子，碰撞力也记录在这个整体碰撞盒子中的第一个地形中
 * 这个方法会将一个碰撞盒的碰撞力均匀的分到这个盒子包含的地形中去
 * @param voxel
 */
function compactVoxelContact(voxel: VoxelContact[]) {
  voxel.sort(compareVoxelContact);
  let count = 0;
  for (let ptr = 0; ptr < voxel.length; ) {
    const start = ptr++;
    const v0 = voxel[start];
    let fx = v0.fx;
    let fy = v0.fy;
    let fz = v0.fz;
    const axis = v0.axis;
    const level = voxelContactLevel(v0);
    while (ptr < voxel.length) {
      const v1 = voxel[ptr];
      if (v1.axis !== axis || voxelContactLevel(v1) !== level) {
        break;
      }
      fx += v1.fx;
      fy += v1.fy;
      fz += v1.fz;
      ++ptr;
    }
    if (
      Math.abs(fx) > CONTACT_TOLERANCE ||
      Math.abs(fy) > CONTACT_TOLERANCE ||
      Math.abs(fz) > CONTACT_TOLERANCE
    ) {
      const n = ptr - start;
      fx /= n;
      fy /= n;
      fz /= n;
      for (let i = start; i < ptr; ++i) {
        const v = voxel[i];
        v.fx = fx;
        v.fy = fy;
        v.fz = fz;
        VoxelContactSchema.assign(voxel[count++], v);
      }
    }
  }
  for (let i = count; i < voxel.length; ++i) {
    VoxelContactSchema.free(voxel[i]);
  }
  voxel.length = count;
}

export function compactContactIndex(contact: ContactIndex) {
  for (let i = 0; i < contact.length; ++i) {
    const record = contact[i];
    compactBodyForce(record.body);
    compactVoxelContact(record.voxel);
  }
}
