import { VERTEX_SIZE } from './voxel-mesher';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';
import { initArray } from '../utils/init-array';

const FACE_SIZE = 4 * VERTEX_SIZE;
const FACE_OFFSET = 3;
const MESH_SIZE = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE * 6;

const FACE_LODS = initArray(MESH_SIZE, () => 0);

function ctz16(x: number) {
  const v = x & -x;
  let c = 0;
  if (v) {
    c++;
  }
  if (v & 0x33333333) {
    c += 2;
  }
  if (v & 0x55555555) {
    c += 1;
  }
  return c;
}

function calcLOD(f: number, x: number, y: number, z: number) {
  const d = f >>> 1;
  return d === 0 ? ctz16(y | z) : ctz16(x | (d === 1 ? z : y));
}

function calcMeshLOD(mesh: Uint8Array, offset: number) {
  const x = Math.min(mesh[offset], mesh[offset + VERTEX_SIZE * 2]);
  const y = Math.min(mesh[offset + 1], mesh[offset + 1 + VERTEX_SIZE * 2]);
  const z = Math.min(mesh[offset + 2], mesh[offset + 2 + VERTEX_SIZE * 2]);
  return calcLOD(mesh[offset + 3], x, y, z);
}

// sort faces by level of detail.  store counts in prefixes
function bucketSortLOD(mesh: Uint8Array, prefixes: number[]) {
  for (let i = 0, k = 0; i < mesh.length; i += FACE_SIZE, k++) {
    const lod = (FACE_LODS[k] = calcMeshLOD(mesh, i));
    prefixes[lod] += 1;
  }

  let t = 0;
  for (let i = 0; i < prefixes.length; ++i) {
    const u = prefixes[i];
    prefixes[i] = FACE_SIZE * t;
    t += u;
  }

  for (let i = mesh.length - FACE_SIZE; i >= 0; i -= FACE_SIZE) {
    while (true) {
      const lodPtr = (i / FACE_SIZE) | 0;

      const lod = FACE_LODS[lodPtr];
      const prefixPtr = prefixes[lod];
      if (i < prefixPtr) {
        break;
      }
      for (let j = 0; j < FACE_SIZE; ++j) {
        const k = mesh[i + j];
        mesh[i + j] = mesh[prefixPtr + j];
        mesh[prefixPtr + j] = k;
      }

      const prefixLodPtr = (prefixPtr / FACE_SIZE) | 0;
      FACE_LODS[lodPtr] = FACE_LODS[prefixLodPtr];
      FACE_LODS[prefixLodPtr] = lod;

      prefixes[lod] += FACE_SIZE;
    }
  }
}

const SQUASH_STRIDE = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE;
const SQUASH_INDEX = new Array(6 * SQUASH_STRIDE);
for (let i = 0; i < SQUASH_INDEX.length; ++i) {
  SQUASH_INDEX[i] = -1;
}

function squashFaces(mesh: Uint8Array, prefixes: number[]) {
  // clear squash index
  for (let i = 0; i < SQUASH_INDEX.length; ++i) {
    SQUASH_INDEX[i] = -1;
  }

  let ptr = 0;
  for (let i = 0; i < prefixes.length - 1; ++i) {
    const shift = 4 - i;
    const mask = (1 << shift) - 1;
    const head = ptr;
    const tail = prefixes[i];
    for (let j = ptr; j < tail; j += FACE_SIZE) {
      const f = mesh[j + FACE_OFFSET];
      const x = Math.max(mesh[j], mesh[j + 3 * VERTEX_SIZE]);
      const y = Math.max(mesh[j + 1], mesh[j + 3 * VERTEX_SIZE + 1]);
      const z = Math.max(mesh[j + 2], mesh[j + 3 * VERTEX_SIZE + 2]);

      const xi = (x + mask) >>> shift;
      const yi = (y + mask) >>> shift;
      const zi = (z + mask) >>> shift;

      const index =
        SQUASH_STRIDE * f + xi + (yi << (i + 1)) + (zi << (2 * (i + 1)));
      const predIndex = SQUASH_INDEX[index];
      if (predIndex < head) {
        SQUASH_INDEX[index] = ptr;
        for (let k = 0; k < FACE_SIZE; ++k) {
          const t = mesh[ptr];
          mesh[ptr] = mesh[j + k];
          mesh[j + k] = t;
          ptr += 1;
        }
      } else {
        // FIXME: should compare the index of face
      }
    }
    prefixes[i] = ptr;
  }
}

export function calculateLOD(mesh: Uint8Array) {
  const prefixes = [0, 0, 0, 0, 0, 0];
  bucketSortLOD(mesh, prefixes);
  squashFaces(mesh, prefixes);
  for (let i = 0; i < prefixes.length; ++i) {
    prefixes[i] = Math.floor((6 * prefixes[i]) / FACE_SIZE);
  }
  return prefixes;
}
