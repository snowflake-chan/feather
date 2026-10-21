import { ContactRecordSchema } from '@box/schema/physics/physics-schema';
import { resolvePlayerAnimationContact } from '../engine/player/player-animation-contact';

describe('player animation contact snapshots', () => {
  test('player rendering survives a missing first contact snapshot', () => {
    expect(resolvePlayerAnimationContact(undefined, 4)).toBe(
      ContactRecordSchema.identity,
    );
  });

  test('uses the matching contact when it is available', () => {
    const contact = ContactRecordSchema.clone(ContactRecordSchema.identity);
    contact.id = 4;
    expect(resolvePlayerAnimationContact(contact, 4)).toBe(contact);
  });
});
