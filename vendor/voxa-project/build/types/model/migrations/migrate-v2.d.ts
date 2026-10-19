import type { ModelDataV2 } from '../schema-v2';
import type { ModelDataV3 } from '../schema-v3';
export declare const migrateV2: (data: ModelDataV2) => Promise<ModelDataV3>;
