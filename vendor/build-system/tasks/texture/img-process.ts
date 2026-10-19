import { BuildSystem } from '../../type';

export interface ImageModel {
  width: number;
  height: number;
  data: string;
}

export async function genImageFromUploader(
  bs: BuildSystem,
  hash: string,
  type: string,
  width: number,
  height: number,
) {
  const imageHash = await genOptimiImageHash(bs, hash, type);
  const imageModel: ImageModel = {
    width,
    height,
    data: imageHash,
  };
  return bs.storeJSON(imageModel);
}

async function genOptimiImageHash(bs: BuildSystem, hash: string, type: string) {
  switch (type) {
    case 'png':
      return bs.build('optimizePNG', hash);
    case 'jpg':
    case 'jpeg':
      return bs.build('optimizeJPG', hash);
    default:
      throw new Error(`cannot read img type ${type}`);
  }
}
