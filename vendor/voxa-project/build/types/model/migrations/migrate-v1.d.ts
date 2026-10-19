import type { ModelDataV1 } from '../schema-v1';
import type { ModelDataV2 } from '../schema-v2';
export declare const migrateV1: (data: ModelDataV1) => Promise<ModelDataV2>;
