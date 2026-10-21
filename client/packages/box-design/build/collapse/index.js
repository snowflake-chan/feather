import { useState, useMemo, useContext, createContext } from 'react';
import { Button } from '../button/index.js';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { jsx, jsxs } from 'react/jsx-runtime';

const CollapseContext = /*#__PURE__*/createContext({
  expandIcon: '',
  onChange: () => {},
  onArrowClicked: () => {},
  activeIds: []
});
function Collapse(props) {
  const {
    className: optionClassName,
    style,
    children,
    expandIcon,
    onChange,
    onArrowClicked,
    activeIds: optionActiveIds,
    defaultActiveIds,
    onMouseLeave,
    disabled
  } = props;
  const className = useClassName([optionClassName, styles.collapse], [optionClassName]);
  const [activeIds, setActiveIds] = useState(defaultActiveIds || []);
  const disabledMask = useMemo(() => {
    if (!disabled) {
      return;
    }
    return /*#__PURE__*/jsx("div", {
      className: styles.disabledMask
    });
  }, [disabled]);
  return /*#__PURE__*/jsx(CollapseContext.Provider, {
    value: {
      expandIcon,
      activeIds: optionActiveIds || activeIds,
      onChange: id => {
        setActiveIds(id);
        onChange && onChange(id);
      },
      onArrowClicked: (id, isExpanded) => {
        onArrowClicked && onArrowClicked(id, isExpanded);
      }
    },
    children: /*#__PURE__*/jsxs("div", {
      className: className,
      style: style,
      onMouseLeave: onMouseLeave,
      children: [children, disabledMask]
    })
  });
}
function CollapsePanel(props) {
  const {
    id,
    showArrow,
    showDivider = true,
    header,
    extra,
    children,
    className,
    style
  } = props;
  const {
    expandIcon,
    activeIds,
    onChange,
    onArrowClicked
  } = useContext(CollapseContext);
  const isExpanded = activeIds.includes(id);
  const arrow = useMemo(() => {
    return /*#__PURE__*/jsx(Button, {
      className: styles.expand,
      type: "icon",
      icon: expandIcon,
      style: {
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)'
      },
      onClick: () => {
        onArrowClicked(id, !isExpanded);
        const newActiveIds = isExpanded ? activeIds.filter(activeId => activeId !== id) : [...activeIds, id];
        onChange(newActiveIds);
      }
    });
  }, [expandIcon, isExpanded, onArrowClicked, id, activeIds, onChange]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    style: style,
    children: [/*#__PURE__*/jsxs("div", {
      className: styles.header,
      children: [/*#__PURE__*/jsxs("div", {
        className: styles.left,
        children: [(typeof showArrow === 'undefined' || showArrow) && arrow, header]
      }), isExpanded && extra]
    }), isExpanded && showDivider && /*#__PURE__*/jsx("div", {
      className: styles.divider
    }), isExpanded && children]
  });
}

export { Collapse, CollapsePanel };
//# sourceMappingURL=index.js.map
