// glslify-loader returns GLSL text. Webpack still needs a JS module, so wrap it.
module.exports = function glslToModule(source) {
  return `module.exports = ${JSON.stringify(String(source))};`;
};
