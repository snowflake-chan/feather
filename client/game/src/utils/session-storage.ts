import { getQueryParam } from './url-helpers';

const MTM_SOURCE = 'mtm_source';
enum MTM_TYPES {
  twa = 'twa',
  apk = 'apk',
}

export function initSessionStorage() {
  if (sessionStorage.getItem(MTM_SOURCE)) {
    return;
  }

  if (
    document.referrer.indexOf('android-app://') >= 0 ||
    getQueryParam(MTM_SOURCE) === MTM_TYPES.twa
  ) {
    sessionStorage.setItem(MTM_SOURCE, MTM_TYPES.twa);
  }
}

export function isApp() {
  return isTWA() || isAPK();
}

export function isTWA() {
  return sessionStorage.getItem(MTM_SOURCE) === MTM_TYPES.twa;
}

export function isAPK() {
  return sessionStorage.getItem(MTM_SOURCE) === MTM_TYPES.apk;
}
