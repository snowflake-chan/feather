import { forwardRef, createContext, useRef, useState, useMemo, useCallback, useLayoutEffect, useEffect, useImperativeHandle } from 'react';
import { useClassName, isMetaKeyPressed } from '../util.js';
import { getBreadcrumbs, getRealDropData } from './util.js';
import { TreeNodeStatus, TreeNodeType, TreeNode } from './tree-node/index.js';
import styles from './style.module.scss.js';
import { useMouseUpListener } from '../hooks.js';
import { SelectType } from './defs.js';
import { jsx, jsxs } from 'react/jsx-runtime';

const EXPAND_GROUP_TIMEOUT = 500;
const NODE_ID_PREFIX = 'treeNode-';
const INDENT_LENGTH = 16;
const LINE_INDENT_LENGTH = 20;
const EXTRA_ICON_LENGTH = 16;
const PREFIX_ICON_LENGTH = 22;
const SUFFIX_ICON_LENGTH = 22;
var PointerAction;
(function (PointerAction) {
  PointerAction[PointerAction["Idle"] = 0] = "Idle";
  PointerAction[PointerAction["PointerDown"] = 1] = "PointerDown";
  PointerAction[PointerAction["DragStart"] = 2] = "DragStart";
  PointerAction[PointerAction["Dragging"] = 3] = "Dragging";
})(PointerAction || (PointerAction = {}));
var DraggingItem;
(function (DraggingItem) {
  DraggingItem[DraggingItem["None"] = 0] = "None";
  DraggingItem[DraggingItem["Attachable"] = 1] = "Attachable";
  DraggingItem[DraggingItem["SingleBasic"] = 2] = "SingleBasic";
  DraggingItem[DraggingItem["MultiBasic"] = 3] = "MultiBasic";
  DraggingItem[DraggingItem["NotAllowed"] = 4] = "NotAllowed";
})(DraggingItem || (DraggingItem = {}));
const TreeNodeContext = /*#__PURE__*/createContext({
  expandIcon: '',
  attachableStyle: 'treeLine',
  disableHover: false,
  treeNodeDataMap: new Map(),
  setDropTarget: () => {},
  onMouseDown: () => {},
  onDragStart: () => {},
  onDragOver: () => undefined,
  onPointerUp: () => {},
  isMobile: false
});
const TreeView = (props, ref) => {
  const {
    className: optionClassName,
    onExpand,
    expandedIds: optionExpandedIds,
    defaultExpandedIds,
    onSelect,
    selectedIds: optionSelectedIds,
    defaultSelectedIds,
    onDragStart: optionOnDragStart,
    onDragOver: optionOnDragOver,
    onDragEnd: optionOnDragEnd,
    editingNodeId,
    onEditingNode,
    nameMaxLength,
    onRename,
    renameValidator,
    expandIcon,
    style,
    treeData,
    abortRef,
    onScroll: optionOnScroll,
    attachableStyle = 'normal',
    highlightLetter,
    isMobile = false
  } = props;
  const treeRef = useRef(null);
  const treeNodeDataMap = useRef(new Map());
  const [expandedIds, setExpendedIds] = useState(defaultExpandedIds || []);
  const [selectedIds, setSelectedIds] = useState(defaultSelectedIds || []);
  const [dropTarget, setDropTarget] = useState();
  const className = useClassName([styles.tree, optionClassName], [optionClassName]);
  const currExpandedIds = useMemo(() => {
    return optionExpandedIds || expandedIds;
  }, [optionExpandedIds, expandedIds]);
  const isExpanded = useCallback(id => currExpandedIds.includes(id), [currExpandedIds]);
  const currSelectedIds = useMemo(() => {
    return optionSelectedIds || selectedIds;
  }, [optionSelectedIds, selectedIds]);
  const getNodeStatus = useCallback((id, parentStatus, type, attachTo) => {
    if (currSelectedIds.includes(id)) {
      return TreeNodeStatus.Selected;
    }
    if (parentStatus === TreeNodeStatus.Selected) {
      return attachTo || type !== TreeNodeType.Basic ? TreeNodeStatus.Relative : TreeNodeStatus.RelativeSelected;
    }
    return parentStatus;
  }, [currSelectedIds]);
  const treeNodeOnExpand = useCallback((treeNode, force = false) => {
    var _a;
    if (treeNode.type === TreeNodeType.Attachable && !((_a = treeNode.childrenIds) === null || _a === void 0 ? void 0 : _a.length) && !force) {
      return;
    }
    const newExpandedIds = arrayUniq(currExpandedIds, treeNode.id, isExpanded(treeNode.id));
    setExpendedIds(newExpandedIds);
    onExpand && onExpand(newExpandedIds);
  }, [onExpand, isExpanded, currExpandedIds]);
  const lastSelectedId = useRef(undefined);
  const sequenceSelect = useCallback(treeNode => {
    const lastId = currSelectedIds.length === 1 ? currSelectedIds[0] : lastSelectedId.current;
    const newId = treeNode.id;
    lastSelectedId.current = newId;
    if (!lastId) {
      lastSelectedId.current = newId;
      setSelectedIds([treeNode.id]);
      onSelect && onSelect([treeNode.id], SelectType.Single);
      return;
    }
    const newSelectedIds = getIdsBetweenTwoIds(treeNodeDataMap.current, treeData.map(data => data.id), lastId, treeNode.id, currSelectedIds);
    setSelectedIds(newSelectedIds);
    onSelect && onSelect(newSelectedIds, SelectType.Sequence);
  }, [currSelectedIds, onSelect, treeData]);
  const multiSelect = useCallback((treeNode, status) => {
    const treeNodeData = treeNodeDataMap.current.get(treeNode.id);
    if (!treeNodeData) {
      return;
    }
    const selected = status === TreeNodeStatus.Selected || status === TreeNodeStatus.RelativeSelected;
    if (selected) {
      if (lastSelectedId.current === treeNode.id) {
        lastSelectedId.current = undefined;
      }
    } else {
      lastSelectedId.current = treeNode.id;
    }
    const filteredIds = selected || treeNodeData.type === TreeNodeType.Attachable ? currSelectedIds : filterChildren(treeNode, currSelectedIds);
    const newSelectedIds = arrayUniq(filteredIds, treeNode.id, selected);
    setSelectedIds(newSelectedIds);
    onSelect && onSelect(newSelectedIds, SelectType.Multi);
  }, [currSelectedIds, onSelect]);
  const treeNodeOnSelect = useCallback((ev, treeNode, status) => {
    if (ev.button === 2) {
      if (!currSelectedIds.includes(treeNode.id)) {
        lastSelectedId.current = treeNode.id;
        setSelectedIds([treeNode.id]);
        onSelect && onSelect([treeNode.id], SelectType.Single);
        disableScroll.current = true;
      }
      return;
    }
    disableScroll.current = true;
    if (ev.shiftKey && currSelectedIds.length) {
      sequenceSelect(treeNode);
      return;
    }
    if (isMetaKeyPressed(ev)) {
      multiSelect(treeNode, status);
      return;
    }
    lastSelectedId.current = treeNode.id;
    setSelectedIds([treeNode.id]);
    onSelect && onSelect([treeNode.id], SelectType.Single);
  }, [onSelect, currSelectedIds, multiSelect, sequenceSelect]);
  const [treeWidth, setTreeWidth] = useState(0);
  useLayoutEffect(() => {
    if (!treeRef.current) {
      return;
    }
    setTreeWidth(treeRef.current.getBoundingClientRect().width);
  }, []);
  const getIndentLength = useCallback((parentNode, withExtraIcon = false) => {
    if (parentNode.type === TreeNodeType.Attachable && attachableStyle === 'treeLine') {
      return LINE_INDENT_LENGTH;
    }
    return INDENT_LENGTH + (withExtraIcon ? EXTRA_ICON_LENGTH : 0);
  }, [attachableStyle]);
  const getIndentByNode = useCallback((node, parentId) => {
    var _a;
    const parentNode = treeNodeDataMap.current.get(parentId);
    if (!parentNode || parentNode.disableExpand || parentNode.invisible) {
      return {
        indent: undefined,
        indentLength: 0
      };
    }
    if (parentNode.type === TreeNodeType.Attachable && attachableStyle === 'treeLine' && !parentNode.isLast) {
      return {
        indent: /*#__PURE__*/jsx("span", {
          style: {
            height: '100%',
            width: LINE_INDENT_LENGTH
          },
          children: /*#__PURE__*/jsx("span", {
            className: styles.connectLine
          })
        }, parentId),
        indentLength: LINE_INDENT_LENGTH
      };
    }
    const withExtraIcon = !!parentNode.icon && node.isLeaf && node.parentId === parentNode.id;
    if (parentNode.attachTo && attachableStyle === 'treeLine') {
      const attachToNode = treeNodeDataMap.current.get(parentNode.attachTo);
      if (attachToNode && attachToNode.expanded && ((_a = attachToNode.childrenIds) === null || _a === void 0 ? void 0 : _a.length)) {
        const indentByParent = getIndentLength(parentNode, withExtraIcon);
        return {
          indent: /*#__PURE__*/jsx("span", {
            style: {
              height: '100%',
              width: indentByParent
            },
            children: /*#__PURE__*/jsx("span", {
              className: styles.connectLine
            })
          }, parentId),
          indentLength: indentByParent
        };
      }
    }
    const indentByParent = getIndentLength(parentNode, withExtraIcon);
    return {
      indent: /*#__PURE__*/jsx("span", {
        style: {
          width: indentByParent
        }
      }, parentId),
      indentLength: indentByParent
    };
  }, [getIndentLength, attachableStyle]);
  const getIndents = useCallback(node => {
    let indentLength = 0;
    const indents = [];
    const breadcrumbs = getBreadcrumbs(treeNodeDataMap.current, node.id);
    breadcrumbs.forEach(id => {
      const res = getIndentByNode(node, id);
      res.indent && indents.unshift(res.indent);
      indentLength += res.indentLength;
    });
    const topParent = treeNodeDataMap.current.get(breadcrumbs[breadcrumbs.length - 1]);
    const attachToId = (topParent === null || topParent === void 0 ? void 0 : topParent.attachTo) || node.attachTo;
    if (attachToId) {
      const res = getIndentByNode(node, attachToId);
      res.indent && indents.unshift(res.indent);
      indentLength += res.indentLength;
      const breadcrumbs = getBreadcrumbs(treeNodeDataMap.current, attachToId);
      breadcrumbs.forEach(id => {
        const res = getIndentByNode(node, id);
        res.indent && indents.unshift(res.indent);
        indentLength += res.indentLength;
      });
    }
    if (!indents.length) {
      indentLength = node.isLeaf ? INDENT_LENGTH : 0;
      indents.push(/*#__PURE__*/jsx("span", {
        style: {
          width: indentLength
        }
      }, node.id));
    }
    return {
      indents: indents,
      indentLength
    };
  }, [treeNodeDataMap, getIndentByNode]);
  const tree = useMemo(() => {
    treeNodeDataMap.current.clear();
    const renderTree = (treeNodes, parentStatus = TreeNodeStatus.Unselected, parentId, attachTo) => {
      return treeNodes.map((treeNode, index) => {
        var _a;
        const status = getNodeStatus(treeNode.id, parentStatus, treeNode.type, attachTo);
        const data = {
          id: treeNode.id,
          type: treeNode.type,
          parentId,
          name: treeNode.name,
          isLeaf: !treeNode.children,
          isLast: treeNodes.length === index + 1,
          expanded: isExpanded(treeNode.id),
          indentLength: 0,
          childrenIds: (_a = treeNode.children) === null || _a === void 0 ? void 0 : _a.map(child => child.id),
          icon: treeNode.icon,
          prefixIcon: treeNode.prefixIcon,
          suffixIcon: treeNode.suffixIcon,
          disableExpand: treeNode.disableExpand,
          attachTo: attachTo,
          invisible: treeNode.invisible
        };
        treeNodeDataMap.current.set(data.id, data);
        const {
          indents,
          indentLength
        } = getIndents(data);
        data.indentLength = indentLength;
        return /*#__PURE__*/jsxs("div", {
          children: [/*#__PURE__*/jsx(TreeNode, {
            data: data,
            onClickExpandBtn: () => treeNodeOnExpand(data),
            status: status,
            onSelect: ev => treeNodeOnSelect(ev, treeNode, status),
            showNameInput: editingNodeId === treeNode.id,
            indents: indents,
            attachedNode: treeNode.attachedNode && renderTree([treeNode.attachedNode], status, undefined, treeNode.id),
            className: treeNode.className,
            disableDragging: treeNode.disableDragging,
            disableRename: treeNode.disableRename,
            disableHover: treeNode.disableHover,
            children: treeNode.children && renderTree(treeNode.children, status, treeNode.id, undefined)
          }), treeNode.separator && /*#__PURE__*/jsx("div", {
            className: styles.separator,
            style: {
              width: treeWidth - 16
            }
          })]
        }, treeNode.id);
      });
    };
    return renderTree(treeData);
  }, [treeData, editingNodeId, treeWidth, getIndents, getNodeStatus, isExpanded, treeNodeOnExpand, treeNodeOnSelect]);
  const pointerAction = useRef(PointerAction.Idle);
  const onDragStart = useCallback(() => {
    pointerAction.current = PointerAction.DragStart;
  }, []);
  const draggingItem = useRef(DraggingItem.None);
  const getDraggingItem = useCallback(() => {
    var _a;
    if (currSelectedIds.length === 1 && ((_a = treeNodeDataMap.current.get(currSelectedIds[0])) === null || _a === void 0 ? void 0 : _a.type) === TreeNodeType.Basic) {
      return DraggingItem.SingleBasic;
    }
    let item = DraggingItem.None;
    for (let i = 0; i < currSelectedIds.length; i++) {
      const node = treeNodeDataMap.current.get(currSelectedIds[i]);
      if (!node) {
        return;
      }
      if (node.type === TreeNodeType.Attachable) {
        if (item && item !== DraggingItem.Attachable) {
          item = DraggingItem.NotAllowed;
          break;
        }
        item = DraggingItem.Attachable;
        continue;
      }
      if (item && item !== DraggingItem.MultiBasic) {
        item = DraggingItem.NotAllowed;
        break;
      }
      item = DraggingItem.MultiBasic;
    }
    return item;
  }, [currSelectedIds]);
  const [disableHover, setDisableHover] = useState(false);
  const onDragOver = useCallback((ev, target) => {
    if (pointerAction.current === PointerAction.DragStart) {
      const item = getDraggingItem();
      if (!item) {
        return;
      }
      pointerAction.current = PointerAction.Dragging;
      draggingItem.current = item;
      optionOnDragStart && optionOnDragStart(ev, item);
      setDisableHover(true);
      return;
    }
    if (optionOnDragOver) {
      return optionOnDragOver(target);
    }
    return target;
  }, [getDraggingItem, optionOnDragOver, optionOnDragStart]);
  const onDragEnd = useCallback(() => {
    if (!dropTarget && optionOnDragEnd) {
      optionOnDragEnd();
    }
    if (dropTarget && optionOnDragEnd) {
      const realData = getRealDropData(dropTarget, treeNodeDataMap.current);
      if (!realData) {
        return;
      }
      optionOnDragEnd(realData.id, dropTarget.type);
    }
  }, [dropTarget, optionOnDragEnd]);
  const onPointerUp = useCallback(() => {
    if (pointerAction.current === PointerAction.Dragging) {
      onDragEnd();
    }
    pointerAction.current = PointerAction.Idle;
    draggingItem.current = DraggingItem.None;
    setDisableHover(false);
    setDropTarget(undefined);
  }, [pointerAction, onDragEnd]);
  const addMouseUpListener = useMouseUpListener(onPointerUp);
  const onMouseDown = useCallback(() => {
    pointerAction.current = PointerAction.PointerDown;
    addMouseUpListener();
  }, [addMouseUpListener]);
  const onAbort = useCallback(() => {
    setDropTarget(undefined);
    setDisableHover(false);
    pointerAction.current = PointerAction.Idle;
  }, []);
  useEffect(() => {
    if (abortRef) {
      abortRef.current = onAbort;
    }
  }, [abortRef, onAbort]);
  const expandTimer = useRef(-1);
  const timerOnNodeId = useRef(undefined);
  const clearExpandTimer = useCallback(() => {
    if (!timerOnNodeId.current) {
      return;
    }
    timerOnNodeId.current = undefined;
    clearTimeout(expandTimer.current);
  }, []);
  useEffect(() => {
    if (!dropTarget) {
      clearExpandTimer();
      return;
    }
    const node = treeNodeDataMap.current.get(dropTarget.hoverId);
    if (!node) {
      clearExpandTimer();
      return;
    }
    const shouldSetTimer = dropTarget.type === 'box' && !isExpanded(dropTarget.hoverId);
    if (timerOnNodeId.current !== dropTarget.hoverId || dropTarget.type !== 'box') {
      clearExpandTimer();
    }
    if (!shouldSetTimer || timerOnNodeId.current === dropTarget.hoverId) {
      return;
    }
    timerOnNodeId.current = dropTarget.hoverId;
    expandTimer.current = window.setTimeout(() => {
      if (dropTarget.hoverId !== timerOnNodeId.current || !shouldSetTimer) {
        clearExpandTimer();
        return;
      }
      const treeNode = treeNodeDataMap.current.get(dropTarget.hoverId);
      treeNode && treeNodeOnExpand(treeNode);
      clearExpandTimer();
    }, EXPAND_GROUP_TIMEOUT);
  }, [currExpandedIds, dropTarget, isExpanded, onExpand, clearExpandTimer, treeNodeOnExpand]);
  useEffect(() => {
    return () => {
      clearTimeout(expandTimer.current);
    };
  }, []);
  const disableScroll = useRef(false);
  useImperativeHandle(ref, () => ({
    scrollTo: (id, options) => {
      if (disableScroll.current) {
        disableScroll.current = false;
        return;
      }
      if (!treeRef.current) {
        return;
      }
      const ele = treeRef.current.querySelector(`#${NODE_ID_PREFIX}${id}`);
      if (!ele) {
        return;
      }
      ele.scrollIntoView(options);
    },
    scroll: (x, y) => {
      if (disableScroll.current) {
        disableScroll.current = false;
        return;
      }
      if (!treeRef.current) {
        return;
      }
      treeRef.current.scroll(x, y);
    }
  }), []);
  const onScroll = useCallback(evt => {
    optionOnScroll && optionOnScroll(evt);
  }, [optionOnScroll]);
  const onMoveMove = useCallback(e => {
    if (e.target !== treeRef.current) {
      return;
    }
    const target = undefined;
    const newTarget = optionOnDragOver && optionOnDragOver(target);
    setDropTarget(newTarget);
  }, [optionOnDragOver]);
  return /*#__PURE__*/jsx(TreeNodeContext.Provider, {
    value: {
      expandIcon,
      attachableStyle,
      disableHover,
      treeNodeDataMap: treeNodeDataMap.current,
      pointerAction,
      draggingItem,
      dropTarget,
      setDropTarget,
      onMouseDown,
      onDragStart,
      onDragOver,
      nameMaxLength,
      onEditingNode,
      onRename,
      renameValidator,
      highlightLetter,
      onPointerUp,
      isMobile
    },
    children: /*#__PURE__*/jsx("div", {
      ref: treeRef,
      className: className,
      style: style,
      onScroll: onScroll,
      onDragOver: isMobile ? onMoveMove : undefined,
      onMouseMove: onMoveMove,
      children: /*#__PURE__*/jsx("div", {
        className: styles.scrollTree,
        children: tree
      })
    })
  });
};
const Tree = /*#__PURE__*/forwardRef(TreeView);
const arrayUniq = (list, value, hasValue) => {
  return hasValue ? list.filter(item => item !== value) : [...list, value];
};
const checkTargetIsChild = (treeNode, targetId) => {
  if (!treeNode.children || !treeNode.children.length) {
    return false;
  }
  for (const child of treeNode.children) {
    if (child.id === targetId) {
      return true;
    }
    if (checkTargetIsChild(child, targetId)) {
      return true;
    }
  }
};
const filterChildren = (treeNode, selectedIds) => {
  if (!treeNode.children || !treeNode.children.length) {
    return selectedIds;
  }
  return selectedIds.filter(id => !checkTargetIsChild(treeNode, id));
};
function filterAllChildren(treeNodeDataMap, selectedIds) {
  return selectedIds.filter(id => {
    const node = treeNodeDataMap.get(id);
    if (!node) {
      return false;
    }
    if (node.type === TreeNodeType.Attachable) {
      return true;
    }
    const breadcrumbs = getBreadcrumbs(treeNodeDataMap, id);
    for (const parentId of breadcrumbs) {
      if (selectedIds.some(v => v === parentId)) {
        return false;
      }
    }
    return true;
  }, []);
}
function getSelectionInfo(treeNodeDataMap, rootIds, lastSelectedId, newSelectedId) {
  var _a, _b, _c;
  let lastBreadcrumbs = getBreadcrumbs(treeNodeDataMap, lastSelectedId);
  let newBreadcrumbs = getBreadcrumbs(treeNodeDataMap, newSelectedId);
  const lastAttachTo = (_a = treeNodeDataMap.get(lastBreadcrumbs[0] || lastSelectedId)) === null || _a === void 0 ? void 0 : _a.attachTo;
  const newAttachTo = (_b = treeNodeDataMap.get(newBreadcrumbs[0] || newSelectedId)) === null || _b === void 0 ? void 0 : _b.attachTo;
  const lastId = lastAttachTo || lastSelectedId;
  const newId = newAttachTo || newSelectedId;
  if (lastAttachTo) {
    lastBreadcrumbs = getBreadcrumbs(treeNodeDataMap, lastAttachTo);
  }
  if (newAttachTo) {
    newBreadcrumbs = getBreadcrumbs(treeNodeDataMap, newAttachTo);
  }
  let parentId;
  let lastParentId = lastBreadcrumbs.pop();
  let newParentId = newBreadcrumbs.pop();
  while (lastParentId && newParentId && lastParentId === newParentId) {
    parentId = lastParentId;
    lastParentId = lastBreadcrumbs.pop();
    newParentId = newBreadcrumbs.pop();
  }
  const findLast = lastParentId || lastId;
  const findNew = newParentId || newId;
  const publicChildrenIds = parentId ? ((_c = treeNodeDataMap.get(parentId)) === null || _c === void 0 ? void 0 : _c.childrenIds) || [] : rootIds;
  const lastIndex = publicChildrenIds.indexOf(findLast);
  const newIndex = publicChildrenIds.indexOf(findNew);
  let firstIndex;
  let endIndex;
  let firstId;
  let endId;
  let firstParent;
  let firstSelectedId;
  let firstAttachTo;
  if (lastIndex < newIndex || lastIndex === newIndex && !lastParentId) {
    firstIndex = lastIndex;
    endIndex = newIndex;
    firstId = lastId;
    endId = newId;
    firstParent = findLast;
    firstAttachTo = lastAttachTo;
    firstSelectedId = lastSelectedId;
  } else {
    firstIndex = newIndex;
    endIndex = lastIndex;
    firstId = newId;
    endId = lastId;
    firstParent = findNew;
    firstAttachTo = newAttachTo;
    firstSelectedId = newSelectedId;
  }
  return {
    publicChildrenIds,
    firstIndex,
    endIndex,
    firstId,
    endId,
    firstParent,
    firstAttachTo,
    firstSelectedId
  };
}
function getIdsBetweenTwoIds(treeNodeDataMap, rootIds, lastSelectedId, newSelectedId, currSelectedIds) {
  const newSelectedIds = [...currSelectedIds];
  const {
    publicChildrenIds,
    firstIndex,
    endIndex,
    firstId,
    endId,
    firstParent,
    firstAttachTo,
    firstSelectedId
  } = getSelectionInfo(treeNodeDataMap, rootIds, lastSelectedId, newSelectedId);
  if (!publicChildrenIds.length) {
    return newSelectedIds;
  }
  if (firstIndex !== endIndex) {
    selectNode(treeNodeDataMap, firstId, newSelectedIds);
  }
  newSelectedIds.push(...getFromTargetToParentEndIds(treeNodeDataMap, rootIds, firstId, firstParent));
  for (let i = firstIndex + 1; i < endIndex; i++) {
    selectNode(treeNodeDataMap, publicChildrenIds[i], newSelectedIds);
  }
  newSelectedIds.push(publicChildrenIds[endIndex]);
  const endNode = treeNodeDataMap.get(endId);
  if (endNode && endNode.type === TreeNodeType.Attachable) {
    const descendants = getDescendants(treeNodeDataMap, publicChildrenIds[endIndex]);
    const excludeIds = getDescendants(treeNodeDataMap, endId, false);
    excludeIds.push(...getFromTargetToParentEndIds(treeNodeDataMap, rootIds, endId, publicChildrenIds[endIndex]));
    newSelectedIds.push(...descendants.filter(id => !excludeIds.includes(id)));
  }
  const uniqueIds = Array.from(new Set(newSelectedIds));
  if (firstAttachTo) {
    uniqueIds.splice(uniqueIds.indexOf(firstAttachTo), 1);
    const breadcrumbs = getBreadcrumbs(treeNodeDataMap, firstSelectedId);
    uniqueIds.push(firstSelectedId);
    uniqueIds.push(...getFromTargetToParentEndIds(treeNodeDataMap, rootIds, firstSelectedId, breadcrumbs[0] || firstSelectedId));
  }
  const filteredIds = filterAllChildren(treeNodeDataMap, uniqueIds);
  return Array.from(new Set(filteredIds));
}
function getFromTargetToParentEndIds(treeNodeDataMap, rootIds, targetId, parentId) {
  var _a, _b;
  const ids = [];
  let currId = targetId;
  while (currId !== parentId) {
    if (!currId) {
      break;
    }
    const currParentId = (_a = treeNodeDataMap.get(currId)) === null || _a === void 0 ? void 0 : _a.parentId;
    const childrenIds = currParentId ? (_b = treeNodeDataMap.get(currParentId)) === null || _b === void 0 ? void 0 : _b.childrenIds : rootIds;
    if (!childrenIds) {
      break;
    }
    const startIndex = childrenIds.indexOf(currId) + 1;
    const endIndex = childrenIds.length;
    for (let i = startIndex; i < endIndex; i++) {
      selectNode(treeNodeDataMap, childrenIds[i], ids);
    }
    currId = currParentId;
  }
  return ids;
}
function getDescendants(treeNodeDataMap, id, includeRoot = true) {
  var _a;
  const descendants = includeRoot ? [id] : [];
  const ids = [id];
  while (ids.length) {
    const id = ids.shift();
    if (!id) {
      break;
    }
    const childrenIds = (_a = treeNodeDataMap.get(id)) === null || _a === void 0 ? void 0 : _a.childrenIds;
    if (!childrenIds) {
      continue;
    }
    ids.push(...childrenIds);
    descendants.push(...childrenIds);
  }
  return descendants;
}
function selectNode(treeNodeDataMap, id, out) {
  const node = treeNodeDataMap.get(id);
  if (!node) {
    return;
  }
  if (node.type === TreeNodeType.Attachable) {
    out.push(...getDescendants(treeNodeDataMap, node.id));
  } else {
    out.push(id);
  }
}

export { DraggingItem, EXTRA_ICON_LENGTH, INDENT_LENGTH, LINE_INDENT_LENGTH, NODE_ID_PREFIX, PREFIX_ICON_LENGTH, PointerAction, SUFFIX_ICON_LENGTH, SelectType, Tree, TreeNodeContext, TreeNodeType, TreeView };
//# sourceMappingURL=index.js.map
