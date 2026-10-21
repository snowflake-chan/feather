import { Logger } from '@box/utils/logger';
import { isApp } from './session-storage';

// any mobile configurations are set here
const appleTablet = /iPad/i;
const appleIphone = /iPhone/i;
const androidTablet = /Android/i;
const androidPhone = /\bAndroid(?:.+)Mobile\b/i;
export const touchable = !!(
  typeof window !== 'undefined' && 'ontouchstart' in window
);

export function isMobile(): boolean {
  // RUSTY注定是移动端样式
  if (process.env.RUSTY) {
    return true;
  }

  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  ) {
    return false;
  }
  return (
    navigator.userAgent.indexOf('Mobile') > -1 ||
    navigator.userAgent.indexOf('Android') > -1
  );
}

export function isTabletLandscape() {
  const { innerWidth, innerHeight } = window;
  return (
    innerHeight >= 768 &&
    innerWidth >= 1024 &&
    innerHeight <= 1024 &&
    innerWidth <= 1366
  );
}

export function isTabletPortrait() {
  const { innerWidth, innerHeight } = window;
  return (
    innerHeight >= 1024 &&
    innerWidth >= 768 &&
    innerHeight <= 1366 &&
    innerWidth <= 1024
  );
}

export function isTablet() {
  return isIpadTablet() || isAndroidTablet();
}

/**
 * 是手机且非平板设备
 * @returns boolean
 */
export function isOnlyMobile() {
  return isMobile() && !isTablet();
}

export function isPhoneSize(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth <= 450 || window.innerHeight <= 450;
}

export function isFullScreen() {
  const doc = <any>window.document;
  return !!(
    doc.fullscreenElement ||
    doc.mozFullScreenElement ||
    doc.webkitFullscreenElement ||
    doc.msFullscreenElement
  );
}

export function toggleFullScreen() {
  const doc = (<any>window).document;
  const docEl = doc.documentElement;

  if (docEl) {
    const requestFullScreen =
      docEl.requestFullscreen ||
      (docEl as any).mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      (docEl as any).msRequestFullscreen;
    const cancelFullScreen =
      doc.exitFullscreen ||
      (doc as any).mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      (doc as any).msExitFullscreen;

    if (!isFullScreen()) {
      window.scrollTo(0, 1);
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  }
}

export function isIos() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

export function isiPad() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  return /iPad/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isWebView() {
  const useragent = navigator.userAgent;
  const rules = [
    'WebView',
    '(iPhone|iPod|iPad)(?!.*Safari/)',
    'Android.*(wv|.0.0.0)',
  ];
  const regex = new RegExp(`(${rules.join('|')})`, 'ig');
  return Boolean(useragent.match(regex));
}

export function isWechat() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') > -1;
}

export function setHtmlFont() {
  const docEl = document.documentElement;
  let dpr = window.devicePixelRatio || 1;

  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      if (!isMobile()) {
        dpr = 1;
      }
      document.body.style.fontSize = '16px';
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();
  setViewport();

  window.addEventListener('resize', setViewport);

  // detect 0.5px supports
  if (dpr >= 2) {
    const fakeBody = document.createElement('body');
    const testElement = document.createElement('div');
    testElement.style.border = '.5px solid transparent';
    fakeBody.appendChild(testElement);
    docEl!.appendChild(fakeBody);
    if (testElement.offsetHeight === 1) {
      docEl!.classList.add('hairlines');
    }
    docEl!.removeChild(fakeBody);
  }

  function setViewport() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.scrollTo(0, 0);
  }
}

export function preventTouchDefault() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return;
  }
  // prevent default touch actions
  document.body.addEventListener('touchmove', preventDefaultEv, <any>{
    passive: false,
  });
}

export function enableTouchDefault() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return;
  }
  document.body.removeEventListener('touchmove', preventDefaultEv);
}

function preventDefaultEv(ev) {
  ev.preventDefault();
}

export function handleMobileInputBlur() {
  if (!touchable) {
    return;
  }
  if (isIos()) {
    const scrollHeight =
      document.documentElement.scrollTop || document.body.scrollTop || 0;
    window.scrollTo(0, Math.max(scrollHeight - 1, 0));
  }
}

export function isPortrait() {
  return window.screen?.orientation !== undefined
    ? window.screen.orientation.angle % 180 === 0
    : window.innerWidth < window.innerHeight;
}

function match(regex: RegExp): boolean {
  return regex.test(navigator.userAgent);
}

const isAppleTabletOnIos13 = (navigator?: Navigator): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1 &&
    typeof (window as any).MSStream === 'undefined'
  );
};

export function isIpadTablet() {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return (
    !match(appleIphone) &&
    (match(appleTablet) || isAppleTabletOnIos13(navigator))
  );
}

export function isAndroidTablet() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  let width: number;
  let height: number;
  if (window.screen !== undefined) {
    width = window.screen.width;
    height = window.screen.height;
  } else {
    width = window.innerWidth;
    height = window.innerHeight;
  }
  const bigDevice =
    (height > width && width >= 768) || (width > height && width >= 1024);

  return (!match(androidPhone) || bigDevice) && match(androidTablet);
}

export function isQQ() {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return navigator.userAgent.indexOf('QQ') >= 0;
}

export const isSafari = () => {
  return (
    (window as any).safari &&
    typeof (window as any).safari === 'object' &&
    (window as any).safari.pushNotification
  );
};

type Orientation = 'landscape' | 'portrait';
export async function lockOrientation(orientation: Orientation) {
  if (!isFullScreen()) {
    toggleFullScreen();
  }
  await screen.orientation.lock(orientation);
}

export function handleOrientation(
  platform: 'website' | 'game',
  _logger?: Logger,
) {
  if (!isApp()) {
    return;
  }
  const logger = _logger || console;
  let orientation: Orientation = 'portrait';
  if ((platform === 'website' && isTablet()) || platform === 'game') {
    orientation = 'landscape';
  }
  lockOrientation(orientation).catch((e) => logger.error(e.toString()));
}

export function getPlatform(): string {
  if (isOnlyMobile()) {
    return 'mobile';
  }
  if (isTablet()) {
    return 'tablet';
  }
  return 'desktop';
}
