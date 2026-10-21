import { useContext, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { ToolbarMenuContext, SharedTipsContext } from '../context.js';
import { useSharedTipsDelay } from '../hooks.js';
import { Icon } from '../icon/index.js';
import { TooltipTrigger } from '../tooltip/index.js';
import { useInteraction, useClassName } from '../util.js';
import styles from './style.module.scss.js';
import SvgToolExpandNor from './tool-expand-nor.svg.js';
import { jsxs, jsx } from 'react/jsx-runtime';

function Toolbar(props) {
  const {
    children,
    className: OptionClassName,
    style,
    onSelect,
    defaultSelection,
    selection: optionSelection
  } = props;
  const className = useClassName([styles.toolbar, OptionClassName]);
  const onItemSelect = options => {
    const {
      id: key
    } = options;
    setSelection(key);
    onSelect({
      id: key
    });
  };
  const [selection, setSelection] = useState(() => {
    defaultSelection && onSelect({
      id: defaultSelection
    });
    return defaultSelection;
  });
  const selectedItem = optionSelection || selection;
  const sharedTipsDelay = useSharedTipsDelay();
  const {
    setDisplayed
  } = sharedTipsDelay;
  const onPointerLeave = useCallback(() => {
    setDisplayed(false);
  }, [setDisplayed]);
  return /*#__PURE__*/jsx(ToolbarMenuContext.Provider, {
    value: {
      selectedItem,
      onItemSelect
    },
    children: /*#__PURE__*/jsx(SharedTipsContext.Provider, {
      value: sharedTipsDelay,
      children: /*#__PURE__*/jsx("div", {
        className: className,
        style: style,
        onPointerLeave: onPointerLeave,
        children: children
      })
    })
  });
}
const TOOL_ITEM_CLASS = 'boxToolItem';
const SELECTED_TOOL_ITEM_CLASS = 'boxToolSelected';
function ToolItem(props) {
  const {
    id,
    icon: optionIcon,
    disabled = false,
    children,
    subSelections,
    tooltip,
    onItemClick,
    selectedItem: optionSelectedItem
  } = props;
  const {
    selectedItem,
    onItemSelect
  } = useContext(ToolbarMenuContext);
  const sharedTipsDelay = useContext(SharedTipsContext);
  const curSubSelectionIdx = useRef(0);
  const {
    selected,
    icon
  } = useMemo(() => {
    if (optionSelectedItem !== undefined && subSelections) {
      const idx = subSelections.findIndex(sub => {
        return sub.id === optionSelectedItem;
      });
      if (idx >= 0 && idx < subSelections.length) {
        curSubSelectionIdx.current = idx;
      }
      return {
        selected: false,
        icon: subSelections[curSubSelectionIdx.current].icon
      };
    }
    let newSelected = false;
    let icon = optionIcon;
    if (!subSelections) {
      newSelected = selectedItem === id;
    } else {
      let idx = subSelections.findIndex(sub => {
        return sub.id === selectedItem;
      });
      if (idx >= 0 && idx < subSelections.length) {
        curSubSelectionIdx.current = idx;
        newSelected = true;
      }
      icon = subSelections[curSubSelectionIdx.current].icon;
    }
    return {
      selected: newSelected,
      icon
    };
  }, [optionIcon, subSelections, selectedItem, optionSelectedItem, id]);
  const selection = useMemo(() => {
    if (!selected) {
      return;
    }
    return /*#__PURE__*/jsxs("div", {
      className: styles.selection,
      children: [/*#__PURE__*/jsx("div", {
        className: styles.cover
      }), /*#__PURE__*/jsx("div", {
        className: styles.bar
      })]
    });
  }, [selected]);
  const [expanded, setExpanded] = useState(false);
  const {
    setDisabled
  } = sharedTipsDelay;
  const expandIcon = useMemo(() => {
    if (typeof children === 'undefined') {
      return;
    }
    return /*#__PURE__*/jsx(SvgToolExpandNor, {
      className: styles.expandIcon,
      onPointerDown: evt => {
        evt.stopPropagation();
        setExpanded(true);
        setDisabled && setDisabled(true);
      }
    });
  }, [children, setExpanded, setDisabled]);
  const expansionRef = useRef(null);
  const expansion = useMemo(() => {
    if (!children || !expanded) {
      return;
    }
    return /*#__PURE__*/jsx("div", {
      ref: expansionRef,
      tabIndex: -1,
      className: styles.expansion,
      onBlur: () => {
        setExpanded(false);
        setDisabled && setDisabled(false);
      },
      onClick: evt => {
        evt.stopPropagation();
        setExpanded(false);
        setDisabled && setDisabled(false);
      },
      onPointerDown: evt => {
        evt.stopPropagation();
      },
      onPointerUp: evt => {
        evt.stopPropagation();
      },
      children: children
    });
  }, [expanded, children, setDisabled]);
  const className = useMemo(() => {
    const list = [styles.toolItem, TOOL_ITEM_CLASS];
    if (selected) {
      list.push(styles.selected, SELECTED_TOOL_ITEM_CLASS);
    } else if (!disabled) {
      list.push(styles.interactive);
    }
    if (disabled) {
      list.push(styles.disabled);
    }
    if (expanded) {
      list.push(styles.expanded);
    }
    return list.join(' ');
  }, [selected, disabled, expanded]);
  useEffect(() => {
    if (!expansionRef.current) {
      return;
    }
    expansionRef.current.focus();
  }, [expanded]);
  const {
    onStart,
    onEnd
  } = useInteraction({
    onLongPress: () => {
      if (!children) {
        return;
      }
      setExpanded(true);
    }
  });
  const onPointerDown = () => {
    if (disabled) {
      return;
    }
    onStart();
    if (subSelections) {
      const curSubSelection = subSelections[curSubSelectionIdx.current];
      onItemSelect({
        id: curSubSelection.id
      });
    } else {
      onItemSelect({
        id
      });
    }
  };
  const onClick = () => {
    if (!onItemClick || disabled || expanded) {
      return;
    }
    if (subSelections) {
      const curSubSelection = subSelections[curSubSelectionIdx.current];
      onItemClick(curSubSelection.id);
    } else {
      onItemClick(id);
    }
  };
  const {
    setDisplayed
  } = sharedTipsDelay;
  const onPopupVisibleChange = useCallback(visible => {
    if (visible) {
      setDisplayed(true);
    }
  }, [setDisplayed]);
  const iconNode = useMemo(() => {
    if (typeof icon === 'string') {
      return /*#__PURE__*/jsx(Icon, {
        className: styles.icon,
        symbolId: icon
      });
    }
    return icon;
  }, [icon]);
  const item = /*#__PURE__*/jsxs("div", {
    className: className,
    onPointerDown: onPointerDown,
    onPointerUp: onEnd,
    onClick: onClick,
    children: [!disabled && selection, /*#__PURE__*/jsxs("div", {
      className: styles.body,
      children: [iconNode, expandIcon, expansion]
    })]
  });
  if (tooltip) {
    const subSelectionId = subSelections ? subSelections[curSubSelectionIdx.current] : undefined;
    const options = tooltip instanceof Function ? tooltip(subSelectionId === null || subSelectionId === void 0 ? void 0 : subSelectionId.id) : tooltip;
    return /*#__PURE__*/jsx(TooltipTrigger, {
      ...options,
      delay: sharedTipsDelay.delay,
      disabled: sharedTipsDelay.disabled,
      className: styles.tooltip,
      align: {
        offset: [2]
      },
      onPopupVisibleChange: onPopupVisibleChange,
      children: item
    });
  } else {
    return item;
  }
}
function ToolbarGap(options) {
  const {
    className: optionClassName,
    style: optionStyle,
    height
  } = options;
  const className = useClassName([styles.gap, optionClassName], [optionClassName]);
  const style = useMemo(() => {
    return Object.assign(Object.assign({}, optionStyle), {
      height: `${height}px`
    });
  }, [optionStyle, height]);
  return /*#__PURE__*/jsx("div", {
    className: className,
    style: style
  });
}

export { SELECTED_TOOL_ITEM_CLASS, TOOL_ITEM_CLASS, ToolItem, Toolbar, ToolbarGap };
//# sourceMappingURL=index.js.map
