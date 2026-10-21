import { UserInfoPermissions, UserInfoVO } from '@box/apis';
import { localeMap } from 'src/apis/createra';

export type UserState = {
  avatar: string;
  banEditor: boolean;
  displayName: string;
  id: number;
  language: string;
  phone: string;
  isAdmin: boolean;
  credits?: number;
};

export function convertUserInfo(data: UserInfoVO): UserState {
  return {
    ...data,
    displayName: data.nickname || '',
    banEditor: false,
    id: data.userId!,
    language: localeMap[data.language] || '',
    isAdmin: !!(data.permission & UserInfoPermissions.Admin),
  };
}
