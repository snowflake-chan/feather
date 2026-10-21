import type { ModelDataV5 } from 'model/schema-v5';
import { ModelDataV6 } from 'model/schema-v6';
export declare const migrateV5: (data: ModelDataV5) => Promise<ModelDataV6>;
