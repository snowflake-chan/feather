import styleInject from 'style-inject';

var css_248z = ".boxSwitch {\n  width: 30px;\n  height: 16px;\n}\n.boxSwitch .boxSwitchBackground {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background-color: #333333;\n  border-radius: 11px;\n  cursor: pointer;\n}\n.boxSwitch .boxSwitchThumb {\n  position: absolute;\n  top: 2px;\n  left: 3px;\n  width: 12px;\n  height: 12px;\n  background-color: #ffffff;\n  border-radius: 50%;\n}\n.boxSwitch.boxSwitchChecked .boxSwitchBackground {\n  background-color: var(--theme-primary80, #81de00);\n}\n.boxSwitch.boxSwitchChecked .boxSwitchThumb {\n  background-color: white;\n  left: 15px;\n}";
var styles = {"switch":"boxSwitch","background":"boxSwitchBackground","thumb":"boxSwitchThumb","checked":"boxSwitchChecked"};
styleInject(css_248z);

export { styles as default };
//# sourceMappingURL=style.module.scss.js.map
