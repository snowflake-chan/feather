import {
  Settings,
  SettingsSchema,
  AntiAddict,
  AntiAddictSchema,
  GuestAntiAddictSchema,
  TeenagerAntiAddictSchema,
  KeyBindingSchema,
} from './settings-schema';
import { GameClientState } from '../game-client-schema';
import { isMobile } from '../../utils/mobile';
import { SETTINGS_MIGRATIONS } from './migration';
import { ContentResolver } from '@box/content-server/content-fetch';
import { CHINESE_HOLIDAY_RES } from '../../resource/chinese_holiday';
import { decodeUTF8 } from '@box/mudb/stream';

export const LOCAL_STORAGE_KEY = 'GAME';

/**
 * @returns 预设好的图像质量参数 [低, 中, 高]
 */
export function getSettingLevels() {
  const lowResolutionScale = isMobile() ? 0.6 : 0.5;
  const resolution =
    typeof window !== 'undefined' && window.devicePixelRatio > 1
      ? [lowResolutionScale, 1, window.devicePixelRatio]
      : [lowResolutionScale, 0.75, 1];
  return {
    // prop: [low, medium, high, off?]
    resolutionScale: resolution,
    lodBias: [12, 21, 32],
    shadowResolution: [1024, 2048, 4096, 0],
    animationQuality: [4, 20, 100],
    game: [
      {
        graphicQuality: 0,
        resolutionScale: resolution[1],
        lodBias: 12,
        shadowResolution: 0,
        postprocess: true,
        parallaxMap: false,
        depthOfField: 0,
        volumetricScattering: false,
        bloom: true,
        fxaa: false,
        reflections: false,
        safeShaders: true,
        lowQualityTextures: true,
        hdSky: false,
        animationQuality: 4,
        ambientOcclusion: true,
      },
      {
        graphicQuality: 1,
        resolutionScale: resolution[1],
        lodBias: 21,
        shadowResolution: 1024,
        postprocess: !isMobile(),
        parallaxMap: false,
        depthOfField: 0,
        volumetricScattering: false,
        bloom: true,
        fxaa: false,
        reflections: false,
        safeShaders: true,
        lowQualityTextures: true,
        hdSky: false,
        animationQuality: 100,
        ambientOcclusion: true,
      },
      {
        graphicQuality: 2,
        resolutionScale: resolution[2],
        lodBias: 32,
        shadowResolution: 4096,
        postprocess: true,
        parallaxMap: true,
        depthOfField: 0,
        volumetricScattering: false,
        bloom: true,
        fxaa: true,
        reflections: false,
        safeShaders: true,
        lowQualityTextures: true,
        hdSky: true,
        animationQuality: 100,
        ambientOcclusion: true,
      },
    ],
  };
}

export function defaultSettings() {
  const levels = getSettingLevels();
  return levels.game[getDefaultSettingLevelIndex()];
}

export function getDefaultSettingLevelIndex() {
  // 移动端默认低画质
  if (isMobile()) {
    return 0;
  }
  return 1;
}

export function saveSettings(settings: Settings) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }
  } catch (e) {
    console.error('game settings save failed');
  }
}

export function loadSettings(out?: Settings) {
  try {
    const gameSettingsData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (gameSettingsData) {
      const json = JSON.parse(gameSettingsData);
      const prevVersion = json.version >>> 0;
      const settings = SettingsSchema.fromJSON(json);
      settings.safeShaders = true;
      for (let i = prevVersion; prevVersion < SETTINGS_MIGRATIONS.length; ++i) {
        SETTINGS_MIGRATIONS[i](settings);
      }
      // 数据矫正：所有的快捷键功能使用默认的按键，不去读取浏览器存储的配置
      KeyBindingSchema.assign(settings.keyBindings, KeyBindingSchema.identity);
      if (out) {
        SettingsSchema.assign(out, settings);
        SettingsSchema.free(settings);
        return out;
      }
      return settings;
    }
  } catch (e) {}
  const base = defaultSettings();
  if (out) {
    SettingsSchema.assign(out, SettingsSchema.identity);
    Object.assign(out, base);
    return out;
  }
  return SettingsSchema.clone(SettingsSchema.identity);
}

