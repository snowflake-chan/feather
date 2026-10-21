import { __rest } from 'tslib';
import { useMemo, useRef, useEffect } from 'react';
import { Trigger } from '../trigger/index.js';
import styles from './style.module.scss.js';
import { jsx, jsxs } from 'react/jsx-runtime';

function Tooltip(props) {
  const {
    text,
    title: optionTitle,
    media: optionMedia,
    addition: optionAddition,
    className: optionClassName,
    style
  } = props;
  const title = useMemo(() => {
    if (!optionTitle) {
      return;
    }
    return /*#__PURE__*/jsx("p", {
      className: styles.title,
      children: optionTitle
    });
  }, [optionTitle]);
  const media = useMemo(() => {
    if (!optionMedia) {
      return;
    }
    let child;
    if (optionMedia.type === 'image') {
      child = /*#__PURE__*/jsx("img", {
        src: optionMedia.src,
        alt: ""
      });
    } else {
      child = /*#__PURE__*/jsx(TooltipVideo, {
        ...optionMedia
      });
    }
    return /*#__PURE__*/jsx("div", {
      className: styles.media,
      children: child
    });
  }, [optionMedia]);
  const addition = useMemo(() => {
    if (!optionAddition) {
      return;
    }
    return /*#__PURE__*/jsx("div", {
      className: styles.addition,
      children: /*#__PURE__*/jsx("div", {
        children: optionAddition
      })
    });
  }, [optionAddition]);
  const className = useMemo(() => {
    const list = [styles.tooltip];
    if (title) {
      list.push(styles.withTitle);
    }
    if (optionAddition) {
      list.push(styles.withAddition);
    }
    if (optionClassName) {
      list.push(optionClassName);
    }
    return list.join(' ');
  }, [optionClassName, title, optionAddition]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    style: style,
    children: [media, /*#__PURE__*/jsxs("div", {
      className: styles.content,
      children: [/*#__PURE__*/jsxs("div", {
        className: styles.textContent,
        children: [title, /*#__PURE__*/jsx("p", {
          className: styles.text,
          children: text
        })]
      }), addition]
    })]
  });
}
function TooltipTrigger(options) {
  const {
      children,
      placement,
      align,
      delay,
      disabled,
      popupVisible,
      moveWithCursor,
      onPopupVisibleChange
    } = options,
    tooltipOptions = __rest(options, ["children", "placement", "align", "delay", "disabled", "popupVisible", "moveWithCursor", "onPopupVisibleChange"]);
  return /*#__PURE__*/jsx(Trigger, {
    popup: /*#__PURE__*/jsx(Tooltip, {
      ...tooltipOptions
    }),
    popupVisible: popupVisible,
    onPopupVisibleChange: onPopupVisibleChange,
    placement: placement,
    align: align,
    delay: delay,
    disabled: disabled,
    moveWithCursor: moveWithCursor,
    children: children
  });
}
function TooltipVideo(options) {
  const {
    src,
    loopGap,
    playbackRate = 1
  } = options;
  const loopTimer = useRef(-1);
  const videoElement = useRef(null);
  useEffect(() => {
    if (videoElement.current) {
      videoElement.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  const {
    loop,
    onEnded
  } = useMemo(() => {
    let loop = false;
    let onEnded = undefined;
    if (loopGap === undefined || loopGap <= 0) {
      loop = true;
    } else {
      loop = false;
      onEnded = () => {
        clearTimeout(loopTimer.current);
        loopTimer.current = window.setTimeout(() => {
          var _a;
          (_a = videoElement.current) === null || _a === void 0 ? void 0 : _a.play();
        }, loopGap);
      };
    }
    return {
      loop,
      onEnded
    };
  }, [loopGap, loopTimer]);
  useEffect(() => {
    return () => {
      clearTimeout(loopTimer.current);
    };
  }, []);
  return /*#__PURE__*/jsx("video", {
    ref: videoElement,
    src: src,
    autoPlay: true,
    muted: true,
    loop: loop,
    onEnded: onEnded
  });
}

export { Tooltip, TooltipTrigger };
//# sourceMappingURL=index.js.map
