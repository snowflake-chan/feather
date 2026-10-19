import type { ModelDataV6 } from 'model/schema-v6';
import { Mat3Schema } from '../../util';
import { ModelDataV7, ModelDataV7Schema } from 'model/schema-v7';

const IDENTITY_SCALE_MAT3 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export const migrateV6 = async (data: ModelDataV6): Promise<ModelDataV7> => {
  const v7 = ModelDataV7Schema.clone(ModelDataV7Schema.identity);

  const { version, ...others } = data;

  Object.assign(v7, others);

  v7.nodes.forEach((node) => {
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3);
  });

  return v7;
};
