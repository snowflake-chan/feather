import { useContext, useMemo, useState, useCallback, createContext } from 'react';
import { Button } from '../button/index.js';
import { TooltipTrigger } from '../tooltip/index.js';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { jsxs, jsx } from 'react/jsx-runtime';

const TabsContext = /*#__PURE__*/createContext({
  activeId: '',
  onChange: () => {},
  onTabClick: () => {}
});
function Tabs(options) {
  const {
    defaultActiveId,
    activeId: optionActiveId,
    onChange,
    onTabClick,
    children,
    className: optionClassName,
    style
  } = options;
  const className = useClassName([styles.tabNav, optionClassName], [optionClassName]);
  const [activeId, setActiveId] = useState(optionActiveId !== undefined ? optionActiveId : defaultActiveId);
  const currActiveId = useMemo(() => {
    return optionActiveId !== undefined ? optionActiveId : activeId;
  }, [optionActiveId, activeId]);
  const onActiveIdChange = useCallback(id => {
    setActiveId(id);
    onChange && onChange(id);
  }, [onChange]);
  return /*#__PURE__*/jsx(TabsContext.Provider, {
    value: {
      activeId: currActiveId,
      onChange: onActiveIdChange,
      onTabClick: id => {
        onTabClick && onTabClick(id);
      }
    },
    children: /*#__PURE__*/jsx("div", {
      className: className,
      style: style,
      children: children
    })
  });
}
function TabPanel(options) {
  const {
    id,
    type,
    icon,
    tab,
    className: optionClassName,
    style,
    disabled,
    tooltipTrigger
  } = options;
  const {
    activeId,
    onChange,
    onTabClick
  } = useContext(TabsContext);
  const isActive = id === activeId;
  const className = useMemo(() => {
    const list = [styles.tabPanel];
    type === 'text' && list.push(styles.tabText);
    type === 'icon' && list.push(styles.tabIcon);
    optionClassName && list.push(optionClassName);
    isActive && list.push(styles.activated);
    disabled && list.push(styles.disabled);
    return list.join(' ');
  }, [type, optionClassName, isActive, disabled]);
  const onClick = () => {
    if (disabled) {
      return;
    }
    onTabClick(id);
    if (id !== activeId) {
      onChange(id);
    }
  };
  const tabPanel = type === 'icon' ? /*#__PURE__*/jsxs(Button, {
    className: className,
    style: style,
    type: type,
    icon: icon,
    onClick: onClick,
    disabled: disabled,
    size: "small",
    children: [tab, options.children]
  }) : /*#__PURE__*/jsxs("div", {
    className: className,
    style: style,
    onClick: onClick,
    children: [tab, options.children, isActive && !disabled && /*#__PURE__*/jsx("div", {
      className: styles.selector
    })]
  });
  return tooltipTrigger ? /*#__PURE__*/jsx(TooltipTrigger, {
    ...tooltipTrigger,
    children: tabPanel
  }) : tabPanel;
}

export { TabPanel, Tabs };
//# sourceMappingURL=index.js.map
