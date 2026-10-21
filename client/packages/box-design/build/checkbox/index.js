import { memo, useMemo, useCallback } from 'react';
import { IconDone } from '@box/icons';
import styles from './style.module.scss.js';
import { jsx } from 'react/jsx-runtime';

function CheckboxView(props) {
  const {
    value,
    mixed,
    onChange,
    size = 'large'
  } = props;
  const {
    child,
    className
  } = useMemo(() => {
    let child;
    const classNames = [styles.checkbox];
    classNames.push(styles[size]);
    if (mixed) {
      child = /*#__PURE__*/jsx("div", {
        className: styles.mixedChild
      });
      classNames.push(styles.mixed);
    } else if (value) {
      child = /*#__PURE__*/jsx(IconDone, {});
      classNames.push(styles.activated);
    }
    return {
      child,
      className: classNames.join(' ')
    };
  }, [size, mixed, value]);
  const onClick = useCallback(() => {
    onChange(!value, mixed);
  }, [onChange, value, mixed]);
  return /*#__PURE__*/jsx("div", {
    className: className,
    onClick: onClick,
    children: /*#__PURE__*/jsx("div", {
      className: styles.rect,
      children: child
    })
  });
}
const Checkbox = /*#__PURE__*/memo(CheckboxView);

export { Checkbox };
//# sourceMappingURL=index.js.map