export function setGameSettings(
  state: GameClientState,
  value: Partial<Settings>,
) {
  state.logger.info(`settings change: ${JSON.stringify(value)}`);
  Object.assign(state.settings, value);
  saveSettings(state.settings);
  if (state.gl.reglLoader) {
    state.gl.reglLoader.preloadShaders(state);
  }
}

export function clearGameSettings(state: GameClientState) {
  state.logger.info(`clear settings`);
  SettingsSchema.assign(state.settings, SettingsSchema.identity);
  Object.assign(state.settings, defaultSettings());
  try {
    localStorage.clear();
  } catch (e) {}
}

// Anti-Addict

export const FIFTEEN_DAYS = 1000 * 60 * 5;
// export const FIFTEEN_DAYS = 1000 * 60 * 60 * 24 * 15;
export const ONE_HOUR = 1000 * 60; //* 60;
export const EIGHTEEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 18;

export const ONE_AND_A_HALF_HOUR = 1000 * 60; // * 60 + 1000 * 60 * 30;
export const THREE_HOURS = 1000 * 60; //* 60 * 3;

export const isTeenager = (birthday) => {
  const now = new Date().getTime();
  if (!birthday) {
    return false;
  }
  return now - EIGHTEEN_YEARS < new Date(birthday).getTime();
};

const getGuestAntiAddictInfo = (settings: Settings) => {
  const localSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!localSettings) {
    const { guestAntiAddict } = loadSettings(settings);
    return guestAntiAddict;
  } else {
    const guestAntiAddict =
      (JSON.parse(localSettings) as Settings).guestAntiAddict ||
      GuestAntiAddictSchema.clone(GuestAntiAddictSchema.identity);
    return guestAntiAddict;
  }
};

const getTeenagerAntiAddictInfo = (settings: Settings) => {
  const localSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!localSettings) {
    const { teenagerAntiAddict } = loadSettings(settings);
    return teenagerAntiAddict;
  } else {
    const teenagerAntiAddict =
      (JSON.parse(localSettings) as Settings).teenagerAntiAddict ||
      TeenagerAntiAddictSchema.clone(TeenagerAntiAddictSchema.identity);
    return teenagerAntiAddict;
  }
};

export const guestAntiAddictInfo = (
  isbnPreview: boolean,
  settings: Settings,
  setSettings: (settings: Partial<Settings>) => void,
  contentId: number,
) => {
  const guestAntiAddict = getGuestAntiAddictInfo(settings);
  const now = new Date();
  let { playGames } = guestAntiAddict;
  const { isExceedTrialTime, exceedTrialTimeFrom } = guestAntiAddict;
  // remove game record if after 15 days
  playGames = playGames.filter((gameInfo) => {
    const { startRecordTime } = gameInfo;
    return now.getTime() - startRecordTime < FIFTEEN_DAYS;
  });
  let playingGame: AntiAddict | null = null;
  for (let i = 0; i < playGames.length; i++) {
    if (playGames[i].contentId === contentId) {
      playingGame = playGames[i];
      break;
    }
  }
  if (isbnPreview) {
    let allGameTotalPlayTime = 0;
    for (let i = 0; i < playGames.length; i++) {
      const { totalPlayTime } = playGames[i];
      allGameTotalPlayTime += totalPlayTime;
    }
    const isOutOfTime = allGameTotalPlayTime > ONE_HOUR;
    if (playingGame) {
      return {
        isGuestAntiAddict: isOutOfTime,
        allGameTotalPlayTime,
        gameInfo: playingGame,
      };
    }
    setSettings({
      guestAntiAddict: {
        isExceedTrialTime,
        exceedTrialTimeFrom,
        playGames,
      },
    });
    const antiAddictGameInfo = AntiAddictSchema.identity;
    antiAddictGameInfo.contentId = contentId;
    return {
      isGuestAntiAddict: isExceedTrialTime,
      allGameTotalPlayTime,
      gameInfo: antiAddictGameInfo,
    };
  } else {
    // Web judge rule
    if (playingGame) {
      const { totalPlayTime, limitTimeStartAt } = playingGame;
      const isGuestAntiAddict = !!(
        now.getTime() - limitTimeStartAt < FIFTEEN_DAYS ||
        totalPlayTime > ONE_HOUR ||
        isExceedTrialTime
      );
      return {
        isGuestAntiAddict,
        gameInfo: playingGame,
      };
    }
    const antiAddictGameInfo = AntiAddictSchema.identity;
    antiAddictGameInfo.contentId = contentId;
    return {
      isGuestAntiAddict: false,
      gameInfo: antiAddictGameInfo,
    };
  }
};

