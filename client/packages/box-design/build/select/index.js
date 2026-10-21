import { memo, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Menu } from '../menu/index.js';
import { Trigger } from '../trigger/index.js';
import style from './style.module.scss.js';
import { jsx, jsxs } from 'react/jsx-runtime';

function SelectView(props) {
  const {
    className: optionClassName,
    size = 'medium',
    onSelect,
    selection,
    disabled = false,
    items,
    mixed,
    placement = 'bottom',
    align = {
      offset: [0, 8]
    }
  } = props;
  const [expanded, setExpended] = useState(false);
  const selectRef = useRef(null);
  const className = useMemo(() => {
    const list = [style.select, optionClassName, style[size]];
    expanded && list.push(style.expanded);
    disabled ? list.push(style.disabled) : list.push(style.interactive);
    return list.join(' ');
  }, [optionClassName, size, expanded, disabled]);
  const onItemSelect = useCallback(options => {
    const {
      id: key
    } = options;
    onSelect({
      id: key
    });
    setExpended(false);
  }, [onSelect]);
  useEffect(() => {
    if (!selectRef.current) {
      return;
    }
    expanded && selectRef.current.focus();
  }, [expanded]);
  const selectedItem = useMemo(() => items.find(({
    id
  }) => id === selection), [items, selection]);
  const text = useMemo(() => {
    if (mixed) {
      return 'Mixed';
    }
    return selectedItem ? selectedItem.text : '';
  }, [selectedItem, mixed]);
  const component = /*#__PURE__*/jsx("div", {
    ref: selectRef,
    tabIndex: -1,
    className: className,
    children: /*#__PURE__*/jsxs("div", {
      className: style.content,
      children: [/*#__PURE__*/jsx("p", {
        children: text
      }), /*#__PURE__*/jsx("div", {
        className: style.collapse
      })]
    })
  });
  return /*#__PURE__*/jsx(Trigger, {
    action: ['click'],
    showAction: ['click'],
    hideAction: ['click'],
    placement: placement,
    align: align,
    delay: 0,
    onPopupVisibleChange: setExpended,
    popup: /*#__PURE__*/jsx(Menu, {
      items: items,
      selectedItem: selection,
      onItemSelect: id => onItemSelect({
        id
      })
    }),
    children: component
  });
}
const Select = /*#__PURE__*/memo(SelectView);

export { Select };
//# sourceMappingURL=index.js.map
