import { ProjectDataV2 } from '../schema-v2';
import { ProjectDataV3 } from '../schema-v3';
export declare const ROOT_SKIN_ID = "ROOT_SKIN";
export declare const ROOT_NAME = "Root";
export declare const migrateV2: (data: ProjectDataV2) => ProjectDataV3;
