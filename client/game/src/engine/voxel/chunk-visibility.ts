import { ChunkVisibilityFlags } from './visibility-flags';
import { CHUNK_SIZE } from '@box/schema/voxel/voxel-collision-schema';

const N = (CHUNK_SIZE + 2) * (CHUNK_SIZE + 2);
const MASK = new Uint8Array(N);

const POS_U_POS_V = 1;
const NEG_U_POS_V = 2;
const POS_U_NEG_V = 4;
const NEG_U_NEG_V = 8;

const DU = 1;
const DV = CHUNK_SIZE + 2;
const OFFSET = DU + DV;

function sweepVisibility(
  data: (ptr: number) => number,
  offset: number,
  dStride: number,
  uStride: number,
  vStride: number,
  dFlag: number,
  uPosFlag: number,
  uNegFlag: number,
  vPosFlag: number,
  vNegFlag: number,
) {
  // clear mask buffer
  for (let ptr = 0, v = 0; v < CHUNK_SIZE + 2; ++v) {
    for (let u = 0; u < CHUNK_SIZE + 2; ++u) {
      MASK[ptr++] =
        u && v && u < CHUNK_SIZE + 1 && v < CHUNK_SIZE + 1 ? 0xff : 0;
    }
  }

  // sweep along cube
  let uPosVisible = false;
  let uNegVisible = false;
  let vPosVisible = false;
  let vNegVisible = false;
  let dVisible = false;
  for (let d = 0; d < CHUNK_SIZE; ++d) {
    // propagate mask along 4 directions
    dVisible = false;
    for (let v = 0; v < CHUNK_SIZE; ++v) {
      for (let u = 0; u < CHUNK_SIZE; ++u) {
        const maskPtr = OFFSET + u * DU + v * DV;
        if (data(offset + d * dStride + u * uStride + v * vStride) & 1) {
          MASK[maskPtr] = 0;
        } else {
          const f =
            MASK[maskPtr] |
            ((MASK[maskPtr - DU] | MASK[maskPtr - DV]) & NEG_U_NEG_V) |
            0xf0;
          MASK[maskPtr] = f;
          dVisible = dVisible || !!(f & 0xf);
        }
      }
      for (let u = CHUNK_SIZE - 1; u >= 0; --u) {
        const maskPtr = OFFSET + u * DU + v * DV;
        const m = MASK[maskPtr];
        MASK[maskPtr] =
          m |
          ((MASK[maskPtr + DU] | MASK[maskPtr - DV]) & (m >> 4) & POS_U_NEG_V);
      }
    }
    if (!dVisible) {
      break;
    }
    for (let v = CHUNK_SIZE - 1; v >= 0; --v) {
      for (let u = 0; u < CHUNK_SIZE; ++u) {
        const maskPtr = OFFSET + u * DU + v * DV;
        const m = MASK[maskPtr];
        MASK[maskPtr] =
          m |
          ((MASK[maskPtr + DV] | MASK[maskPtr - DU]) & (m >> 4) & NEG_U_POS_V);
      }
      for (let u = CHUNK_SIZE - 1; u >= 0; --u) {
        const maskPtr = OFFSET + u * DU + v * DV;
        const m = MASK[maskPtr];
        MASK[maskPtr] =
          m |
          ((MASK[maskPtr + DV] | MASK[maskPtr + DU]) & (m >> 4) & POS_U_POS_V);
      }
    }

    // update boundary visibility
    if (!uPosVisible) {
      for (let v = 0; v < CHUNK_SIZE; ++v) {
        const maskPtr = OFFSET + v * DV + (CHUNK_SIZE - 1) * DU;
        if (MASK[maskPtr] & 0xf) {
          uPosVisible = true;
          break;
        }
      }
    }
    if (!uNegVisible) {
      for (let v = 0; v < CHUNK_SIZE; ++v) {
        const maskPtr = OFFSET + v * DV;
        if (MASK[maskPtr] & 0xf) {
          uNegVisible = true;
          break;
        }
      }
    }
    if (!vPosVisible) {
      for (let u = 0; u < CHUNK_SIZE; ++u) {
        const maskPtr = OFFSET + u * DU + (CHUNK_SIZE - 1) * DV;
        if (MASK[maskPtr] & 0xf) {
          vPosVisible = true;
          break;
        }
      }
    }
    if (!vNegVisible) {
      for (let u = 0; u < CHUNK_SIZE; ++u) {
        const maskPtr = OFFSET + u * DU;
        if (MASK[maskPtr] & 0xf) {
          vNegVisible = true;
          break;
        }
      }
    }
  }

  return (
    (uPosVisible ? uPosFlag : 0) |
    (uNegVisible ? uNegFlag : 0) |
    (vPosVisible ? vPosFlag : 0) |
    (vNegVisible ? vNegFlag : 0) |
    (dVisible ? dFlag : 0)
  );
}

export class ChunkVisibilityTable {
  public posX = 0;
  public negX = 0;
  public posY = 0;
  public negY = 0;
  public posZ = 0;
  public negZ = 0;
}

export function chunkVisibility(
  out: ChunkVisibilityTable,
  data: (ptr: number) => number,
  offset: number,
  strideX: number,
  strideY: number,
  strideZ: number,
) {
  out.negZ = sweepVisibility(
    data,
    offset,
    strideZ,
    strideX,
    strideY,
    ChunkVisibilityFlags.POS_Z,
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.NEG_X,
    ChunkVisibilityFlags.POS_Y,
    ChunkVisibilityFlags.NEG_Y,
  );
  out.posZ = sweepVisibility(
    data,
    offset + strideZ * (CHUNK_SIZE - 1),
    -strideZ,
    strideX,
    strideY,
    ChunkVisibilityFlags.NEG_Z,
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.NEG_X,
    ChunkVisibilityFlags.POS_Y,
    ChunkVisibilityFlags.NEG_Y,
  );
  out.negY = sweepVisibility(
    data,
    offset,
    strideY,
    strideX,
    strideZ,
    ChunkVisibilityFlags.POS_Y,
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.NEG_X,
    ChunkVisibilityFlags.POS_Z,
    ChunkVisibilityFlags.NEG_Z,
  );
  out.posY = sweepVisibility(
    data,
    offset + strideY * (CHUNK_SIZE - 1),
    -strideY,
    strideX,
    strideZ,
    ChunkVisibilityFlags.NEG_Y,
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.NEG_X,
    ChunkVisibilityFlags.POS_Z,
    ChunkVisibilityFlags.NEG_Z,
  );
  out.negX = sweepVisibility(
    data,
    offset,
    strideX,
    strideZ,
    strideY,
    ChunkVisibilityFlags.POS_X,
    ChunkVisibilityFlags.POS_Z,
    ChunkVisibilityFlags.NEG_Z,
    ChunkVisibilityFlags.POS_Y,
    ChunkVisibilityFlags.NEG_Y,
  );
  out.posX =
    (out.negX & ChunkVisibilityFlags.POS_X ? ChunkVisibilityFlags.NEG_X : 0) |
    (out.posY & ChunkVisibilityFlags.POS_X ? ChunkVisibilityFlags.POS_Y : 0) |
    (out.negY & ChunkVisibilityFlags.POS_X ? ChunkVisibilityFlags.NEG_Y : 0) |
    (out.posZ & ChunkVisibilityFlags.POS_X ? ChunkVisibilityFlags.POS_Z : 0) |
    (out.negZ & ChunkVisibilityFlags.POS_X ? ChunkVisibilityFlags.NEG_Z : 0);
}
