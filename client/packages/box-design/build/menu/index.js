import { forwardRef, useContext, useMemo, useRef, useCallback, useState, createContext } from 'react';
import { Icon } from '../icon/index.js';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { Trigger } from '../trigger/index.js';
import SvgToolExpandNor from '../toolbar/tool-expand-nor.svg.js';
import { jsxs, jsx } from 'react/jsx-runtime';

const MenuContext = /*#__PURE__*/createContext({
  selectedItem: undefined,
  onItemSelect: () => {}
});
const MENU_CLASS = 'boxMenu';
const MENU_ITEM_CLASS = 'boxMenuItem';
function MenuView(props, ref) {
  const {
    className: optionClassName,
    style,
    items: itemOptions,
    selectedItem: optionSelectedItem,
    onItemSelect: optionOnItemSelect
  } = props;
  const [innerSelected, setInnerSelected] = useState();
  const contextValue = useMemo(() => {
    const selectedItem = optionSelectedItem !== undefined ? optionSelectedItem : innerSelected;
    const onItemSelect = (id, e) => {
      setInnerSelected(id);
      optionOnItemSelect(id, e);
    };
    return {
      selectedItem,
      onItemSelect
    };
  }, [optionSelectedItem, innerSelected, setInnerSelected, optionOnItemSelect]);
  const className = useClassName([styles.menu, optionClassName, MENU_CLASS], [optionClassName]);
  const children = useMemo(() => itemOptions.map(itemOption => /*#__PURE__*/jsx(MenuItem, {
    ...itemOption
  }, itemOption.id)), [itemOptions]);
  return /*#__PURE__*/jsx(MenuContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/jsx("div", {
      className: className,
      style: style,
      ref: ref,
      children: children
    })
  });
}
const Menu = /*#__PURE__*/forwardRef(MenuView);
function MenuItem(props) {
  const {
    id,
    icon,
    text,
    className: optionClassName,
    disabled,
    items
  } = props;
  const {
    selectedItem,
    onItemSelect
  } = useContext(MenuContext);
  const selected = selectedItem === id;
  const itemClassName = useMemo(() => {
    const list = [styles.menuItem, optionClassName, MENU_ITEM_CLASS];
    if (disabled) {
      list.push(styles.disabled);
    }
    return list.join(' ');
  }, [optionClassName, disabled]);
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
  const finalIcon = useMemo(() => typeof icon === 'string' ? /*#__PURE__*/jsx(Icon, {
    className: styles.icon,
    symbolId: icon
  }) : icon instanceof Object ? /*#__PURE__*/jsx("div", {
    className: styles.icon,
    children: icon
  }) : null, [icon]);
  const ref = useRef(null);
  const itemLength = (items === null || items === void 0 ? void 0 : items.length) || 0;
  const triggerNode = useMemo(() => {
    const content = /*#__PURE__*/jsxs("div", {
      className: itemClassName,
      children: [selection, finalIcon, /*#__PURE__*/jsx("p", {
        children: text
      }), itemLength > 0 && /*#__PURE__*/jsx(SvgToolExpandNor, {
        className: styles.expandArrow
      })]
    });
    if (!items || items.length === 0) {
      return content;
    }
    return /*#__PURE__*/jsx(Trigger, {
      popup: /*#__PURE__*/jsx(Menu, {
        items: items || [],
        onItemSelect: onItemSelect,
        selectedItem: ''
      }),
      showAction: ['click', 'hover'],
      hideAction: ['hover'],
      placement: "rightTop",
      getPortalContainer: () => ref.current || undefined,
      align: {
        offset: [8, -4]
      },
      delay: 0,
      children: content
    });
  }, [itemClassName, selection, finalIcon, text, itemLength, items, onItemSelect]);
  const onClick = useCallback(e => {
    e.preventDefault();
    if (disabled) {
      return;
    }
    onItemSelect(id, e);
  }, [onItemSelect, disabled, id]);
  return /*#__PURE__*/jsx("div", {
    ref: ref,
    style: {
      position: 'relative'
    },
    onClick: onClick,
    children: triggerNode
  });
}

export { Menu, MenuItem };
//# sourceMappingURL=index.js.map
