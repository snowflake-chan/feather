import { MuReadStream, MuWriteStream } from '@box/mudb/stream';

export interface CompactModel {
  material: { [key: number]: { rgb: number[]; pbr: number[] } };
  sliceInfo: number[];
  data: Uint8Array;
  surfaceCount: number;
}

/**
 * 把compactModel写入stream
 * 参照原来的 ModelMeshSchema.diff
 * @returns
 */
export function compactModelToVbBytes(model: CompactModel) {
  const surfaceCount = model.surfaceCount;
  const dataLen = surfaceCount * 6;
  const materialKeys = Object.keys(model.material);

  const out = new MuWriteStream(
    // compactModel.sliceInfo.length / 2 不一定是整数
    // sliceInfo后面的数据都用grow处理
    4 + 5 + 5 + 5 + materialKeys.length * 7,
  );

  out.writeInt32(-11);
  out.writeVarint(surfaceCount);
  out.writeVarint(materialKeys.length);
  out.writeVarint(model.sliceInfo.length);

  for (let i = 0; i < materialKeys.length; i++) {
    const _m = model.material[materialKeys[i]];
    out.writeUint8(Number(materialKeys[i]));
    out.writeUint8(_m.rgb[0]);
    out.writeUint8(_m.rgb[1]);
    out.writeUint8(_m.rgb[2]);
    out.writeUint8(_m.pbr[0]);
    out.writeUint8(_m.pbr[1]);
    out.writeUint8(_m.pbr[2]);
  }

  let slice_ptr = 0;
  for (let i = 0; i < model.sliceInfo.length / 2; i++) {
    out.grow(1 + 5);
    out.writeUint8(model.sliceInfo[slice_ptr++]);
    out.writeVarint(model.sliceInfo[slice_ptr++]);
  }

  out.grow(dataLen);
  for (let i = 0; i < dataLen; i++) {
    out.writeUint8(model.data[i]);
  }

  const result = out.bytes();

  out.destroy();

  return result;
}

/**
 * 把bytes还原回CompactModel
 * 参照原来的 ModelMeshSchema.patch
 * @returns
 */
export function bytesToCompactModel(bytes: Uint8Array) {
  const inp = new MuReadStream(bytes);
  const flag = inp.readInt32();
  if (flag !== -11) {
    return;
  }

  const surfaceCount = inp.readVarint();

  const dataLen = surfaceCount * 6;
  const data = new Uint8Array(dataLen);

  const materialCount = inp.readVarint();
  const sliceInfoCount = inp.readVarint();
  const sliceInfo: number[] = [];
  const material = {};

  for (let i = 0; i < materialCount; i++) {
    const mIdx = inp.readUint8();
    const r = inp.readUint8();
    const g = inp.readUint8();
    const b = inp.readUint8();
    const metalness = inp.readUint8();
    const smoothness = inp.readUint8();
    const emissive = inp.readUint8();
    material[mIdx] = {
      rgb: [r, g, b],
      pbr: [metalness, smoothness, emissive],
    };
  }

  for (let i = 0; i < sliceInfoCount / 2; i++) {
    sliceInfo.push(inp.readUint8());
    sliceInfo.push(inp.readVarint());
  }

  for (let i = 0; i < dataLen; i++) {
    data[i] = inp.readUint8();
  }

  return {
    data,
    sliceInfo,
    material,
    surfaceCount,
  };
}
