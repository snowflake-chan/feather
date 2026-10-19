import type { ModelDataV4 } from 'model/schema-v4';
import { ModelDataV5 } from 'model/schema-v5';
export declare const migrateV4: (data: ModelDataV4) => Promise<ModelDataV5>;
