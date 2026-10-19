import type { ModelDataV3 } from '../schema-v3';
import { ModelDataV4, ModelDataV4Schema } from 'model/schema-v4';

export const migrateV3 = async (data: ModelDataV3): Promise<ModelDataV4> => {
  const v4 = ModelDataV4Schema.clone(ModelDataV4Schema.identity);
  v4.meshes = data.meshes;
  v4.nodes = data.nodes;
  v4.texture = data.texture;
  return v4;
};
