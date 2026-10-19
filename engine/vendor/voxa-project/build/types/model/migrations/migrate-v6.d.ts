import type { ModelDataV6 } from 'model/schema-v6';
import { ModelDataV7 } from 'model/schema-v7';
export declare const migrateV6: (data: ModelDataV6) => Promise<ModelDataV7>;
