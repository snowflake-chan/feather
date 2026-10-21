import {
  ContactRecord,
  ContactRecordSchema,
} from '@box/schema/physics/physics-schema';
export function resolvePlayerAnimationContact(
  contact: ContactRecord | undefined,
  id: number,
): ContactRecord {
  return contact?.id === id ? contact : ContactRecordSchema.identity;
}
