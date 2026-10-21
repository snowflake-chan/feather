import { useRef, useEffect, DependencyList, useMemo, MouseEvent } from 'react';

/**
 * 拼接className。排除非字符串。
 */
export function useClassName(
  classNames: (string | undefined)[],
  deps?: DependencyList,
) {
  return useMemo(() => {
    const names: string[] = classNames.filter(
      (name): name is string => typeof name === 'string',
    );

    return names.join(' ');
  }, deps);
}

const LONG_PRESS_THRESHOLD = 300;

/**
 * 长按 / 点击交互的hook
 * @param options 传入参数，区分长按 / 点击的操作
 * @returns 返回onStart、onEnd函数，用于绑定组件的mouse或者touch事件
 */
export function useInteraction(options: {
  onLongPress?: () => void;
  onClick?: () => void;
  clearDeps?: React.DependencyList;
}): {
  onStart: () => void;
  onEnd: () => void;
} {
  const timer = useRef(-1);
  const isLongPress = useRef(false);
  const { onLongPress, onClick, clearDeps = [] } = options;

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

  return { onStart, onEnd };
}

export function isMac() {
  const platform = navigator.userAgentData
    ? navigator.userAgentData.platform
    : navigator.platform;

  return /(m|M)ac/.test(platform);
}

/**
 * 功能键是否按下。
 * mac上功能键为Command，对应metaKey属性。
 * 其他系统上功能键为Ctrl，对应ctrlKey属性。
 */
export function isMetaKeyPressed(evt: MouseEvent | KeyboardEvent) {
  return isMac() ? evt.metaKey : evt.ctrlKey;
}

/**
 * 字符串内容是否是合法的数字。
 * 不包括Infinity/-Infinity和科学记数法。
 */
export function isValidNumber(text: string) {
  return /^[+-]?\d*\.?\d*$/.test(text);
}

/**
 * 截取指定宽度的字符串，半角字符占1个单位，全角字符占2个单位。
 * 定义unicode 0-255的字符为半角字符，实际情况可能略有误差。
 * 无法完全显示的全角字符不会被截取。
 */
export function substringByWidth(str: string, limit: number) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    len += countCharacter(str, i);

    if (len > limit) {
      return str.substring(0, i);
    }
  }
  return str;
}

export function getStringWidth(str: string) {
  let len = 0;

  for (let i = 0; i < str.length; i++) {
    len += countCharacter(str, i);
  }

  return len;
}

export function popStringByWidth(str: string, popWidth: number): string {
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

/**
 * 计算字符长度，半角字符占1个单位，全角字符占2个单位
 */
function countCharacter(str: string, i: number) {
  const code = str.charCodeAt(i);

  return code > 255 ? 2 : 1;
}
