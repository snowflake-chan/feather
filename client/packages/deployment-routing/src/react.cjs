'use strict';
const React = require('__box_original_react__');
const { props } = require('./public-path.cjs');
const create = React.createElement;
React.createElement = function (type, original, ...children) {
    return create.call(this, type, props(type, original), ...children);
};
module.exports = React;
