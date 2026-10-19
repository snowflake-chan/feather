import { GroupProjectState, GroupProjectMetaData } from '@box/schema/group-project/rda';
import type { BuildSystemAPI } from '../type';
/**
 * 在retrieveGroupProject时，某些数据的hash可能为undefined，因为之前的作品并没有这类数据
 */
export type RetrievedGroupProjectMetaData = Omit<GroupProjectMetaData, 'hashes'> & {
    hashes: Partial<GroupProjectMetaData['hashes']>;
};
export type RetrievedGroupProjectState = Partial<GroupProjectState>;
/**
 * 当前后端做merge拼接的版本
 * 日后新增字段迁移至group的话这个版本号就要跟随变动
 */
export declare const MERGED_VERSION = "0.3.27";
/**
 * group旧版本号到group新版本号的对应map
 * 用于做一些数据fix，版本迁移
 * 这个数据永远不会变动了
 */
export declare const GROUP_VERSION_MAP: {
    '0.0.0': string;
    '0.0.1': string;
    '0.0.2': string;
};
/**
 * 后续对每个keys都需要有对应的migration文件
 * 比如加了audio，后面也要有audio-0.0.1.ts 文件，即使原封不动的返回
 * 以上流程可能可以优化，可以在这里读取migrationTasks，做一些判断处理
 *
 * 加更：不会优化了，这个方法也不会有任何的改动，此方法用于兼容旧数据迁移，就老死在这里就行了
 */
export declare function retrieveGroupProject(bs: BuildSystemAPI, groupProject: RetrievedGroupProjectMetaData): Promise<RetrievedGroupProjectState>;
//# sourceMappingURL=index.d.ts.map