export const teenagerAntiAddictInfo = async (
  content: ContentResolver,
  settings: Settings,
  setSettings: (settings: Partial<Settings>) => void,
  contentId,
) => {
  // judge is holiday
  let todayIsHoliday = false;
  const holidayBytes = await content.retrieve(CHINESE_HOLIDAY_RES);
  const now = new Date();
  if (holidayBytes) {
    const holiday = JSON.parse(decodeUTF8(holidayBytes));
    const { holidayArr, workdayArr } = holiday;
    const nowDate = now.toDateString();
    for (let i = 0; i < holidayArr.length; i++) {
      const holidayDate = new Date(holidayArr[i]);
      if (holidayDate.toDateString() === nowDate) {
        todayIsHoliday = true;
        break;
      }
    }
    const nowDay = now.getDay();
    if (nowDay === 0 || nowDay === 6) {
      for (let i = 0; i < workdayArr.length; i++) {
        const workdayDate = new Date(workdayArr[i]);
        if (workdayDate.toDateString() === nowDate) {
          todayIsHoliday = false;
          break;
        } else {
          todayIsHoliday = true;
        }
      }
    }
  } else {
    // according to normal day
    const nowDay = now.getDay();
    if (nowDay === 0 || nowDay === 6) {
      todayIsHoliday = true;
    }
  }
  let teenagerAntiAddict = getTeenagerAntiAddictInfo(settings);
  let playingGame: AntiAddict | null = null;
  // remove game record if after 15 days
  teenagerAntiAddict = teenagerAntiAddict.filter((gameInfo) => {
    const { startRecordTime } = gameInfo;
    return now.getTime() - startRecordTime < FIFTEEN_DAYS;
  });
  for (let i = 0; i < teenagerAntiAddict.length; i++) {
    if (teenagerAntiAddict[i].contentId === contentId) {
      playingGame = teenagerAntiAddict[i];
      break;
    }
  }
  if (playingGame) {
    // reset game info if tomorrow
    const { startRecordTime } = playingGame;
    if (new Date(startRecordTime).getDate() !== now.getDate()) {
      playingGame.limitTimeStartAt = 0;
      playingGame.totalPlayTime = 0;
      playingGame.startRecordTime = 0;
      setSettings({
        teenagerAntiAddict,
      });
      return {
        todayIsHoliday,
        isTeenagerAntiAddict: false,
        gameInfo: playingGame,
      };
    }

    const isTeenagerAntiAddict = todayIsHoliday
      ? playingGame.totalPlayTime >= THREE_HOURS
      : playingGame.totalPlayTime >= ONE_AND_A_HALF_HOUR;
    return {
      todayIsHoliday,
      isTeenagerAntiAddict,
      gameInfo: playingGame,
    };
  }
  const antiAddictGameInfo = AntiAddictSchema.identity;
  antiAddictGameInfo.contentId = contentId;
  return {
    todayIsHoliday,
    isTeenagerAntiAddict: false,
    gameInfo: antiAddictGameInfo,
  };
};

