import 'react';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { jsx } from 'react/jsx-runtime';

const BOX_ICON_CLASS = 'boxIcon';
function Icon(option) {
  const {
    symbolId,
    className: optionClassName,
    style
  } = option;
  const className = useClassName([styles.icon, BOX_ICON_CLASS, optionClassName], [optionClassName]);
  return /*#__PURE__*/jsx("svg", {
    className: className,
    style: style,
    children: /*#__PURE__*/jsx("use", {
      xlinkHref: symbolId
    })
  });
}

export { BOX_ICON_CLASS, Icon };
//# sourceMappingURL=index.js.map
