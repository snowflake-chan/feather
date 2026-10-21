import { useRef, useState, useEffect, useMemo, useCallback, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';

const DISPATCH_DELAY = 50;
const DEFAULT_DELAY = 500 - DISPATCH_DELAY;
const CURSOR_SIZE = [35, 35];
function Trigger(options) {
  const {
    children,
    action = ['hover'],
    showAction = [],
    hideAction = ['blur'],
    popup,
    onPopupVisibleChange,
    onPopupBlur,
    popupVisible: optionPopupVisible,
    delay = DEFAULT_DELAY,
    placement = 'rightTop',
    align,
    disabled = false,
    moveWithCursor,
    getPortalContainer
  } = options;
  const popupSize = useRef(undefined);
  const [cursorPosition, setCursorPosition] = useState();
  useEffect(() => {
    setCursorPosition(moveWithCursor);
  }, [moveWithCursor]);
  const [innerVisible, setInnerVisible] = useState(false);
  const toShowOnMouseEnter = showAction.includes('hover') || action.includes('hover');
  const toHideOnMouseLeave = hideAction.includes('hover') || action.includes('hover');
  const toShowOnClick = showAction.includes('click') || action.includes('click');
  const toHideOnClick = hideAction.includes('click') || action.includes('click');
  const toHideOnBlur = hideAction.includes('blur');
  const mergedVisible = useMemo(() => {
    if (optionPopupVisible !== undefined) {
      return optionPopupVisible;
    }
    return innerVisible;
  }, [optionPopupVisible, innerVisible]);
  useEffect(() => {
    onPopupVisibleChange && onPopupVisibleChange(mergedVisible);
  }, [mergedVisible, onPopupVisibleChange]);
  const triggerRef = useRef(null);
  const timer = useRef(-1);
  const clearTimer = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = -1;
  }, []);
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);
  const dispatchTimer = useRef(-1);
  useEffect(() => {
    return () => {
      clearTimeout(dispatchTimer.current);
    };
  }, []);
  const {
    showPopup,
    hidePopup,
    setTimer
  } = useMemo(() => {
    function setTimer() {
      clearTimer();
      timer.current = window.setTimeout(() => {
        showPopup();
      }, delay);
    }
    function showPopup() {
      clearTimer();
      clearTimeout(dispatchTimer.current);
      if (innerVisible) {
        return;
      }
      dispatchTimer.current = window.setTimeout(() => {
        setInnerVisible(true);
      }, DISPATCH_DELAY);
    }
    function hidePopup() {
      clearTimer();
      clearTimeout(dispatchTimer.current);
      if (!innerVisible) {
        return;
      }
      dispatchTimer.current = window.setTimeout(() => {
        setInnerVisible(false);
      }, DISPATCH_DELAY);
    }
    return {
      showPopup,
      hidePopup,
      setTimer
    };
  }, [delay, clearTimer, dispatchTimer, innerVisible]);
  const popupContainerRef = useRef(null);
  const adaptPopup = useCallback(popupNode => {
    if (!popupNode || !triggerRef.current) {
      return;
    }
    if (!popupSize.current) {
      const popupRect = popupNode.getBoundingClientRect();
      popupSize.current = {
        popupHeight: popupRect.height,
        popupWidth: popupRect.width
      };
    }
    let targetRect;
    if (cursorPosition) {
      targetRect = {
        targetLeft: cursorPosition[0],
        targetTop: cursorPosition[1],
        targetWidth: CURSOR_SIZE[0],
        targetHeight: CURSOR_SIZE[1]
      };
    } else {
      const rect = triggerRef.current.getBoundingClientRect();
      targetRect = {
        targetLeft: rect.left,
        targetTop: rect.top,
        targetWidth: rect.width,
        targetHeight: rect.height
      };
    }
    const positionStyle = getPosition(targetRect, popupSize.current, placement, align);
    Object.assign(popupNode.style, positionStyle);
    popupNode.focus();
  }, [placement, align, cursorPosition]);
  const popupPortal = useMemo(() => {
    if (disabled || !mergedVisible) {
      return;
    }
    const style = {
      position: 'fixed',
      zIndex: '11',
      outline: 'none'
    };
    const onBlur = () => {
      if (!toHideOnBlur) {
        return;
      }
      hidePopup();
      onPopupBlur && onPopupBlur();
    };
    const portalContainer = (getPortalContainer === null || getPortalContainer === void 0 ? void 0 : getPortalContainer()) || document.body;
    const popupContainer = /*#__PURE__*/jsx("div", {
      style: style,
      ref: popupContainerRef,
      tabIndex: -1,
      onMouseEnter: () => {
        toShowOnMouseEnter && showPopup();
      },
      onMouseLeave: () => {
        toHideOnMouseLeave && hidePopup();
      },
      onBlur: onBlur,
      onClick: () => {
        toHideOnClick && hidePopup();
      },
      children: popup
    });
    return /*#__PURE__*/createPortal(popupContainer, portalContainer);
  }, [mergedVisible, popup, hidePopup, showPopup, disabled, toHideOnMouseLeave, toShowOnMouseEnter, onPopupBlur, toHideOnBlur, getPortalContainer, toHideOnClick]);
  useEffect(() => {
    popupContainerRef.current && adaptPopup(popupContainerRef.current);
  }, [adaptPopup, popupPortal]);
  const onDocumentMouseDown = useCallback(e => {
    var _a, _b;
    if (!(e.target instanceof Node) || !((_a = triggerRef.current) === null || _a === void 0 ? void 0 : _a.contains(e.target)) && !((_b = popupContainerRef.current) === null || _b === void 0 ? void 0 : _b.contains(e.target))) {
      setInnerVisible(false);
    }
  }, []);
  useEffect(() => {
    if (mergedVisible && toHideOnClick) {
      document.addEventListener('mousedown', onDocumentMouseDown);
    }
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
    };
  }, [mergedVisible, onDocumentMouseDown, toHideOnClick]);
  const onMouseMove = useCallback(ev => {
    if (!moveWithCursor || !mergedVisible || disabled) {
      return;
    }
    setCursorPosition([ev.clientX, ev.clientY]);
  }, [moveWithCursor, mergedVisible, disabled]);
  useEffect(() => {
    if (!moveWithCursor || !mergedVisible || disabled) {
      return;
    }
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      popupSize.current = undefined;
      setCursorPosition(undefined);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [moveWithCursor, mergedVisible, disabled, onMouseMove]);
  const {
    onMouseEnter: childrenMouseEnter,
    onMouseLeave: childrenMouseLeave,
    onClick: childrenClick,
    className: childrenClassName
  } = (children === null || children === void 0 ? void 0 : children.props) || {};
  const onMouseEnter = useCallback(evt => {
    if (!toShowOnMouseEnter) {
      return;
    }
    if (!disabled) {
      innerVisible ? showPopup() : setTimer();
    }
    childrenMouseEnter && childrenMouseEnter(evt);
  }, [disabled, innerVisible, childrenMouseEnter, setTimer, showPopup, toShowOnMouseEnter]);
  const onMouseLeave = useCallback(evt => {
    if (!toHideOnMouseLeave) {
      return;
    }
    clearTimer();
    hidePopup();
    childrenMouseLeave && childrenMouseLeave(evt);
  }, [clearTimer, hidePopup, childrenMouseLeave, toHideOnMouseLeave]);
  const onClick = useCallback(evt => {
    clearTimer();
    if (!mergedVisible && toShowOnClick) {
      setTimer();
    } else if (mergedVisible && toHideOnClick) {
      hidePopup();
    }
    childrenClick && childrenClick(evt);
  }, [clearTimer, setTimer, childrenClick, toShowOnClick, mergedVisible, hidePopup, toHideOnClick]);
  const clonedChildren = children && /*#__PURE__*/cloneElement(children, {
    onMouseEnter,
    onMouseLeave,
    onClick,
    className: childrenClassName,
    ref: triggerRef
  });
  return /*#__PURE__*/jsxs(Fragment, {
    children: [popupPortal, clonedChildren]
  });
}
function getPosition(targetRect, popupSize, placement, align) {
  const {
    targetLeft,
    targetTop,
    targetWidth,
    targetHeight
  } = targetRect;
  const {
    popupWidth,
    popupHeight
  } = popupSize;
  let left = 0;
  let top = 0;
  switch (placement) {
    case 'rightTop':
      left = targetLeft + targetWidth;
      top = targetTop;
      break;
    case 'bottomLeft':
      left = targetLeft;
      top = targetTop + targetHeight;
      break;
    case 'bottomRight':
      left = targetLeft - (popupWidth - targetWidth);
      top = targetTop + targetHeight;
      break;
    case 'topLeft':
      left = targetLeft;
      top = targetTop - popupHeight;
      break;
    case 'top':
      left = targetLeft - (popupWidth - targetWidth) / 2;
      top = targetTop - popupHeight;
      break;
    case 'topRight':
      left = targetLeft - (popupWidth - targetWidth);
      top = targetTop - popupHeight;
      break;
    case 'bottom':
      left = targetLeft - (popupWidth - targetWidth) / 2;
      top = targetTop + targetHeight;
      break;
  }
  if (align) {
    const [offsetX = 0, offsetY = 0] = align.offset;
    left += offsetX;
    top += offsetY;
  }
  const {
    innerWidth,
    innerHeight
  } = window;
  if (left < 0) {
    left = 0;
  } else if (left + popupWidth > innerWidth) {
    left = innerWidth - popupWidth;
  }
  if (top < 0) {
    top = 0;
  } else if (top + popupHeight > innerHeight) {
    top = innerHeight - popupHeight;
  }
  return {
    left: `${left}px`,
    top: `${top}px`
  };
}

export { Trigger };
//# sourceMappingURL=index.js.map
