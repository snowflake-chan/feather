import type { ModelDataV3 } from '../schema-v3';
import { ModelDataV4 } from 'model/schema-v4';
export declare const migrateV3: (data: ModelDataV3) => Promise<ModelDataV4>;
