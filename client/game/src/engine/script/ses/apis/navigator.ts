import { ClientNavigator, DeviceType } from '@box/script-api';
import { isMobile } from 'src/utils/mobile';

type GetScreenSize = () => { width: number; height: number };

export function createNavigatorGlobals(getScreenSize: GetScreenSize) {
  return {
    ClientNavigator,
    navigator: new ClientNavigator(
      () => {
        return {
          deviceType: isMobile() ? DeviceType.Mobile : DeviceType.Desktop,
          screen: getScreenSize(),
        };
      },
      navigator.userAgent,
      navigator.language,
    ),
  };
}
