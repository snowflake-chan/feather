import { memo, useMemo } from 'react';
import styles from './style.module.scss.js';
import { useClassName } from '../util.js';
import { jsxs, jsx } from 'react/jsx-runtime';

const PROGRESS_CLASS_NAME = 'boxProgress';
const PROGRESS_THUMB_CLASS_NAME = 'boxProgressThumb';
function ProgressView(props) {
  const {
    percent,
    className: optionClassName
  } = props;
  const style = useMemo(() => ({
    width: `${percent}%`
  }), [percent]);
  const className = useClassName([styles.progress, PROGRESS_CLASS_NAME, optionClassName], [optionClassName]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    children: [/*#__PURE__*/jsx("div", {
      className: styles.inner,
      children: /*#__PURE__*/jsx("div", {
        className: PROGRESS_THUMB_CLASS_NAME,
        style: style
      })
    }), /*#__PURE__*/jsxs("div", {
      className: styles.percentage,
      children: [percent, "%"]
    })]
  });
}
const Progress = /*#__PURE__*/memo(ProgressView);

export { PROGRESS_CLASS_NAME, PROGRESS_THUMB_CLASS_NAME, Progress };
//# sourceMappingURL=index.js.map
