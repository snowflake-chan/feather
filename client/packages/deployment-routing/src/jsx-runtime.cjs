'use strict';
const original = require('__box_original_jsx_runtime__');
const { props } = require('./public-path.cjs');
module.exports = {
    ...original,
    jsx: (type, value, ...rest) => original.jsx(type, props(type, value), ...rest),
    jsxs: (type, value, ...rest) => original.jsxs(type, props(type, value), ...rest),
};
