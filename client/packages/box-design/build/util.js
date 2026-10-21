import { useMemo, useRef, useEffect } from 'react';

function useClassName(classNames, deps) {
  return useMemo(() => {
    const names = classNames.filter(name => typeof name === 'string');
    return names.join(' ');
  }, deps);
}
const LONG_PRESS_THRESHOLD = 300;
function useInteraction(options) {
  const timer = useRef(-1);
  const isLongPress = useRef(false);
  const {
    onLongPress,
    onClick,
    clearDeps = []
  } = options;
  function onStart() {
    clearTimeout(timer.current);
    isLongPress.current = false;
    timer.current = window.setTimeout(() => {
      isLongPress.current = true;
      onLongPress && onLongPress();
    }, LONG_PRESS_THRESHOLD);
  }
  function onEnd() {
    clearTimeout(timer.current);
    if (!isLongPress.current) {
      onClick && onClick();
    }
    isLongPress.current = false;
  }
  useEffect(() => {
    clearTimeout(timer.current);
  }, clearDeps);
  return {
    onStart,
    onEnd
  };
}
function isMac() {
  const platform = navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform;
  return /(m|M)ac/.test(platform);
}
function isMetaKeyPressed(evt) {
  return isMac() ? evt.metaKey : evt.ctrlKey;
}
function isValidNumber(text) {
  return /^[+-]?\d*\.?\d*$/.test(text);
}
function substringByWidth(str, limit) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    len += countCharacter(str, i);
    if (len > limit) {
      return str.substring(0, i);
    }
  }
  return str;
}
function getStringWidth(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    len += countCharacter(str, i);
  }
  return len;
}
function popStringByWidth(str, popWidth) {
  let poppedLength = 0;
  let newStr = str;
  for (let i = newStr.length - 1; i >= 0; i--) {
    const lastCharLen = countCharacter(newStr, i);
    newStr = newStr.slice(0, i);
    poppedLength += lastCharLen;
    if (poppedLength >= popWidth) {
      break;
    }
  }
  return newStr;
}
function countCharacter(str, i) {
  const code = str.charCodeAt(i);
  return code > 255 ? 2 : 1;
}

export { getStringWidth, isMac, isMetaKeyPressed, isValidNumber, popStringByWidth, substringByWidth, useClassName, useInteraction };
//# sourceMappingURL=util.js.map
