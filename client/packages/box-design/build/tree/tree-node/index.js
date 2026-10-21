import { useContext, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Button } from '../../button/index.js';
import { Input } from '../../input/index.js';
import { Icon } from '../../icon/index.js';
import { isMetaKeyPressed, useClassName } from '../../util.js';
import { TreeNodeContext, LINE_INDENT_LENGTH, INDENT_LENGTH, DraggingItem, PointerAction, NODE_ID_PREFIX, EXTRA_ICON_LENGTH, PREFIX_ICON_LENGTH, SUFFIX_ICON_LENGTH } from '../index.js';
import { getRealDropData, getBreadcrumbs } from '../util.js';
import styles from './style.module.scss.js';
import SvgExpand from './expand.svg.js';
import SvgCollapse from './collapse.svg.js';
import { jsxs, jsx } from 'react/jsx-runtime';

var TreeNodeType;
(function (TreeNodeType) {
  TreeNodeType[TreeNodeType["Basic"] = 0] = "Basic";
  TreeNodeType[TreeNodeType["Attachable"] = 1] = "Attachable";
  TreeNodeType[TreeNodeType["Root"] = 2] = "Root";
})(TreeNodeType || (TreeNodeType = {}));
var TreeNodeStatus;
(function (TreeNodeStatus) {
  TreeNodeStatus[TreeNodeStatus["Unselected"] = 0] = "Unselected";
  TreeNodeStatus[TreeNodeStatus["Selected"] = 1] = "Selected";
  TreeNodeStatus[TreeNodeStatus["RelativeSelected"] = 2] = "RelativeSelected";
  TreeNodeStatus[TreeNodeStatus["Relative"] = 3] = "Relative";
})(TreeNodeStatus || (TreeNodeStatus = {}));
const TREE_NODE_NAME = 'boxTreeNodeName';
const TREE_NODE_ATTACHABLE_NAME = 'boxTreeNodeAttachableName';
const TREE_NODE_PREFIX_ICON = 'boxTreeNodePrefixIcon';
function TreeNodeName(props) {
  const {
    id,
    name,
    type,
    showInput,
    maxLength,
    indentLength,
    disableRename,
    pointerAction,
    onEditing,
    onRename,
    validator,
    highlightLetter
  } = props;
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const onDoubleClick = useCallback(() => {
    if (type === TreeNodeType.Root || disableRename || (pointerAction === null || pointerAction === void 0 ? void 0 : pointerAction.current) !== PointerAction.Idle) {
      return;
    }
    setIsEditing(true);
  }, [type, disableRename, pointerAction]);
  useEffect(() => {
    var _a;
    if (showInput) {
      setIsEditing(true);
    } else {
      (_a = ref.current) === null || _a === void 0 ? void 0 : _a.blur();
      setIsEditing(false);
    }
  }, [showInput, name]);
  useEffect(() => {
    var _a, _b;
    if (isEditing) {
      (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus({
        preventScroll: true
      });
      (_b = ref.current) === null || _b === void 0 ? void 0 : _b.select();
    }
  }, [isEditing]);
  const onBlur = useCallback(value => {
    onRename && onRename(id, value);
    setIsEditing(false);
  }, [id, onRename]);
  const className = useClassName([styles.name, TREE_NODE_NAME, type === TreeNodeType.Attachable ? TREE_NODE_ATTACHABLE_NAME : undefined], [type]);
  const toShowInput = isEditing && !disableRename;
  useEffect(() => {
    onEditing === null || onEditing === void 0 ? void 0 : onEditing(toShowInput ? id : undefined);
  }, [toShowInput, onEditing, id]);
  const nameText = useMemo(() => {
    let matchRes = highlightLetter && name.match(highlightLetter);
    if (!highlightLetter || !matchRes) {
      return /*#__PURE__*/jsx("span", {
        children: name
      });
    }
    const contentJSX = [];
    let content = name;
    while (matchRes) {
      contentJSX.push(/*#__PURE__*/jsx("span", {
        children: content.slice(0, matchRes.index)
      }, contentJSX.length));
      contentJSX.push(/*#__PURE__*/jsx("span", {
        className: styles.highlightLetter,
        children: highlightLetter
      }, contentJSX.length));
      content = content.slice((matchRes.index || 0) + highlightLetter.length);
      matchRes = content.match(highlightLetter);
    }
    if (content) {
      contentJSX.push(/*#__PURE__*/jsx("span", {
        children: content
      }, contentJSX.length));
    }
    return /*#__PURE__*/jsx("div", {
      children: contentJSX
    });
  }, [highlightLetter, name]);
  return /*#__PURE__*/jsxs("div", {
    className: className,
    onDoubleClick: onDoubleClick,
    style: {
      minWidth: `calc(100% - ${indentLength}px)`
    },
    children: [/*#__PURE__*/jsx("div", {
      style: {
        visibility: toShowInput ? 'hidden' : 'visible'
      },
      children: nameText
    }), toShowInput && /*#__PURE__*/jsx(Input, {
      ref: ref,
      type: "noBorder",
      size: "custom",
      valueType: "string",
      value: name,
      maxLength: maxLength,
      className: styles.nameInput,
      onBlur: onBlur,
      validator: validator
    })]
  });
}
const PADDING = 8;
const TREE_NODE_CONTAINER = 'boxTreeNodeContainer';
const TREE_NODE_ATTACHABLE_ICON = 'boxTreeNodeAttachableIcon';
function TreeNode(props) {
  const {
    data,
    attachedNode,
    indents,
    children,
    onClickExpandBtn,
    status,
    onSelect,
    showNameInput,
    className: optionClassName,
    disableDragging = false,
    disableRename = false,
    disableHover: propsDisableHover = false
  } = props;
  const {
    id,
    parentId,
    name,
    isLeaf,
    isLast,
    expanded,
    type,
    childrenIds,
    disableExpand,
    icon,
    prefixIcon,
    suffixIcon,
    indentLength,
    invisible = false
  } = data;
  const {
    expandIcon,
    attachableStyle,
    disableHover,
    treeNodeDataMap,
    pointerAction,
    draggingItem,
    dropTarget,
    setDropTarget,
    onMouseDown: contextOnMouseDown,
    onDragStart: contextOnDragStart,
    onDragOver: contextOnDragOver,
    nameMaxLength,
    onEditingNode,
    onRename,
    renameValidator,
    highlightLetter,
    onPointerUp: contextOnPointerUp,
    isMobile
  } = useContext(TreeNodeContext);
  const expandButton = useMemo(() => {
    const onMouseDown = ev => ev.stopPropagation();
    const onClick = ev => {
      ev.stopPropagation();
      onClickExpandBtn();
    };
    if (type === TreeNodeType.Attachable && attachableStyle === 'treeLine') {
      if (childrenIds === null || childrenIds === void 0 ? void 0 : childrenIds.length) {
        return /*#__PURE__*/jsxs("div", {
          className: styles.expandBtn,
          children: [/*#__PURE__*/jsxs("div", {
            className: styles.left,
            children: [/*#__PURE__*/jsx("div", {
              className: styles.verticalLine
            }), /*#__PURE__*/jsx(Button, {
              className: styles.icon,
              type: "icon",
              icon: expanded ? /*#__PURE__*/jsx(SvgCollapse, {}) : /*#__PURE__*/jsx(SvgExpand, {}),
              onMouseDown: onMouseDown,
              onClick: onClick
            }), !isLast && /*#__PURE__*/jsx("div", {
              className: styles.verticalLine
            })]
          }), /*#__PURE__*/jsx("div", {
            className: styles.horizontalLine
          })]
        });
      }
      return /*#__PURE__*/jsxs("div", {
        className: styles.expandBtn,
        children: [/*#__PURE__*/jsx("div", {
          className: styles.rightAngle
        }), !isLast && /*#__PURE__*/jsx("div", {
          className: styles.lineToNext
        })]
      });
    }
    if (type === TreeNodeType.Attachable && !(childrenIds === null || childrenIds === void 0 ? void 0 : childrenIds.length)) {
      return /*#__PURE__*/jsx("div", {
        className: styles.icon
      });
    }
    return /*#__PURE__*/jsx(Button, {
      className: styles.icon,
      type: "icon",
      icon: expandIcon,
      style: {
        transform: expanded ? 'rotate(90deg)' : 'rotate(0)'
      },
      onMouseDown: onMouseDown,
      onClick: onClick
    });
  }, [expandIcon, attachableStyle, expanded, isLast, type, childrenIds === null || childrenIds === void 0 ? void 0 : childrenIds.length, onClickExpandBtn]);
  const extraIcon = useMemo(() => {
    if (!icon) {
      return;
    }
    if (typeof icon === 'string') {
      const className = type === TreeNodeType.Attachable ? [styles.extraIcon, TREE_NODE_ATTACHABLE_ICON].join(' ') : styles.extraIcon;
      return /*#__PURE__*/jsx(Icon, {
        className: className,
        symbolId: icon
      });
    }
    return icon;
  }, [icon, type]);
  const stickyPrefixIcon = useMemo(() => {
    if (!prefixIcon) {
      return;
    }
    if (typeof prefixIcon === 'string') {
      return /*#__PURE__*/jsx("div", {
        className: `${styles.stickyPrefixIcon} ${TREE_NODE_PREFIX_ICON}`,
        children: /*#__PURE__*/jsx(Icon, {
          className: styles.extraIcon,
          symbolId: prefixIcon
        })
      });
    }
    return /*#__PURE__*/jsx("div", {
      className: `${styles.stickyPrefixIcon} ${TREE_NODE_PREFIX_ICON}`,
      children: prefixIcon
    });
  }, [prefixIcon]);
  const stickySuffixIcon = useMemo(() => {
    if (!suffixIcon) {
      return;
    }
    if (typeof suffixIcon === 'string') {
      return /*#__PURE__*/jsx("div", {
        className: styles.stickySuffixIconWrap,
        children: /*#__PURE__*/jsx("div", {
          className: styles.stickySuffixIcon,
          children: /*#__PURE__*/jsx(Icon, {
            className: styles.extraIcon,
            symbolId: suffixIcon
          })
        })
      });
    }
    return /*#__PURE__*/jsx("div", {
      className: styles.stickySuffixIconWrap,
      children: /*#__PURE__*/jsx("div", {
        className: styles.stickySuffixIcon,
        children: suffixIcon
      })
    });
  }, [suffixIcon]);
  const totalIndentLength = useMemo(() => {
    const expandBtn = isLeaf ? 0 : type === TreeNodeType.Attachable ? LINE_INDENT_LENGTH : INDENT_LENGTH;
    const iconLength = icon === undefined ? 0 : EXTRA_ICON_LENGTH;
    const prefixIconLength = prefixIcon === undefined ? 0 : PREFIX_ICON_LENGTH;
    const suffixIconLength = suffixIcon === undefined ? 0 : SUFFIX_ICON_LENGTH;
    return indentLength + expandBtn + iconLength + prefixIconLength + suffixIconLength;
  }, [isLeaf, type, icon, prefixIcon, suffixIcon, indentLength]);
  const calcMarkerLeft = useCallback(data => {
    const expandBtn = data.isLeaf ? 0 : data.type === TreeNodeType.Attachable ? LINE_INDENT_LENGTH : INDENT_LENGTH;
    return PADDING + data.indentLength + expandBtn;
  }, []);
  const getLineMarker = useCallback((type, left) => {
    let markerLeft = left;
    if (markerLeft === undefined) {
      const realData = dropTarget && getRealDropData(dropTarget, treeNodeDataMap);
      if (realData) {
        markerLeft = calcMarkerLeft(realData);
      }
    }
    if (markerLeft === undefined) {
      return;
    }
    return /*#__PURE__*/jsx("div", {
      className: styles.markerLine,
      style: {
        width: `calc(100% - ${markerLeft}px)`,
        left: markerLeft,
        top: type === 'top' ? -0.5 : 'unset',
        bottom: type === 'bottom' ? -0.5 : 'unset'
      }
    });
  }, [calcMarkerLeft, dropTarget, treeNodeDataMap]);
  const marker = useMemo(() => {
    if (!dropTarget || !(draggingItem === null || draggingItem === void 0 ? void 0 : draggingItem.current)) {
      return;
    }
    if (dropTarget.dropId === id && dropTarget.type === 'top') {
      return getLineMarker('top');
    }
    if (dropTarget.dropId === id && dropTarget.type === 'box' || dropTarget.parentId === id) {
      return /*#__PURE__*/jsx("div", {
        className: styles.markerBox
      });
    }
  }, [dropTarget, draggingItem, id, getLineMarker]);
  const bottomMarker = useMemo(() => {
    if (!dropTarget || !(draggingItem === null || draggingItem === void 0 ? void 0 : draggingItem.current)) {
      return;
    }
    if (dropTarget.dropId === id && dropTarget.type === 'bottom') {
      return getLineMarker('bottom');
    }
    if (dropTarget.dropId === id && dropTarget.parentId === id && dropTarget.type === 'box') {
      const targetNode = treeNodeDataMap.get(dropTarget.dropId);
      if (!targetNode || !targetNode.childrenIds) {
        return;
      }
      const firstChild = treeNodeDataMap.get(targetNode.childrenIds[0]);
      if (!firstChild) {
        return;
      }
      const left = calcMarkerLeft(firstChild);
      return getLineMarker('bottom', left);
    }
  }, [dropTarget, draggingItem, id, getLineMarker, treeNodeDataMap, calcMarkerLeft]);
  const nameClassName = useMemo(() => {
    const list = [styles.container, TREE_NODE_CONTAINER];
    if (prefixIcon) {
      list.push(styles.noPaddingLeft);
    }
    switch (status) {
      case TreeNodeStatus.Selected:
        list.push(styles.selected);
        break;
      case TreeNodeStatus.RelativeSelected:
        list.push(styles.relativeSelected);
        break;
      case TreeNodeStatus.Relative:
        list.push(styles.relative);
        break;
      case TreeNodeStatus.Unselected:
        list.push(styles.unselected);
        break;
    }
    if (disableHover || propsDisableHover) {
      list.push(styles.disableHover);
    }
    return list.join(' ');
  }, [prefixIcon, status, disableHover, propsDisableHover]);
  const setLevelOffset = useCallback((out, clientX, rectLeft) => {
    var _a;
    const targetNode = treeNodeDataMap.get(out.dropId);
    if (!targetNode) {
      return;
    }
    if (out.type !== 'bottom' || !targetNode.isLast) {
      return;
    }
    const realData = getRealDropData(out, treeNodeDataMap);
    if (!realData) {
      return;
    }
    const currLeft = rectLeft + calcMarkerLeft(realData);
    if (realData.isLast && realData.parentId && clientX < currLeft) {
      const parentId = (_a = treeNodeDataMap.get(realData.parentId)) === null || _a === void 0 ? void 0 : _a.parentId;
      if (parentId) {
        out.parentId = parentId;
        out.levelOffset -= 1;
        return;
      }
    }
    const indent = realData.type === TreeNodeType.Attachable ? LINE_INDENT_LENGTH : INDENT_LENGTH;
    if (out.levelOffset < 0 && clientX > currLeft + indent) {
      out.parentId = realData.id;
      out.levelOffset += 1;
    }
  }, [calcMarkerLeft, treeNodeDataMap]);
  const updateDropTarget = useCallback(out => {
    if (!draggingItem || draggingItem.current !== DraggingItem.Attachable) {
      return;
    }
    const hoverTarget = treeNodeDataMap.get(out.hoverId);
    let attachToId = hoverTarget === null || hoverTarget === void 0 ? void 0 : hoverTarget.attachTo;
    if (!attachToId) {
      const breadcrumbs = getBreadcrumbs(treeNodeDataMap, out.hoverId);
      const topParent = treeNodeDataMap.get(breadcrumbs[breadcrumbs.length - 1]);
      attachToId = topParent === null || topParent === void 0 ? void 0 : topParent.attachTo;
    }
    const attachedNode = attachToId ? treeNodeDataMap.get(attachToId) : undefined;
    if (!attachedNode) {
      return;
    }
    out.dropId = attachedNode.id;
    if (attachedNode.expanded) {
      out.parentId = attachedNode.id;
      out.type = 'box';
    } else {
      out.parentId = attachedNode.parentId;
      out.type = 'bottom';
    }
  }, [draggingItem, treeNodeDataMap]);
  const processDropTarget = useCallback(ev => {
    const {
      top,
      height,
      bottom,
      left
    } = ev.currentTarget.getBoundingClientRect();
    if (ev.clientY < top || ev.clientY > bottom) {
      return;
    }
    const target = {
      hoverId: id,
      dropId: id,
      parentId,
      type: ev.clientY < top + height / 2 ? 'top' : 'bottom',
      levelOffset: 0
    };
    const unExpandedIsBox = !isLeaf && !expanded && ev.clientY > top + height / 3 && ev.clientY < bottom - height / 3;
    const expandedIsBox = !isLeaf && expanded && ev.clientY >= top + height / 2;
    if (unExpandedIsBox || expandedIsBox) {
      target.parentId = id;
      target.type = 'box';
    }
    updateDropTarget(target);
    if (dropTarget && dropTarget.hoverId === id && dropTarget.type === 'bottom' && target.type === 'bottom') {
      target.parentId = dropTarget.parentId;
      target.levelOffset = dropTarget.levelOffset;
    }
    const newTarget = contextOnDragOver(ev, target);
    newTarget && setLevelOffset(newTarget, ev.clientX, left);
    setDropTarget(newTarget);
  }, [id, isLeaf, parentId, expanded, dropTarget, setDropTarget, setLevelOffset, updateDropTarget, contextOnDragOver]);
  const onMouseMove = useCallback(ev => {
    if ((pointerAction === null || pointerAction === void 0 ? void 0 : pointerAction.current) === PointerAction.Idle) {
      return;
    }
    if ((pointerAction === null || pointerAction === void 0 ? void 0 : pointerAction.current) === PointerAction.PointerDown) {
      if (!disableDragging && type !== TreeNodeType.Root) {
        contextOnDragStart();
      }
      return;
    }
    processDropTarget(ev);
  }, [type, pointerAction, disableDragging, processDropTarget, contextOnDragStart]);
  const shouldUseClick = useCallback(ev => (status === TreeNodeStatus.Selected || status === TreeNodeStatus.RelativeSelected) && !isMetaKeyPressed(ev) && !ev.shiftKey, [status]);
  const onClick = useCallback(ev => {
    ev.stopPropagation();
    shouldUseClick(ev) && onSelect(ev);
  }, [shouldUseClick, onSelect]);
  const onPointerDown = useCallback(ev => {
    ev.stopPropagation();
    !shouldUseClick(ev) && onSelect(ev);
    ev.pointerType === 'mouse' && ev.button === 0 && contextOnMouseDown();
  }, [contextOnMouseDown, onSelect, shouldUseClick]);
  const onDragStart = useCallback(ev => {
    ev.dataTransfer.setData('_', `
          Here, the content of the data passed to 'ev.dataTransfer.setData' is not important.
          Calling this method is simply to enable a series of drag events to be triggered on mobile devices.
          If no data is passed, drag events cannot be triggered on iOS devices.
        `);
    ev.dataTransfer.dropEffect = 'none';
    ev.button === 0 && contextOnDragStart();
  }, [contextOnDragStart]);
  const onDragEnd = useCallback(ev => {
    ev.button === 0 && contextOnPointerUp();
  }, [contextOnPointerUp]);
  const onDragOver = useCallback(ev => {
    ev.preventDefault();
    processDropTarget(ev);
  }, [processDropTarget]);
  const onDrop = useCallback(ev => {
    ev.preventDefault();
  }, []);
  const classNames = useClassName([styles.treeNode, optionClassName], [optionClassName]);
  return /*#__PURE__*/jsxs("div", {
    className: classNames,
    children: [!invisible && /*#__PURE__*/jsxs("div", {
      className: styles.notChildren,
      children: [/*#__PURE__*/jsxs("div", {
        id: `${NODE_ID_PREFIX}${id}`,
        className: styles.interaction,
        onClick: onClick,
        onPointerDown: onPointerDown,
        onMouseMove: onMouseMove,
        draggable: isMobile,
        onDragStart: isMobile ? onDragStart : undefined,
        onDragEnd: isMobile ? onDragEnd : undefined,
        onDragOver: isMobile ? onDragOver : undefined,
        onDrop: isMobile ? onDrop : undefined,
        children: [/*#__PURE__*/jsxs("div", {
          className: nameClassName,
          children: [stickyPrefixIcon, indents, !isLeaf && !disableExpand && expandButton, extraIcon, /*#__PURE__*/jsx(TreeNodeName, {
            id: id,
            name: name,
            type: type,
            showInput: showNameInput,
            indentLength: totalIndentLength,
            disableRename: disableRename,
            pointerAction: pointerAction,
            maxLength: nameMaxLength,
            onEditing: onEditingNode,
            onRename: onRename,
            validator: renameValidator,
            highlightLetter: highlightLetter
          }), stickySuffixIcon]
        }), marker]
      }), attachedNode, bottomMarker]
    }), expanded && children]
  });
}

export { TreeNode, TreeNodeStatus, TreeNodeType };
//# sourceMappingURL=index.js.map
