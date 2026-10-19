import {
  migrateSkin as migrateBodyPart,
  SkinMetaData,
  VOXA_SKIN_VERSION,
  bodyPartSchemaToBytes,
} from '@box/voxa-project';
import { BuildSystem } from '../type';
import { BUILD_HEAVY_LOCK } from './heavy_mutex';

export async function migrateSkin(
  bs: BuildSystem,
  hash: string,
  metaData: SkinMetaData,
) {
  await BUILD_HEAVY_LOCK.p();
  const t = Date.now();
  try {
    return await migrateS3Skin(bs, hash, metaData);
  } finally {
    bs.logger.info(
      `migrate skin mesh ${hash} elapsed time ${Date.now() - t}ms`,
    );
    BUILD_HEAVY_LOCK.v();
  }
}

const migrateS3Skin = async (
  bs: BuildSystem,
  hash: string,
  metaData: SkinMetaData,
) => {
  if (metaData.version === VOXA_SKIN_VERSION) {
    return hash;
  }

  const { version, ...bodyParts } = metaData;

  const newMetaData: SkinMetaData = {
    version: VOXA_SKIN_VERSION,
  };

  const migrationList: Promise<void>[] = [];

  Object.keys(bodyParts).forEach((partName) => {
    const hash = bodyParts[partName];

    if (!hash) {
      return;
    }

    const partMigration = new Promise<void>(async (resolve, reject) => {
      const bytes = await bs.retrieveContentFromS3(hash);

      const schema = await migrateBodyPart(bytes);

      if (!schema) {
        reject(`Failed to migrate a part to latest version, ${hash}`);
        return;
      }

      const latestBytes = bodyPartSchemaToBytes(schema);

      const dataHash = await bs.storeContentToS3(latestBytes);

      newMetaData[partName] = dataHash;

      resolve();
    });

    migrationList.push(partMigration);
  });

  await Promise.all(migrationList);

  const latestMetaBytes = new Uint8Array(
    Buffer.from(JSON.stringify(newMetaData), 'utf8'),
  );

  return await bs.storeContentToS3(latestMetaBytes);
};
