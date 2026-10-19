/**
 * 此文件从game/src/engin/mesh中搬运过来
 * game之后大概不需要用到这个decoder了
 * 但数据迁移要，就直接搬运了
 */

import { MuReadStream } from '@box/mudb/stream';

// material tables
const MAX_MATERIAL_COUNT = 256;
const RGB_TABLE = new Array(MAX_MATERIAL_COUNT);
const PBR_TABLE = new Array(MAX_MATERIAL_COUNT);
for (let i = 0; i < MAX_MATERIAL_COUNT; ++i) {
  RGB_TABLE[i] = PBR_TABLE[i] = 0;
}

const FACE_VERTS = 4;
const VERT_SIZE = 3;
const PTR_STEP = FACE_VERTS * VERT_SIZE;

// slice info  (stores: [normal, z, count])
const SLICE_INFO: number[] = [];

// FIXME: assume little-endian (intel)
function endianByteShift(x: number) {
  return (x * 8) >>> 0;
}

// helper method to pack 4 bytes into a single 32-bit word in correct endian order
const S0 = endianByteShift(0);
const S1 = endianByteShift(1);
const S2 = endianByteShift(2);
const S3 = endianByteShift(3);
function packWord(b0: number, b1: number, b2: number, b3: number) {
  return (
    (((b0 << S0) >>> 0) |
      ((b1 << S1) >>> 0) |
      ((b2 << S2) >>> 0) |
      ((b3 << S3) >>> 0)) >>>
    0
  );
}

const AO_TABLE = [
  (0 << S3) >>> 0,
  (153 << S3) >>> 0,
  (204 << S3) >>> 0,
  (255 << S3) >>> 0,
];

export function fastMeshDecoder(inp: MuReadStream) {
  // FIXME: do we really need to put this flag in the mesh data?
  const flag = inp.readInt32();
  if (flag !== -11) {
    return null;
  }

  // read in buffer sizes
  const surfaceCount = inp.readVarint();
  const materialCount = inp.readVarint();
  const sliceInfoCount = inp.readVarint();

  // initialize material tables
  // FIXME: materials could be stored in a more compact structure
  for (let i = 0; i < materialCount; i++) {
    // FIXME: why do we even have this mIdx field?  it doesn't do anything useful
    // we can get rid of it by just sorting the materials
    const mIdx = inp.readUint8();
    const r = inp.readUint8();
    const g = inp.readUint8();
    const b = inp.readUint8();
    const metalness = inp.readUint8();
    const smoothness = inp.readUint8();
    const emissive = inp.readUint8();
    RGB_TABLE[mIdx] = packWord(r, g, b, 0);
    PBR_TABLE[mIdx] = packWord(metalness, smoothness, emissive, mIdx);
  }

  // read in the slices
  // FIXME: would be nice if slices came *after* surfaces so we could skip this read phase and just scan directly from the mesh
  // instead we have to do this awkward traversal and read the data into a temporary buffer
  SLICE_INFO.length = 0;
  for (let count = 0; count < sliceInfoCount; ) {
    // FIXME: we can assume that all 6 normals will occur in each file, so just list them back to-back
    // that way we can save 6 bytes and skip reading this thing
    const normalCode = inp.readUint8();
    const normalCodeCount = inp.readVarint();
    count += 2;
    for (let j = 0; j < normalCodeCount; j++) {
      // FIXME: could bitmask z into zCount and just use one varInt.  would save 1 byte per slice
      const z = inp.readUint8();
      const zCount = inp.readVarint();
      count += 2;
      SLICE_INFO.push(normalCode, z, zCount);
    }
  }

  // finally we can unpack the surfaces
  // allocate mesh buffers
  const meshSize = surfaceCount * FACE_VERTS * VERT_SIZE;
  const buffer = new Uint32Array(meshSize);

  // initialize buffer pointers
  let ptr = 0;
  for (let i = 0; i < SLICE_INFO.length; i += 3) {
    // read back the slice info
    const normalCode = SLICE_INFO[i];
    const z = SLICE_INFO[i + 1];
    const count = SLICE_INFO[i + 2];

    // unpack normal code
    const flip = !(normalCode & 1);
    const d = normalCode >> 1;
    const u = (d + 2) % 3;
    const v = (d + 1) % 3;
    const ds = endianByteShift(d);
    const us = endianByteShift(u);
    const vs = endianByteShift(v);

    // precompute normal and z shifts
    const zs = (z << ds) >>> 0;
    const ns = (normalCode << S3) >>> 0;

    for (let j = 0; j < count; ++j) {
      const loX = (inp.readUint8() << us) >>> 0;
      const loY = (inp.readUint8() << vs) >>> 0;
      const hiX = (inp.readUint8() << us) >>> 0;
      const hiY = (inp.readUint8() << vs) >>> 0;
      const mIdx = inp.readUint8();
      const packedAO = inp.readUint8();

      // write material data
      const rgb = (RGB_TABLE[mIdx] | ns) >>> 0;
      const pbr = PBR_TABLE[mIdx];
      buffer[ptr + 1] = rgb;
      buffer[ptr + 2] = pbr;
      buffer[ptr + 4] = rgb;
      buffer[ptr + 5] = pbr;
      buffer[ptr + 7] = rgb;
      buffer[ptr + 8] = pbr;
      buffer[ptr + 10] = rgb;
      buffer[ptr + 11] = pbr;

      // unpack ambient occlusion values
      const a00 = AO_TABLE[packedAO & 3];
      const a10 = AO_TABLE[(packedAO >> 2) & 3];
      const a11 = AO_TABLE[(packedAO >> 4) & 3];
      const a01 = AO_TABLE[packedAO >> 6];

      // pack vertex data into 4 byte words
      const v00 = (loX | loY | zs | a00) >>> 0;
      const v01 = (loX | hiY | zs | a01) >>> 0;
      const v10 = (hiX | loY | zs | a10) >>> 0;
      const v11 = (hiX | hiY | zs | a11) >>> 0;

      // remove all branches from mesh unpacking
      // check if faces needs to be flipped
      const q = a00 + a11;
      const r = a10 + a01;
      const flipAO = (q - r || Math.max(a00, a11) - Math.max(a10, a01)) < 0;

      // select corners
      const notA = (<any>flipAO - 1) >>> 0;
      const c0 = (notA & v00) | (~notA & v01);
      const c1 = (notA & v11) | (~notA & v10);

      // select diagonals
      const d0 = v00 ^ v01 ^ c0;
      const d1 = v11 ^ v10 ^ c1;

      // flip flag
      const F = (<any>flip) ^ (<any>flipAO);

      buffer[ptr] = c0;
      buffer[ptr + (3 << F)] = d0;
      buffer[ptr + (3 << (1 ^ F))] = d1;
      buffer[ptr + 9] = c1;

      // increment mesh pointer
      ptr += PTR_STEP;
    }
  }

  // convert the packed 32-bit buffer into 8-bit.  hopefully we didn't fuck up endian stuff lol
  // format of this buffer is the [geometry, rgb, normal, pbr] data all interleaved
  return new Uint8Array(buffer.buffer);
}
