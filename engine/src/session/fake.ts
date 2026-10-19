import { UserDetailSchema } from '@box/schema/session/schema';

export function getFakeUser(displayname = 'fake user', id?: number) {
  const fakeUser = UserDetailSchema.alloc();
  fakeUser.id = id ? id.toString() : '';
  fakeUser.phone = '+8613100000000';
  fakeUser.displayname = displayname;

  return fakeUser;
}