export const saveGuestAntiAddictInfo = (spec: {
  contentId: number;
  totalPlayTime: number;
  isbnPreview: boolean;
  startRecordTime?: number;
  limitTimeStartAt?: number;
  setGameSettings: (settings: Partial<Settings>) => void;
}) => {
  const settingsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
  let setting: Settings;
  if (!settingsJson) {
    setting = loadSettings();
  } else {
    setting = JSON.parse(settingsJson);
  }
  const now = new Date();
  const { guestAntiAddict } = setting;
  let playingGame: AntiAddict | null = null;
  for (let i = 0; i < guestAntiAddict.playGames.length; i++) {
    if (guestAntiAddict.playGames[i].contentId === spec.contentId) {
      playingGame = guestAntiAddict.playGames[i];
      break;
    }
  }
  if (!playingGame) {
    const antiAddictGameInfo = AntiAddictSchema.identity;
    antiAddictGameInfo.contentId = spec.contentId;
    guestAntiAddict.playGames.push(antiAddictGameInfo);
    playingGame = antiAddictGameInfo;
  }
  playingGame.totalPlayTime = spec.totalPlayTime;
  if (spec.limitTimeStartAt) {
    playingGame.limitTimeStartAt = spec.limitTimeStartAt;
  }
  if (spec.startRecordTime) {
    playingGame.startRecordTime = spec.startRecordTime;
  }
  if (spec.isbnPreview) {
    const { playGames, exceedTrialTimeFrom } = guestAntiAddict;
    // if more than fifteen day, then remove all game record
    if (exceedTrialTimeFrom - now.getTime() > FIFTEEN_DAYS) {
      spec.setGameSettings({
        guestAntiAddict: {
          isExceedTrialTime: false,
          exceedTrialTimeFrom: 0,
          playGames,
        },
      });
      return;
    }
    let allGameTotalPlayTime = 0;
    playGames.forEach((games) => {
      const { totalPlayTime } = games;
      allGameTotalPlayTime += totalPlayTime;
    });
    if (allGameTotalPlayTime + spec.totalPlayTime > ONE_HOUR) {
      spec.setGameSettings({
        guestAntiAddict: {
          isExceedTrialTime: true,
          exceedTrialTimeFrom: now.getTime(),
          playGames,
        },
      });
      return;
    }
    spec.setGameSettings({
      guestAntiAddict,
    });
    return;
  }
  if (spec.totalPlayTime > ONE_HOUR) {
    guestAntiAddict.isExceedTrialTime = true;
    guestAntiAddict.exceedTrialTimeFrom = now.getTime();
  }
  if (now.getTime() - guestAntiAddict.exceedTrialTimeFrom > FIFTEEN_DAYS) {
    guestAntiAddict.isExceedTrialTime = false;
    guestAntiAddict.exceedTrialTimeFrom = 0;
  }
  spec.setGameSettings({
    guestAntiAddict,
  });
};

export const saveTeenagerAntiAddictInfo = (spec: {
  contentId: number;
  totalPlayTime: number;
  startRecordTime?: number;
  limitTimeStartAt?: number;
  setGameSettings: (settings: Partial<Settings>) => void;
}) => {
  const settingsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
  let setting: Settings;
  if (!settingsJson) {
    setting = loadSettings();
  } else {
    setting = JSON.parse(settingsJson);
  }
  const { teenagerAntiAddict } = setting;
  let playingGame: AntiAddict | null = null;
  for (let i = 0; i < teenagerAntiAddict.length; i++) {
    if (teenagerAntiAddict[i].contentId === spec.contentId) {
      playingGame = teenagerAntiAddict[i];
      break;
    }
  }
  if (!playingGame) {
    const antiAddictGameInfo = AntiAddictSchema.identity;
    antiAddictGameInfo.contentId = spec.contentId;
    teenagerAntiAddict.push(antiAddictGameInfo);
    playingGame = antiAddictGameInfo;
  }
  playingGame.totalPlayTime = spec.totalPlayTime;
  if (spec.limitTimeStartAt) {
    playingGame.limitTimeStartAt = spec.limitTimeStartAt;
  }
  if (spec.startRecordTime) {
    playingGame.startRecordTime = spec.startRecordTime;
  }
  spec.setGameSettings({
    teenagerAntiAddict,
  });
};
