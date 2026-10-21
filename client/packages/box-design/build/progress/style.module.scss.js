import styleInject from 'style-inject';

var css_248z = ".boxProgress {\n  width: 329px;\n  height: 20px;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.boxProgress .boxProgressInner {\n  width: 283px;\n  height: 8px;\n  border-radius: 43px;\n  background-color: rgba(255, 255, 255, 0.15);\n  overflow: hidden;\n}\n.boxProgress .boxProgressInner .boxProgressThumb {\n  height: 100%;\n  border-radius: 43px;\n  background-color: var(--theme-primary80, #81de00);\n  transform-origin: 0;\n}\n.boxProgress .boxProgressPercentage {\n  width: 46px;\n  text-align: right;\n  font-style: normal;\n  font-size: 14px;\n  line-height: 20px;\n  color: rgba(255, 255, 255, 0.75);\n}";
var styles = {"progress":"boxProgress","inner":"boxProgressInner","percentage":"boxProgressPercentage"};
styleInject(css_248z);

export { styles as default };
//# sourceMappingURL=style.module.scss.js.map
