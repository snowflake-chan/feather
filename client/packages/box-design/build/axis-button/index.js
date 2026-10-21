import { memo, useMemo } from 'react';
import { AXIS } from '../interfaces.js';
import { TooltipTrigger } from '../tooltip/index.js';
import { useClassName } from '../util.js';
import styles from './style.module.scss.js';
import { jsx, jsxs } from 'react/jsx-runtime';

const DEFAULT_SETTING = {
  X: false,
  Y: false,
  Z: false
};
const AxisButtons = /*#__PURE__*/memo(AxisButtonsView);
function AxisButtonsView(props) {
  const {
    className: optionClassName,
    background = false,
    disabled = false,
    activated = DEFAULT_SETTING,
    tooltips,
    handler
  } = props;
  const className = useClassName([styles.axisButtons, optionClassName], [optionClassName]);
  const buttonClassName = useMemo(() => {
    const list = [styles.axisButton];
    background && list.push(styles.background);
    return list.join(' ');
  }, [background]);
  const [buttonX, buttonY, buttonZ] = useMemo(() => {
    return AXIS.map((v, i) => {
      const selectedBar = /*#__PURE__*/jsx("div", {
        className: [styles.bar, styles[v], activated[v] ? styles.activated : ''].join(' ')
      });
      const axisDisabled = Array.isArray(disabled) ? disabled[i] : disabled;
      let axisButton = /*#__PURE__*/jsx("button", {
        className: [buttonClassName, styles[v], activated[v] ? styles.activated : ''].join(' '),
        disabled: axisDisabled,
        onClick: () => handler && handler(v),
        children: v
      });
      if (tooltips) {
        axisButton = /*#__PURE__*/jsx(TooltipTrigger, {
          className: styles.tooltip,
          ...tooltips[i],
          children: axisButton
        });
      }
      return /*#__PURE__*/jsxs("div", {
        className: [styles.buttonContainer, styles[v]].join(' '),
        children: [axisButton, selectedBar]
      }, v);
    });
  }, [activated, buttonClassName, disabled, handler, tooltips]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    children: [buttonX, buttonY, buttonZ]
  });
}

export { AxisButtons, AxisButtonsView };
//# sourceMappingURL=index.js.map
