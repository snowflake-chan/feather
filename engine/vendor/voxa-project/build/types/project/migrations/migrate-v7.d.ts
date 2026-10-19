import type { ProjectDataV7 } from '../schema-v7';
import { ProjectDataV8 } from 'project/schema-v8';
export declare const migrateV7: (data: ProjectDataV7) => ProjectDataV8;
