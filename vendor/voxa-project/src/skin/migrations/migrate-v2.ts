import { BodyPartDataV2 } from 'skin/schema-v2';
import { BodyPartDataV3, BodyPartDataV3Schema } from 'skin/schema-v3';
import { Mat3Schema } from '../../util';

const IDENTITY_SCALE_MAT3 = Mat3Schema.fromJSON([1, 0, 0, 0, 1, 0, 0, 0, 1]);

export const migrateV2 = (data: BodyPartDataV2): BodyPartDataV3 => {
  const v3 = BodyPartDataV3Schema.clone(BodyPartDataV3Schema.identity);

  const { version, ...others } = data;

  Object.assign(v3, others);

  v3.nodes.forEach((node) => {
    node.parentScaleMat3 = Mat3Schema.clone(IDENTITY_SCALE_MAT3);
  });

  return v3;
};
