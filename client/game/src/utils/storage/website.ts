import { getStorageTemplate } from './local-storage';

export const WebsiteStorage = getStorageTemplate('GAME_WEB', {
  displayQuality: 1,
  lang: '',
  searchHistory: [] as string[],
  newCreator: true,
  openModelPreviewTimes: 0,
  accountBindTipTimeStamp: 0,
  clearedStorageCache: false,
  Authorization: '',
});
