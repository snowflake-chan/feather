import type { ModelDataV5 } from 'model/schema-v5';
import { ModelDataV6, ModelDataV6Schema } from 'model/schema-v6';
import { Vec3Schema } from '../../util';

const IDENTITY_SCALE = Vec3Schema.fromJSON([1, 1, 1]);

export const migrateV5 = async (data: ModelDataV5): Promise<ModelDataV6> => {
  const v6 = ModelDataV6Schema.clone(ModelDataV6Schema.identity);

  const { version, ...others } = data;

  Object.assign(v6, others);

  v6.nodes.forEach((node) => {
    node.scale = Vec3Schema.clone(IDENTITY_SCALE);
  });

  return v6;
};
