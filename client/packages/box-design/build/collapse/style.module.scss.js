import styleInject from 'style-inject';

var css_248z = ".boxCollapse {\n  width: 100%;\n  height: 100%;\n  background: #1a1a1a;\n}\n.boxCollapse .boxCollapseHeader {\n  display: flex;\n  height: 41px;\n  padding: 8px;\n  align-items: center;\n  justify-content: space-between;\n  color: rgba(255, 255, 255, 0.75);\n  font-family: \"Rubik-700\", \"MiSans-Bold\";\n  font-style: normal;\n  font-size: 12px;\n  line-height: 18px;\n}\n.boxCollapse .boxCollapseHeader .boxCollapseLeft {\n  display: flex;\n  justify-content: flex-start;\n  align-items: center;\n}\n.boxCollapse .boxCollapseHeader .boxCollapseLeft .boxCollapseExpand {\n  width: 12px;\n  height: 12px;\n  display: flex;\n  align-items: center;\n  margin-right: 8px;\n}\n.boxCollapse .boxCollapseDivider {\n  width: calc(100% - 16px);\n  height: 1px;\n  background: rgba(255, 255, 255, 0.06);\n  border-radius: 6px;\n  margin: 0 auto;\n}\n.boxCollapse .boxCollapseDisabledMask {\n  background: rgba(0, 0, 0, 0.6);\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}";
var styles = {"collapse":"boxCollapse","header":"boxCollapseHeader","left":"boxCollapseLeft","expand":"boxCollapseExpand","divider":"boxCollapseDivider","disabledMask":"boxCollapseDisabledMask"};
styleInject(css_248z);

export { styles as default };
//# sourceMappingURL=style.module.scss.js.map
