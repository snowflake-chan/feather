import type { ProjectDataV1 } from '../schema-v1';
import { ProjectDataV2 } from '../schema-v2';
export declare const migrateV1: (data: ProjectDataV1) => ProjectDataV2;
