import type { ProjectDataV8 } from '../schema-v8';
import { ProjectDataV9 } from 'project/schema-v9';
export declare const migrateV8: (data: ProjectDataV8) => ProjectDataV9;
