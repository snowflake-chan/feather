import React__default, { useMemo } from 'react';
import styles from './style.module.scss.js';
import { jsx } from 'react/jsx-runtime';

function Switch(options) {
  const {
    defaultChecked = false,
    className: optionClassName,
    style,
    checked: optionChecked,
    onChange
  } = options;
  const [innerChecked, setInnerChecked] = React__default.useState(defaultChecked);
  const checked = optionChecked === undefined ? innerChecked : optionChecked;
  const className = useMemo(() => {
    const list = [styles.switch];
    if (optionClassName) {
      list.push(optionClassName);
    }
    if (checked) {
      list.push(styles.checked);
    }
    return list.join(' ');
  }, [optionClassName, checked]);
  return /*#__PURE__*/jsx("div", {
    className: className,
    style: style,
    onClick: () => {
      setInnerChecked(!checked);
      onChange && onChange(!checked);
    },
    children: /*#__PURE__*/jsx("div", {
      className: styles.background,
      children: /*#__PURE__*/jsx("div", {
        className: styles.thumb
      })
    })
  });
}

export { Switch };
//# sourceMappingURL=index.js.map
