import type { ModelDataV4 } from 'model/schema-v4';
import { ModelDataV5, ModelDataV5Schema } from 'model/schema-v5';

export const migrateV4 = async (data: ModelDataV4): Promise<ModelDataV5> => {
  const v5 = ModelDataV5Schema.clone(ModelDataV5Schema.identity);
  v5.meshes = data.meshes;
  v5.nodes = data.nodes;
  v5.texture = data.texture;
  return v5;
};
