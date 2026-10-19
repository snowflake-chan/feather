import { stableStringify } from '@box/mudb/util/stringify';
import { VbFileData, parseVbFile } from '@box/vb-parser';
import {
  migrateModel,
  modelSchemaToBytes,
  getModelMetaData,
  ModelMetaData,
  VOXA_MODEL_VERSION,
} from '@box/voxa-project';
import { BuildSystem } from '../type';
import { BUILD_HEAVY_LOCK } from './heavy_mutex';

export async function migrateVoxel(bs: BuildSystem, hash: string) {
  await BUILD_HEAVY_LOCK.p();
  const t = Date.now();
  try {
    return await migrateVoxelModel(bs, hash);
  } finally {
    bs.logger.info(
      `migrate voxel mesh ${hash} elapsed time ${Date.now() - t}ms`,
    );
    BUILD_HEAVY_LOCK.v();
  }
}

const migrateVoxelModel = async (bs: BuildSystem, hash: string) => {
  // Qm开头的hash模型大概率在IPFS上，优先从IPFS中拉取资源
  if (hash.startsWith('Qm')) {
    try {
      return await migrateIPFSModel(bs, hash);
    } catch {
      return await migrateS3Model(bs, hash);
    }
  }

  return await migrateS3Model(bs, hash);
};

const migrateIPFSModel = async (bs: BuildSystem, hash: string) => {
  const vbData = await bs.retrieveContent(hash);
  const json: VbFileData = JSON.parse(Buffer.from(vbData).toString());
  const voxaData = parseVbFile(json);
  const str = stableStringify(voxaData.model);
  if (!str) {
    throw new Error(`vb file invalid json ${hash}`);
  }
  const modelBytes = new Uint8Array(Buffer.from(str, 'utf8'));
  const metaData = getModelMetaData(hash, modelBytes);
  if (!metaData) {
    throw new Error(`error when get model ${hash} meta data`);
  }
  return await storeBytesToLatestVersion(bs, hash, modelBytes, metaData);
};

const migrateS3Model = async (bs: BuildSystem, hash: string) => {
  const metaBytes = await bs.retrieveContentFromS3(hash);
  const metaData = getModelMetaData(hash, metaBytes);
  if (!metaData) {
    throw new Error(`error when get model ${hash} meta data`);
  }

  if (metaData.version === VOXA_MODEL_VERSION) {
    return hash;
  }

  const modelBytes = await bs.retrieveContentFromS3(metaData.dataHash);

  return await storeBytesToLatestVersion(bs, hash, modelBytes, metaData);
};

const storeBytesToLatestVersion = async (
  bs: BuildSystem,
  hash: string,
  bytes: Uint8Array,
  metaData: ModelMetaData,
) => {
  const modelData = await migrateModel(bytes);
  if (!modelData) {
    throw new Error(`error when migrate voxa file ${hash}`);
  }
  const latestVersion = modelSchemaToBytes(modelData);
  const dataHash = await bs.storeContentToS3(latestVersion);

  const { version: oldVersion, dataHash: oldHash, ...remain } = metaData;

  const newMetaData: ModelMetaData = {
    ...remain,
    version: modelData.version,
    dataHash,
  };

  const metaBytes = new Uint8Array(
    Buffer.from(JSON.stringify(newMetaData), 'utf8'),
  );
  return await bs.storeContentToS3(metaBytes);
};
