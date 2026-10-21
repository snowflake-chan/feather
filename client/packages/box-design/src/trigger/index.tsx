import React, {
  cloneElement,
  ReactElement,
  useMemo,
  useRef,
  useState,
  CSSProperties,
  ReactPortal,
  useEffect,
  ReactNode,
  useCallback,
  MutableRefObject,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * showPopup和hidePopup的延迟。
 * 因为popup与target之间会存在一段距离，在这段距离会触发mouseLeave。
 * 在target跟popup来回移动时，有可能导致popup“意外”消失。增加一点延时来“容错”。
 */
const DISPATCH_DELAY = 50;

/**
 * 原设计是500ms，考虑dispatch delay
 * 所以为 500 - DISPATCH_DELAY;
 */
const DEFAULT_DELAY = 500 - DISPATCH_DELAY;

/**
 * 光标的大小，offset已经计算在内。
 */
const CURSOR_SIZE = [35, 35];

/**
 * 气泡位置类型。
 * TODO 目前只实现要用的几种。
 * - 'rightTop'，右上
 * - 'bottomLeft'，下左
 * - 'bottom'，底部居中
 * - 'top'，顶部居中
 * - 'topLeft'，顶部左边缘对齐
 * - 'topRight'，顶部右边缘对齐
 */
export type Placement =
  | 'rightTop'
  | 'bottomLeft'
  | 'bottomRight'
  | 'bottom'
  | 'top'
  | 'topLeft'
  | 'topRight';

export type AlignType = {
  /**
   * 位置偏差，首位为left的偏差，第二位为top的偏差。
   */
  offset: number[];
};

export type TriggerChildren = ReactElement<{
  className?: string;
  onClick?: (evt: MouseEvent) => void;
  onMouseEnter?: (evt: MouseEvent) => void;
  onMouseLeave?: (evt: MouseEvent) => void;
  ref?: MutableRefObject<HTMLElement | null>;
}>;

export type TriggerActionType = 'click' | 'hover' | 'blur' | 'focus';

export interface TriggerOptions {
  /**
   * 触发弹层展示和消失的类型。
   * @default ['hover']
   */
  action?: TriggerActionType[];
  /**
   * 触发弹层展示的类型
   * @default undefined
   */
  showAction?: TriggerActionType[];
  /**
   * 触发弹层消失的类型
   * @default ['blur']
   */
  hideAction?: TriggerActionType[];
  /**
   * 弹出的组件可见性变化时的钩子。
   */
  onPopupVisibleChange?: (visible: boolean) => void;
  /**
   * 弹出的组件失焦时的钩子。弹出组件在出现时会自动聚焦。
   */
  onPopupBlur?: () => void;
  /**
   * 弹出的组件是否可见
   * 如果指定该值，则完全由该值决定
   * @default undefined
   */
  popupVisible?: boolean;
  /**
   * 延迟触发的时间
   * @default 500ms
   */
  delay?: number;
  /**
   * “提示”的位置。
   * @default 'rightTop'
   */
  placement?: Placement;
  /**
   * “提示”的对齐调整。比如偏差。
   */
  align?: AlignType;
  /**
   * 是否禁用提示以及自动显示
   * @default false
   */
  disabled?: boolean;
  /**
   * “提示”位置是否跟随光标移动，如果是，传入光标的初始位置
   * @default undefined
   */
  moveWithCursor?: [number, number];
  /**
   * 获取挂载popupContainer的容器的方法，如果不传或者结果是undefined，则挂载到document.body上
   * @default undefined
   */
  getPortalContainer?: () => HTMLElement | undefined;
}

interface TriggerProps extends TriggerOptions {
  /**
   * 应用触发器的元素。必须要支持传入`onMouseEnter`、`onMouseLeave`、`onClick`。
   * 以及支持设置ref。
   */
  children?: TriggerChildren;
  /**
   * 弹出的组件
   */
  popup: ReactNode;
}

/**
 * 触发器组件。
 * 代理children的一些交互事件（见TriggerOptions），控制弹出的组件。
 *
 * 使用方式
 * <Trigger popup={Tooltip}>
 *  <Target />
 * </Trigger>
 */
export function Trigger(options: TriggerProps) {
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
    getPortalContainer,
  } = options;

  const popupSize = useRef<PopupSize>(undefined);
  const [cursorPosition, setCursorPosition] = useState<
    [number, number] | undefined
  >();

  useEffect(() => {
    setCursorPosition(moveWithCursor);
  }, [moveWithCursor]);

  const [innerVisible, setInnerVisible] = useState(false);

  const toShowOnMouseEnter =
    showAction.includes('hover') || action.includes('hover');
  const toHideOnMouseLeave =
    hideAction.includes('hover') || action.includes('hover');
  const toShowOnClick =
    showAction.includes('click') || action.includes('click');
  const toHideOnClick =
    hideAction.includes('click') || action.includes('click');
  const toHideOnBlur = hideAction.includes('blur');

  /**
   * popup的可见性，由参数的popupVisible和innerVisible共同决定。
   * popupVisible优先级高于innerVisible。
   */
  const mergedVisible = useMemo(() => {
    if (optionPopupVisible !== undefined) {
      return optionPopupVisible;
    }

    return innerVisible;
  }, [optionPopupVisible, innerVisible]);

  useEffect(() => {
    onPopupVisibleChange && onPopupVisibleChange(mergedVisible);
  }, [mergedVisible, onPopupVisibleChange]);

  /**
   * 通过ref来查询target的DOM
   * TODO 目前的做法会直接替换掉传给children的ref。需要参照rc-trigger的做法，做兼容处理。
   */
  const triggerRef = useRef<HTMLElement | null>(null);

  const timer = useRef(-1);

  const clearTimer = useCallback(() => {
    clearTimeout(timer.current);

    timer.current = -1;
  }, []);

  /**
   * 卸载组件时，做一次清理，以防万一
   * 由于clearTimer不会被更新。所以只有卸载组件时会触发。
   */
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

  const { showPopup, hidePopup, setTimer } = useMemo(() => {
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

    return { showPopup, hidePopup, setTimer };
  }, [delay, clearTimer, dispatchTimer, innerVisible]);

  const popupContainerRef = useRef<HTMLDivElement>(null);

  const adaptPopup = useCallback(
    (popupNode: HTMLDivElement) => {
      if (!popupNode || !triggerRef.current) {
        return;
      }

      if (!popupSize.current) {
        const popupRect = popupNode.getBoundingClientRect();
        popupSize.current = {
          popupHeight: popupRect.height,
          popupWidth: popupRect.width,
        };
      }

      let targetRect: TargetRect;
      if (cursorPosition) {
        // 根据光标定位
        targetRect = {
          targetLeft: cursorPosition[0],
          targetTop: cursorPosition[1],
          targetWidth: CURSOR_SIZE[0],
          targetHeight: CURSOR_SIZE[1],
        };
      } else {
        // 根据target定位
        const rect = triggerRef.current.getBoundingClientRect();
        targetRect = {
          targetLeft: rect.left,
          targetTop: rect.top,
          targetWidth: rect.width,
          targetHeight: rect.height,
        };
      }

      const positionStyle = getPosition(
        targetRect,
        popupSize.current,
        placement,
        align,
      );

      Object.assign(popupNode.style, positionStyle);

      popupNode.focus();
    },
    [placement, align, cursorPosition],
  );

  const popupPortal = useMemo<ReactPortal | HTMLElement | undefined>(() => {
    if (disabled || !mergedVisible) {
      return;
    }

    const style: CSSProperties = {
      position: 'fixed',
      zIndex: '11',
      outline: 'none',
    };

    const onBlur = () => {
      if (!toHideOnBlur) {
        return;
      }

      hidePopup();
      onPopupBlur && onPopupBlur();
    };

    const portalContainer = getPortalContainer?.() || document.body;

    const popupContainer = (
      <div
        style={style}
        ref={popupContainerRef}
        tabIndex={-1}
        onMouseEnter={() => {
          toShowOnMouseEnter && showPopup();
        }}
        onMouseLeave={() => {
          toHideOnMouseLeave && hidePopup();
        }}
        onBlur={onBlur}
        onClick={() => {
          // TODO 这个处理会导致二级菜单的传递问题。得再看看怎么解决好些
          toHideOnClick && hidePopup();
        }}
      >
        {popup}
      </div>
    );

    return createPortal(popupContainer, portalContainer);
  }, [
    mergedVisible,
    popup,
    hidePopup,
    showPopup,
    disabled,
    toHideOnMouseLeave,
    toShowOnMouseEnter,
    onPopupBlur,
    toHideOnBlur,
    getPortalContainer,
    toHideOnClick,
  ]);

  useEffect(() => {
    popupContainerRef.current && adaptPopup(popupContainerRef.current);
  }, [adaptPopup, popupPortal]);

  // 通过监听document的mousedown，判断是否点击到popup以外的元素
  const onDocumentMouseDown = useCallback((e: MouseEvent) => {
    if (
      !(e.target instanceof Node) ||
      (!triggerRef.current?.contains(e.target) &&
        !popupContainerRef.current?.contains(e.target))
    ) {
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

  const onMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (!moveWithCursor || !mergedVisible || disabled) {
        return;
      }

      setCursorPosition([ev.clientX, ev.clientY]);
    },
    [moveWithCursor, mergedVisible, disabled],
  );

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
    className: childrenClassName,
  } = children?.props || {};

  const onMouseEnter = useCallback(
    (evt: MouseEvent) => {
      if (!toShowOnMouseEnter) {
        return;
      }

      if (!disabled) {
        innerVisible ? showPopup() : setTimer();
      }

      childrenMouseEnter && childrenMouseEnter(evt);
    },
    [
      disabled,
      innerVisible,
      childrenMouseEnter,
      setTimer,
      showPopup,
      toShowOnMouseEnter,
    ],
  );

  const onMouseLeave = useCallback(
    (evt: MouseEvent) => {
      if (!toHideOnMouseLeave) {
        return;
      }

      clearTimer();
      hidePopup();

      childrenMouseLeave && childrenMouseLeave(evt);
    },
    [clearTimer, hidePopup, childrenMouseLeave, toHideOnMouseLeave],
  );

  const onClick = useCallback(
    (evt: MouseEvent) => {
      clearTimer();

      if (!mergedVisible && toShowOnClick) {
        setTimer();
      } else if (mergedVisible && toHideOnClick) {
        hidePopup();
      }

      childrenClick && childrenClick(evt);
    },
    [
      clearTimer,
      setTimer,
      childrenClick,
      toShowOnClick,
      mergedVisible,
      hidePopup,
      toHideOnClick,
    ],
  );

  const clonedChildren =
    children &&
    cloneElement(children, {
      onMouseEnter,
      onMouseLeave,
      onClick,
      className: childrenClassName,
      ref: triggerRef,
    });

  return (
    <>
      {popupPortal}
      {clonedChildren}
    </>
  );
}

type TargetRect = {
  targetLeft: number;
  targetTop: number;
  targetWidth: number;
  targetHeight: number;
};

type PopupSize = {
  popupWidth: number;
  popupHeight: number;
};

/**
 * 根据定位的元素和弹层元素的位置和大小，计算出对应placement和align的位置。
 * 并且不超出window。
 * @param targetRect
 * @param popupRect
 * @param placement
 * @param align
 * @returns
 */
function getPosition(
  targetRect: TargetRect,
  popupSize: PopupSize,
  placement: Placement,
  align?: AlignType,
): CSSProperties {
  const { targetLeft, targetTop, targetWidth, targetHeight } = targetRect;

  const { popupWidth, popupHeight } = popupSize;

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

  const { innerWidth, innerHeight } = window;

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
    top: `${top}px`,
  };
}
