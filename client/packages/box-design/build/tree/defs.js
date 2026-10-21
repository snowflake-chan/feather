import 'react';

var TreeNodeType;
(function (TreeNodeType) {
  TreeNodeType[TreeNodeType["Basic"] = 0] = "Basic";
  TreeNodeType[TreeNodeType["Attachable"] = 1] = "Attachable";
  TreeNodeType[TreeNodeType["Root"] = 2] = "Root";
})(TreeNodeType || (TreeNodeType = {}));
var MouseAction;
(function (MouseAction) {
  MouseAction[MouseAction["Idle"] = 0] = "Idle";
  MouseAction[MouseAction["MouseDown"] = 1] = "MouseDown";
  MouseAction[MouseAction["DragStart"] = 2] = "DragStart";
  MouseAction[MouseAction["Dragging"] = 3] = "Dragging";
})(MouseAction || (MouseAction = {}));
var DraggingItem;
(function (DraggingItem) {
  DraggingItem[DraggingItem["None"] = 0] = "None";
  DraggingItem[DraggingItem["Attachable"] = 1] = "Attachable";
  DraggingItem[DraggingItem["SingleBasic"] = 2] = "SingleBasic";
  DraggingItem[DraggingItem["MultiBasic"] = 3] = "MultiBasic";
  DraggingItem[DraggingItem["NotAllowed"] = 4] = "NotAllowed";
})(DraggingItem || (DraggingItem = {}));
var SelectType;
(function (SelectType) {
  SelectType[SelectType["Single"] = 0] = "Single";
  SelectType[SelectType["Multi"] = 1] = "Multi";
  SelectType[SelectType["Sequence"] = 2] = "Sequence";
})(SelectType || (SelectType = {}));

export { DraggingItem, MouseAction, SelectType, TreeNodeType };
//# sourceMappingURL=defs.js.map
