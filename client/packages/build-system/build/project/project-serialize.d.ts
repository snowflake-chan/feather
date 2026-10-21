import { HotProject } from '@box/schema/project/hot-schema';
import { BuildSystemAPI } from '../type';
import { GroupProjectMetaData, ProjectInfo } from '@box/schema/project/project-rda';
export interface StoreProjectRes {
    projectHash: string;
    groupProjectMetaData: GroupProjectMetaData;
}
export declare function storeProjectJSON(bs: BuildSystemAPI, rawJSON: any): Promise<StoreProjectRes>;
export declare function storeProject(bs: BuildSystemAPI, project: ProjectInfo): Promise<StoreProjectRes>;
export declare function retrieveProject(bs: BuildSystemAPI, hash: string): Promise<{
    hash: string;
    project: ProjectInfo;
}>;
export declare function updateProjectByHotProject(out: {
    hash: string;
    project: ProjectInfo;
}, bs: BuildSystemAPI, hotProject: HotProject): Promise<void>;
//# sourceMappingURL=project-serialize.d.ts.map