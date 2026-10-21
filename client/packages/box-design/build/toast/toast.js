import { memo, useState, useRef, useEffect, useMemo } from 'react';
import styles from './style.module.scss.js';
import { IconLoading, IconTipsInfoCircleFill, IconTipsExclamationCircleFill, IconTipsCloseCircleFill, IconTipsCheckCircleFill } from '@box/icons';
import { jsx, jsxs } from 'react/jsx-runtime';

const DEFAULT_DURATION = 3;
const DEFAULT_ANIMATION_TIME = 0.3;
const TYPE_ICON_MAP = {
  default: undefined,
  success: /*#__PURE__*/jsx(IconTipsCheckCircleFill, {
    className: styles.success
  }),
  error: /*#__PURE__*/jsx(IconTipsCloseCircleFill, {
    className: styles.error
  }),
  warning: /*#__PURE__*/jsx(IconTipsExclamationCircleFill, {
    className: styles.warning
  }),
  info: /*#__PURE__*/jsx(IconTipsInfoCircleFill, {
    className: styles.info
  }),
  loading: /*#__PURE__*/jsx(IconLoading, {
    className: styles.loading
  })
};
const MemoizedToast = /*#__PURE__*/memo(ToastView);
function ToastView(props) {
  const {
    type,
    content,
    description = '',
    duration = DEFAULT_DURATION,
    onClose
  } = props;
  const [willUnmount, setWillUnmount] = useState(false);
  const fadeOutTimer = useRef(-1);
  const closeTimer = useRef(-1);
  useEffect(() => {
    function beforeClose() {
      setWillUnmount(true);
      fadeOutTimer.current = window.setTimeout(() => {
        onClose && onClose();
      }, DEFAULT_ANIMATION_TIME * 1000);
    }
    function onStart() {
      if (duration <= 0) {
        return;
      }
      closeTimer.current = window.setTimeout(() => {
        beforeClose();
      }, (duration + DEFAULT_ANIMATION_TIME) * 1000);
    }
    onStart();
    return () => {
      window.clearTimeout(fadeOutTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, [duration, onClose]);
  const prefix = useMemo(() => {
    return TYPE_ICON_MAP[type] && /*#__PURE__*/jsx("div", {
      className: styles.prefix,
      children: TYPE_ICON_MAP[type]
    });
  }, [type]);
  const animatedClass = useMemo(() => {
    const classes = [styles.toast];
    willUnmount && classes.push(styles.fadeOut);
    return classes.join(' ');
  }, [willUnmount]);
  return /*#__PURE__*/jsxs("div", {
    className: animatedClass,
    children: [/*#__PURE__*/jsxs("div", {
      className: styles.title,
      children: [prefix, content]
    }), description && /*#__PURE__*/jsx("div", {
      className: styles.description,
      children: description
    })]
  });
}

export { DEFAULT_DURATION, MemoizedToast };
//# sourceMappingURL=toast.js.map
