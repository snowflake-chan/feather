import { AppEdition } from '../types/appEdition';

export const FREE_SKINS_CREATERA = [
  'bearPlaymate',
  'coolExplorer',
  'pandaDeacons',
  'researcher',
  'sunnyGirl',
];

export const FREE_SKINS_BOX3 = ['man', 'woman'];

export function getFreeSkinNames(appEdition: AppEdition) {
  return appEdition === 'createra'
    ? [...FREE_SKINS_CREATERA]
    : [...FREE_SKINS_BOX3];
}
