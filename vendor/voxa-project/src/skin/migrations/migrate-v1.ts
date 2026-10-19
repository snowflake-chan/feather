import { BodyPartDataV1 } from 'skin/schema-v1';
import { BodyPartDataV2, BodyPartDataV2Schema } from 'skin/schema-v2';
import { Vec3Schema } from '../../util';

const IDENTITY_SCALE = Vec3Schema.fromJSON([1, 1, 1]);

export const migrateV1 = (data: BodyPartDataV1): BodyPartDataV2 => {
  const v2 = BodyPartDataV2Schema.alloc();

  const { version, ...others } = data;

  Object.assign(v2, others);

  v2.nodes.forEach((node) => {
    node.scale = Vec3Schema.clone(IDENTITY_SCALE);
  });
  v2.version = 2;

  return v2;
};
