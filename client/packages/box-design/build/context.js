import { createContext } from 'react';

const ToolbarMenuContext = /*#__PURE__*/createContext({
  selectedItem: undefined,
  onItemSelect: () => {}
});
const SharedTipsContext = /*#__PURE__*/createContext({
  displayed: false,
  setDisplayed: displayed => {},
  delay: 500,
  disabled: false,
  setDisabled: disabled => {}
});
const FileMenuContext = /*#__PURE__*/createContext({
  onClose: () => {}
});

export { FileMenuContext, SharedTipsContext, ToolbarMenuContext };
//# sourceMappingURL=context.js.map
