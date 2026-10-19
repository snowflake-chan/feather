import { buildMigrate } from '../migrations';
import { BuildSystemAPI } from '../type';
import {
  GROUP_VERSION_MAP,
  MERGED_VERSION,
  RetrievedGroupProjectMetaData,
  retrieveGroupProject,
} from '../group-project';
import {
  GroupProjectStateSchema,
  ProjectRDA,
} from '@box/schema/project/project-rda';
import { GroupProjectStateV26 } from '@box/schema/group-project/schema-v0-3-26';

const CURRENT_VERSION = ProjectRDA.stateSchema.identity.version;

/**
 * 将 project Hash 迁移至指定版本。默认为最新版本
 * @param bs BuildSystem
 * @param hash projectHash。如果入参不是project的Hash将会抛错
 * @returns
 */
export async function migrateProject(
  bs: BuildSystemAPI,
  hash: string,
  toVersion?: string,
) {
  const rawJSON = await bs.retrieveJSON(hash);
  if (rawJSON.type !== 'project') {
    throw new Error(
      'invalid project hash: ' +
        hash +
        '.  expected type "project", got ' +
        rawJSON.type,
    );
  }
  const migrateToVersion = toVersion || CURRENT_VERSION;
  if (rawJSON.version === migrateToVersion) {
    return hash;
  }

  // run a migration
  bs.logger.info(
    `project ${hash} is version (${rawJSON.version}), migrating to project ${migrateToVersion}`,
  );
  const nextHash = await buildMigrate(
    bs,
    bs.logger,
    'project',
    rawJSON.version,
    migrateToVersion,
    hash,
  );
  if (!nextHash) {
    throw new Error(
      `error migrating project ${hash} from ${rawJSON.version} to ${CURRENT_VERSION}.  DID YOU REMEMBER TO WRITE A MIGRATION IN src/build/migrations/ ????  DID YOU???????????`,
    );
  }
  bs.logger.info(
    `successfully migrated project ${hash} from ${rawJSON.version} to ${migrateToVersion}.  new hash = ${nextHash}`,
  );
  return nextHash;
}

/**
 * 根据入参 project 和 groupProject，将两个数据合并，一起做数据迁移
 *
 * 后端以 MERGED_VERSION 版本的project字段为准做合并+修改引用等操作
 * 此方法会在最后返回一个最小为 MERGED_VERSION 版本的project数据，用于给后端做merge操作
 * @param bs
 * @param projectHash projectHash
 * @param groupMetaData 选填。如果入参，会与project合并一起做数据迁移
 * @param dataFromBackend 选填。来自后端存储数据拼接而成的group数据，用于做play模式的数据兼容
 * @param migrateVersion 后端调用此接口用于迁移时等于MERGED_VERSION（默认值），prebake调用时等于最新版本（需要在prebake方法中手动入参）
 * @returns
 */
export async function migrateGroupProject(
  bs: BuildSystemAPI,
  projectHash: string,
  groupMetaData?: RetrievedGroupProjectMetaData,
  dataFromBackend?: RetrievedGroupProjectMetaData[],
  migrateVersion: string = MERGED_VERSION,
): Promise<string> {
  let hash = projectHash;

  if (groupMetaData) {
    let toVersion: string | undefined =
      GROUP_VERSION_MAP[groupMetaData.version];

    if (toVersion) {
      // 说明group版本在0.0.0 - 0.0.2之间，这个版本的group数据有问题，需要解析重新assign后处理

      // 处理一些错误数据，先把0.0.0版本迁移至0.0.2版本，也就是0.3.26版本的数据
      // 之后才能按照0.3.26的group版本数据来处理
      const groupData = await retrieveGroupProject(bs, groupMetaData);

      // 修复state数据，改为json数据
      const groupState = GroupProjectStateV26.clone(
        GroupProjectStateV26.identity,
      );
      Object.assign(groupState, groupData);
      const groupJson = GroupProjectStateV26.toJSON(groupState);
      GroupProjectStateV26.free(groupState);

      await Promise.all(
        Object.keys(groupData).map(async (key) => {
          groupMetaData.hashes[key] = await bs.storeJSON(groupJson[key]);
        }),
      );

      bs.logger.info(
        `fix group data error, new group data is ${JSON.stringify(
          groupMetaData.hashes,
        )}`,
      );
    } else {
      toVersion = groupMetaData.version;
    }

    let rawJSON = await bs.retrieveJSON(hash);

    if (rawJSON.version !== toVersion) {
      bs.logger.info(
        `First, migrate project version ${rawJSON.version} to group project version ${toVersion}`,
      );
      const groupVersionProjectHash = await bs.build(
        'migrateProject',
        hash,
        toVersion,
      );
      rawJSON = await bs.retrieveJSON(groupVersionProjectHash);
    }

    groupMetaData.hashes = filterEmptyHash(bs, groupMetaData);
    Object.assign(rawJSON, groupMetaData.hashes);
    hash = await bs.storeJSON(rawJSON);
  }

  // 处理来自后端存储数据拼接而成的group数据
  // 约定后端拼接的数据一定是大于等于0.3.27版本的数据，并且按照数组顺序版本依次递增
  // 直接按照数组顺序进行group数据拼接即可，如果有高版本迁移至低版本的情况，直接报错
  if (dataFromBackend) {
    for (const backendData of dataFromBackend) {
      const backendVersionProjectHash = await bs.build(
        'migrateProject',
        hash,
        backendData.version,
      );
      const backendJSON = await bs.retrieveJSON(backendVersionProjectHash);
      backendData.hashes = filterEmptyHash(bs, backendData);
      Object.assign(backendJSON, backendData.hashes);
      hash = await bs.storeJSON(backendJSON);
      bs.logger.info(
        `after assign version ${backendData.version} backend data, new project hash = ${hash}`,
      );
    }
  }

  bs.logger.info(
    `after project info assign group data, new project hash = ${hash}`,
  );

  try {
    return await bs.build('migrateProject', hash, migrateVersion);
  } catch (e) {
    bs.logger.warn(
      `error when migrate project ${hash} to merged version ${migrateVersion}, return current hash`,
    );
    return hash;
  }
}

/**
 * 在assign之前过滤掉空字符串的hash值
 * 理论上不会出现该情况，用于容错
 * @param groupMetaData
 * @returns
 */
function filterEmptyHash(
  bs: BuildSystemAPI,
  groupMetaData: RetrievedGroupProjectMetaData,
) {
  return Object.keys(groupMetaData.hashes).reduce<
    RetrievedGroupProjectMetaData['hashes']
  >((prev, currKey) => {
    if (
      currKey in GroupProjectStateSchema.identity &&
      groupMetaData.hashes[currKey]
    ) {
      prev[currKey] = groupMetaData.hashes[currKey];
    } else {
      bs.logger.error(
        `error: group meta data key ${currKey} has empty string when migrateGroupProject`,
      );
    }
    return prev;
  }, {});
}
