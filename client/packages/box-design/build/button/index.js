import { __rest } from 'tslib';
import { memo, forwardRef, useMemo } from 'react';
import { Icon } from '../icon/index.js';
import styles from './style.module.scss.js';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const BUTTON_CLASS = 'boxButton';
function ButtonView(props, ref) {
  const {
      className: optionClassName,
      type = 'primary',
      size = 'medium',
      activated,
      background,
      loading,
      icon,
      children,
      disabled
    } = props,
    remains = __rest(props, ["className", "type", "size", "activated", "background", "loading", "icon", "children", "disabled"]);
  const classNames = useMemo(() => {
    const list = [styles.button, optionClassName, styles[type], BUTTON_CLASS];
    size !== 'custom' && list.push(styles[size]);
    loading && list.push(styles.loading);
    background && list.push(styles.background);
    !disabled && activated && list.push(styles.activated);
    return list.join(' ');
  }, [optionClassName, type, size, loading, background, disabled, activated]);
  const iconNode = useMemo(() => {
    if (!icon) {
      return;
    }
    if (typeof icon === 'string') {
      return /*#__PURE__*/jsx(Icon, {
        symbolId: icon
      });
    }
    return icon;
  }, [icon]);
  const content = loading ? undefined : /*#__PURE__*/jsxs(Fragment, {
    children: [iconNode, background && /*#__PURE__*/jsx("div", {
      className: styles.selectedBar
    }), children && /*#__PURE__*/jsx("p", {
      children: children
    })]
  });
  return /*#__PURE__*/jsx("button", {
    ref: ref,
    ...remains,
    className: classNames,
    disabled: disabled,
    children: content
  });
}
const Button = /*#__PURE__*/memo(/*#__PURE__*/forwardRef(ButtonView));

export { Button };
//# sourceMappingURL=index.js.map
