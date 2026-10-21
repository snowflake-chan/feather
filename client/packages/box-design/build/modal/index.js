import { IconLoading, IconCancel, IconArrowBack } from '@box/icons';
import { useMemo, useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '../button/index.js';
import { Progress } from '../progress/index.js';
import styles from './style.module.scss.js';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const DEFAULT_CONFIRM_TEXT = 'confirm';
const DEFAULT_CANCEL_TEXT = 'cancel';
const CONTAINER_ID = 'boxModals';
const ModalView = props => {
  const {
    onBack,
    title,
    onClose,
    content,
    type = 'default',
    confirmText = DEFAULT_CONFIRM_TEXT,
    onConfirm,
    cancelText = DEFAULT_CANCEL_TEXT,
    onCancel,
    buttonSort = 'ltr',
    width: customWidth,
    className: optionClassName,
    style,
    rootClassName: optionRootClassName,
    rootStyle,
    confirmLoading
  } = props;
  const confirmBtn = useMemo(() => {
    if (!onConfirm) return;
    const onClick = () => {
      onConfirm && onConfirm();
    };
    const buttonType = type === 'default' ? 'primary' : 'warning';
    return /*#__PURE__*/jsx(Button, {
      className: styles.btn,
      type: buttonType,
      onClick: onClick,
      loading: confirmLoading,
      children: confirmText
    });
  }, [type, confirmText, onConfirm, confirmLoading]);
  const cancelBtn = useMemo(() => {
    if (!onCancel) return;
    const onClick = () => {
      onCancel && onCancel();
    };
    return /*#__PURE__*/jsx(Button, {
      className: styles.btn,
      type: "secondary",
      onClick: onClick,
      children: cancelText
    });
  }, [cancelText, onCancel]);
  const buttons = buttonSort === 'ltr' ? /*#__PURE__*/jsxs(Fragment, {
    children: [confirmBtn, cancelBtn]
  }) : /*#__PURE__*/jsxs(Fragment, {
    children: [cancelBtn, confirmBtn]
  });
  const rootClassName = useMemo(() => {
    return optionRootClassName || '';
  }, [optionRootClassName]);
  const className = useMemo(() => {
    return optionClassName || '';
  }, [optionClassName]);
  return /*#__PURE__*/jsxs("div", {
    className: `${styles.modal} ${rootClassName}`,
    style: rootStyle,
    children: [/*#__PURE__*/jsx("div", {
      className: styles.mask
    }), /*#__PURE__*/jsxs("div", {
      className: `${styles.body} ${className}`,
      style: Object.assign({
        width: customWidth
      }, style),
      children: [/*#__PURE__*/jsxs("div", {
        className: styles.main,
        children: [/*#__PURE__*/jsxs("div", {
          className: styles.header,
          children: [/*#__PURE__*/jsxs("div", {
            className: styles.headerLeft,
            children: [onBack && /*#__PURE__*/jsx(IconArrowBack, {
              className: styles.backIcon,
              onClick: () => {
                onBack();
              }
            }), /*#__PURE__*/jsx("div", {
              className: styles.titleContainer,
              children: /*#__PURE__*/jsx("div", {
                className: styles.title,
                children: title
              })
            })]
          }), onClose && /*#__PURE__*/jsx(IconCancel, {
            onClick: () => {
              onClose();
            }
          })]
        }), content !== undefined && /*#__PURE__*/jsx("div", {
          className: styles.content,
          children: content
        })]
      }), (onCancel || onConfirm) && /*#__PURE__*/jsx("div", {
        className: styles.footer,
        children: buttons
      })]
    })]
  });
};
const LoadingModalView = props => {
  const {
    content,
    className: optionClassName,
    cancellableDelay = 0,
    progress = false,
    onCancel
  } = props;
  const className = useMemo(() => {
    const list = [styles.modal, styles.loading, optionClassName];
    if (progress) {
      list.push(styles.progress);
    }
    return list.join(' ');
  }, [optionClassName, progress]);
  const [cancellable, setCancellable] = useState(cancellableDelay === 0);
  const cancellableTimer = useRef(-1);
  useEffect(() => {
    clearTimeout(cancellableTimer.current);
    if (!cancellable && cancellableDelay > 0) {
      cancellableTimer.current = window.setTimeout(() => setCancellable(true), cancellableDelay);
    }
    return () => {
      clearTimeout(cancellableTimer.current);
    };
  }, [cancellableDelay, cancellable]);
  const animation = useMemo(() => {
    if (!progress) {
      return /*#__PURE__*/jsx(IconLoading, {
        className: styles.loading
      });
    }
    return /*#__PURE__*/jsx(Progress, {
      ...progress
    });
  }, [progress]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    children: [/*#__PURE__*/jsx("div", {
      className: styles.mask
    }), /*#__PURE__*/jsx("div", {
      className: styles.body,
      children: /*#__PURE__*/jsxs("div", {
        className: styles.main,
        children: [cancellable && /*#__PURE__*/jsx(IconCancel, {
          className: styles.close,
          onClick: onCancel
        }), animation, /*#__PURE__*/jsx("div", {
          className: styles.content,
          children: content
        })]
      })
    })]
  });
};
function getRootContainer() {
  let rootModalContainer = document.querySelector(`#${CONTAINER_ID}`);
  if (!rootModalContainer) {
    rootModalContainer = document.createElement('div');
    rootModalContainer.id = CONTAINER_ID;
    document.body.appendChild(rootModalContainer);
  }
  return rootModalContainer;
}
const DestroyFns = [];
function destroyAll() {
  DestroyFns.forEach(fn => fn());
}
function show(option) {
  const container = document.createElement('div');
  const rootContainer = getRootContainer();
  let modal;
  if (option.type === 'loading') {
    modal = /*#__PURE__*/jsx(LoadingModalView, {
      ...option
    });
  } else {
    modal = /*#__PURE__*/jsx(ModalView, {
      ...option
    });
  }
  const root = createRoot(container);
  root.render(modal);
  rootContainer.appendChild(container);
  const destroy = () => {
    root.unmount();
    rootContainer.removeChild(container);
    const idx = DestroyFns.findIndex(fn => fn === destroy);
    if (idx > -1) {
      DestroyFns.splice(idx, 1);
    }
  };
  DestroyFns.push(destroy);
  return destroy;
}
const Modal = {
  show,
  destroyAll
};

export { LoadingModalView, Modal, ModalView };
//# sourceMappingURL=index.js.map
