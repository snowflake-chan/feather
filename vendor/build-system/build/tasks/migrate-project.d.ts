import { BuildSystemAPI } from '../type';
import { RetrievedGroupProjectMetaData } from '../group-project';
/**
 * 将 project Hash 迁移至指定版本。默认为最新版本
 * @param bs BuildSystem
 * @param hash projectHash。如果入参不是project的Hash将会抛错
 * @returns
 */
export declare function migrateProject(bs: BuildSystemAPI, hash: string, toVersion?: string): Promise<string>;
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
export declare function migrateGroupProject(bs: BuildSystemAPI, projectHash: string, groupMetaData?: RetrievedGroupProjectMetaData, dataFromBackend?: RetrievedGroupProjectMetaData[], migrateVersion?: string): Promise<string>;
//# sourceMappingURL=migrate-project.d.ts.map