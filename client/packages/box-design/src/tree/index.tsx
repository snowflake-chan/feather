import React, {
  useMemo,
  useState,
  useCallback,
  createContext,
  useRef,
  MutableRefObject,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  ReactNode,
  type JSX,
} from 'react';
import { ComponentOptions } from '../interfaces';
import { useClassName, isMetaKeyPressed } from '../util';
import { getBreadcrumbs, getRealDropData } from './util';
import {
  TreeNode,
  TreeNodeData,
  TreeNodeStatus,
  TreeNodeType,
} from './tree-node';
import styles from './style.module.scss';
import { useMouseUpListener } from '../hooks';
import { SelectType } from './defs';

const EXPAND_GROUP_TIMEOUT = 500;
export const NODE_ID_PREFIX = 'treeNode-';

export const INDENT_LENGTH = 16;
export const LINE_INDENT_LENGTH = 20;
export const EXTRA_ICON_LENGTH = 16;
export const PREFIX_ICON_LENGTH = 22;
export const SUFFIX_ICON_LENGTH = 22;

export interface TreeNode {
  /**
   * 树节点ID
   */
  id: string;
  /**
   * 树节点名称
   */
  name: string;
  /**
   * 树节点类型
   */
  type: TreeNodeType;
  /**
   * 自定义树节点图标
   * 默认没有
   */
  icon?: string | ReactNode;
  /**
   * 绑定的节点
   * 默认没有
   */
  attachedNode?: TreeNode;
  /**
   * 子节点
   * 默认为undefined，为叶子节点，即没有展开图标
   * 若为数组（包括空数组），则为父节点，有展开图标
   */
  children?: TreeNode[];
  /**
   * 节点（含子节点）的下方显示分割线
   * 默认不显示
   */
  separator?: boolean;
  /**
   * 禁止折叠和展开功能，同时隐藏折叠按钮
   * 默认不禁止
   */
  disableExpand?: boolean;
  /**
   * 节点的类名
   */
  className?: string;
  /**
   * 是否禁用重命名
   * @default false
   */
  disableRename?: boolean;
  /**
   * 是否禁用Hover效果
   * @default false
   */
  disableHover?: boolean;
  /**
   * 是否禁用拖拽
   * @default false
   */
  disableDragging?: boolean;
  /**
   * 节点是否不可见（不影响子节点）
   * @default false
   */
  invisible?: boolean;
  /**
   * 自定义树节点前缀图标
   * 默认没有
   */
  prefixIcon?: string | ReactNode;
  /**
   * 自定义树节点后缀图标
   * 默认没有
   */
  suffixIcon?: string | ReactNode;
}

interface TreeOptions extends ComponentOptions {
  /**
   * treeNodes数据
   */
  treeData: TreeNode[];
  /**
   * 展开图标
   */
  expandIcon: string | ReactNode;
  /**
   * 当展开时的回调
   */
  onExpand?: (ids: string[]) => void;
  /**
   * 展开指定树节点
   */
  expandedIds?: string[];
  /**
   * 默认展开树节点
   */
  defaultExpandedIds?: string[];
  /**
   * 当选中的回调
   */
  onSelect?: (ids: string[], selectType: SelectType) => void;
  /**
   * 选中指定树节点
   */
  selectedIds?: string[];
  /**
   * 默认选中树节点
   */
  defaultSelectedIds?: string[];
  /**
   * 拖拽开始时的回调
   */
  onDragStart?: (ev: React.MouseEvent, draggingItem: DraggingItem) => void;
  /**
   * 拖拽经过可放置的目标时的回调
   */
  onDragOver?: (target?: DropTarget) => DropTarget | undefined;
  /**
   * 拖拽结束时的回调
   * @param targetId 放置目标
   * @param dropType 放置类型
   */
  onDragEnd?: (targetId?: string, dropType?: DropType) => void;
  /**
   * 中断拖拽操作的引用。
   * 组件会更新current为处理中断的函数，由外部自行调用。
   */
  abortRef?: MutableRefObject<() => void>;
  /**
   * 当前正在编辑名称的节点ID
   */
  editingNodeId?: string;
  /**
   * 当触发编辑名称时的回调
   * 当前没有在编辑的节点参数为undefined
   */
  onEditingNode?: (id?: string) => void;
  /**
   * 节点名称的最大长度，默认无限制
   */
  nameMaxLength?: number;
  /**
   * 完成重命名时的回调
   */
  onRename?: (id: string, newName: string) => void;
  /**
   * 重命名时校验输入内容是否合法
   */
  renameValidator?: (value: string) => boolean;
  /**
   * 滚动时的回调
   */
  onScroll?: React.UIEventHandler;
  /**
   * 可绑定节点的样式类型。分为竖线样式和普通样式
   * 默认为竖线样式
   */
  attachableStyle?: AttachableStyle;
  /**
   * 在名字中高亮的词汇
   */
  highlightLetter?: string;
  /**
   * 当前环境是否为移动端
   * @default false
   */
  isMobile?: boolean;
}

export type DropType = 'top' | 'bottom' | 'box';

export type AttachableStyle = 'treeLine' | 'normal';

export interface DropTarget {
  /**
   * 当前光标hover对象的id。
   */
  hoverId: string;
  /**
   * 当前的放置对象。
   */
  dropId: string;
  /**
   * drop的类型
   */
  type: DropType;
  /**
   * 层级偏移量
   */
  levelOffset: number;
  /**
   * drop之后的父节点。
   */
  parentId?: string;
}

interface TreeNodeContextProps {
  expandIcon: string | ReactNode;
  attachableStyle: AttachableStyle;
  disableHover: boolean;
  treeNodeDataMap: Map<string, TreeNodeData>;
  pointerAction?: MutableRefObject<PointerAction>;
  draggingItem?: MutableRefObject<DraggingItem>;
  dropTarget?: DropTarget;
  setDropTarget: (target?: DropTarget) => void;
  onMouseDown: () => void;
  onDragStart: () => void;
  onDragOver: (
    ev: React.MouseEvent,
    target: DropTarget,
  ) => DropTarget | undefined;
  nameMaxLength?: number;
  onEditingNode?: (id?: string) => void;
  onRename?: (id: string, newName: string) => void;
  renameValidator?: (value: string) => boolean;
  highlightLetter?: string;
  onPointerUp: () => void;
  isMobile?: boolean;
}

export enum PointerAction {
  Idle,
  PointerDown,
  DragStart,
  Dragging,
}

export enum DraggingItem {
  /**
   * 不处于拖拽中
   */
  None,
  /**
   * 单个或多个attachable节点
   */
  Attachable,
  /**
   * 单个basic节点
   */
  SingleBasic,
  /**
   * 多个basic节点
   */
  MultiBasic,
  /**
   * 不允许拖拽的情形
   * 同时拖拽attachable节点和basic节点
   */
  NotAllowed,
}

export const TreeNodeContext = createContext<TreeNodeContextProps>({
  expandIcon: '',
  attachableStyle: 'treeLine',
  disableHover: false,
  treeNodeDataMap: new Map<string, TreeNodeData>(),
  setDropTarget: () => {},
  onMouseDown: () => {},
  onDragStart: () => {},
  onDragOver: () => undefined,
  onPointerUp: () => {},
  isMobile: false,
});

export type TreeHandle = {
  /**
   * 滚动到指定ID的节点
   * @param id 指定ID
   * @param options 滚动方式、位置等选项
   * @returns
   */
  scrollTo: (id: string, options?: ScrollIntoViewOptions) => void;

  /**
   * 滚动到指定坐标位置
   */
  scroll: (x: number, y: number) => void;
};

export const TreeView: React.ForwardRefRenderFunction<
  TreeHandle,
  TreeOptions
> = (props, ref) => {
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
    isMobile = false,
  } = props;

  const treeRef = useRef<HTMLDivElement>(null);

  const treeNodeDataMap = useRef<Map<string, TreeNodeData>>(
    new Map<string, TreeNodeData>(),
  );

  const [expandedIds, setExpendedIds] = useState<string[]>(
    defaultExpandedIds || [],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultSelectedIds || [],
  );

  const [dropTarget, setDropTarget] = useState<DropTarget | undefined>();

  const className = useClassName(
    [styles.tree, optionClassName],
    [optionClassName],
  );

  const currExpandedIds = useMemo(() => {
    return optionExpandedIds || expandedIds;
  }, [optionExpandedIds, expandedIds]);

  const isExpanded = useCallback(
    (id: string) => currExpandedIds.includes(id),
    [currExpandedIds],
  );

  const currSelectedIds = useMemo(() => {
    return optionSelectedIds || selectedIds;
  }, [optionSelectedIds, selectedIds]);

  const getNodeStatus = useCallback(
    (
      id: string,
      parentStatus: TreeNodeStatus,
      type: TreeNodeType,
      attachTo?: string,
    ) => {
      if (currSelectedIds.includes(id)) {
        return TreeNodeStatus.Selected;
      }

      if (parentStatus === TreeNodeStatus.Selected) {
        // 新增规则，如果是骨骼被选中，那么子骨骼和绑定的部件都是“关联”
        return attachTo || type !== TreeNodeType.Basic
          ? TreeNodeStatus.Relative
          : TreeNodeStatus.RelativeSelected;
      }

      return parentStatus;
    },
    [currSelectedIds],
  );

  const treeNodeOnExpand = useCallback(
    (treeNode: TreeNodeData, force: boolean = false) => {
      // 没有子节点的attachable节点不能进行折叠或展开
      if (
        treeNode.type === TreeNodeType.Attachable &&
        !treeNode.childrenIds?.length &&
        !force
      ) {
        return;
      }
      const newExpandedIds = arrayUniq(
        currExpandedIds,
        treeNode.id,
        isExpanded(treeNode.id),
      );
      setExpendedIds(newExpandedIds);
      onExpand && onExpand(newExpandedIds);
    },
    [onExpand, isExpanded, currExpandedIds],
  );

  const lastSelectedId = useRef<string | undefined>(undefined);

  const sequenceSelect = useCallback(
    (treeNode: TreeNode) => {
      // 获得上一次选中的id
      const lastId =
        currSelectedIds.length === 1
          ? currSelectedIds[0]
          : lastSelectedId.current;

      // 记录本次选中的id
      const newId = treeNode.id;
      lastSelectedId.current = newId;

      // 没有上一次选中的id，则单选当前选中节点
      if (!lastId) {
        lastSelectedId.current = newId;
        setSelectedIds([treeNode.id]);
        onSelect && onSelect([treeNode.id], SelectType.Single);
        return;
      }

      // 序列多选
      const newSelectedIds = getIdsBetweenTwoIds(
        treeNodeDataMap.current,
        treeData.map((data) => data.id),
        lastId,
        treeNode.id,
        currSelectedIds,
      );

      setSelectedIds(newSelectedIds);
      onSelect && onSelect(newSelectedIds, SelectType.Sequence);
    },
    [currSelectedIds, onSelect, treeData],
  );

  const multiSelect = useCallback(
    (treeNode: TreeNode, status: TreeNodeStatus) => {
      const treeNodeData = treeNodeDataMap.current.get(treeNode.id);
      if (!treeNodeData) {
        return;
      }

      const selected =
        status === TreeNodeStatus.Selected ||
        status === TreeNodeStatus.RelativeSelected;

      if (selected) {
        // 减选
        if (lastSelectedId.current === treeNode.id) {
          lastSelectedId.current = undefined;
        }
      } else {
        // 加选
        lastSelectedId.current = treeNode.id;
      }

      const filteredIds =
        selected || treeNodeData.type === TreeNodeType.Attachable
          ? currSelectedIds
          : filterChildren(treeNode, currSelectedIds);
      const newSelectedIds = arrayUniq(filteredIds, treeNode.id, selected);
      setSelectedIds(newSelectedIds);
      onSelect && onSelect(newSelectedIds, SelectType.Multi);
    },
    [currSelectedIds, onSelect],
  );

  const treeNodeOnSelect = useCallback(
    (ev: React.MouseEvent, treeNode: TreeNode, status: TreeNodeStatus) => {
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

      // 序列多选
      if (ev.shiftKey && currSelectedIds.length) {
        sequenceSelect(treeNode);
        return;
      }

      // 单点多选
      if (isMetaKeyPressed(ev)) {
        multiSelect(treeNode, status);
        return;
      }

      // 单选
      lastSelectedId.current = treeNode.id;
      setSelectedIds([treeNode.id]);
      onSelect && onSelect([treeNode.id], SelectType.Single);
    },
    [onSelect, currSelectedIds, multiSelect, sequenceSelect],
  );

  const [treeWidth, setTreeWidth] = useState(0);
  useLayoutEffect(() => {
    if (!treeRef.current) {
      return;
    }
    setTreeWidth(treeRef.current.getBoundingClientRect().width);
  }, []);

  const getIndentLength = useCallback(
    (parentNode: TreeNodeData, withExtraIcon: boolean = false) => {
      if (
        parentNode.type === TreeNodeType.Attachable &&
        attachableStyle === 'treeLine'
      ) {
        return LINE_INDENT_LENGTH;
      }
      return INDENT_LENGTH + (withExtraIcon ? EXTRA_ICON_LENGTH : 0);
    },
    [attachableStyle],
  );

  const getIndentByNode = useCallback(
    (node: TreeNodeData, parentId: string) => {
      const parentNode = treeNodeDataMap.current.get(parentId);
      if (!parentNode || parentNode.disableExpand || parentNode.invisible) {
        return {
          indent: undefined,
          indentLength: 0,
        };
      }

      if (
        parentNode.type === TreeNodeType.Attachable &&
        attachableStyle === 'treeLine' &&
        !parentNode.isLast
      ) {
        return {
          indent: (
            <span
              key={parentId}
              style={{ height: '100%', width: LINE_INDENT_LENGTH }}
            >
              <span className={styles.connectLine}></span>
            </span>
          ),
          indentLength: LINE_INDENT_LENGTH,
        };
      }

      const withExtraIcon =
        !!parentNode.icon && node.isLeaf && node.parentId === parentNode.id;

      // attachable节点展开时，它的子节点连接线的向上延伸部分
      if (parentNode.attachTo && attachableStyle === 'treeLine') {
        const attachToNode = treeNodeDataMap.current.get(parentNode.attachTo);
        if (
          attachToNode &&
          attachToNode.expanded &&
          attachToNode.childrenIds?.length
        ) {
          const indentByParent = getIndentLength(parentNode, withExtraIcon);
          return {
            indent: (
              <span
                key={parentId}
                style={{ height: '100%', width: indentByParent }}
              >
                <span className={styles.connectLine}></span>
              </span>
            ),
            indentLength: indentByParent,
          };
        }
      }

      const indentByParent = getIndentLength(parentNode, withExtraIcon);
      return {
        indent: <span key={parentId} style={{ width: indentByParent }} />,
        indentLength: indentByParent,
      };
    },
    [getIndentLength, attachableStyle],
  );

  const getIndents = useCallback(
    (node: TreeNodeData) => {
      let indentLength = 0;
      const indents: JSX.Element[] = [];

      // 根据父节点进行自身的层级缩进
      const breadcrumbs = getBreadcrumbs(treeNodeDataMap.current, node.id);
      breadcrumbs.forEach((id) => {
        const res = getIndentByNode(node, id);
        res.indent && indents.unshift(res.indent);
        indentLength += res.indentLength;
      });

      // 最上方的父节点有attachTo节点，或自身有attachTo节点
      const topParent = treeNodeDataMap.current.get(
        breadcrumbs[breadcrumbs.length - 1],
      );
      const attachToId = topParent?.attachTo || node.attachTo;
      if (attachToId) {
        // 根据attachTo节点缩进
        const res = getIndentByNode(node, attachToId);
        res.indent && indents.unshift(res.indent);
        indentLength += res.indentLength;
        // attachTo节点由于它父节点的缩进，同步到当前节点
        const breadcrumbs = getBreadcrumbs(treeNodeDataMap.current, attachToId);
        breadcrumbs.forEach((id) => {
          const res = getIndentByNode(node, id);
          res.indent && indents.unshift(res.indent);
          indentLength += res.indentLength;
        });
      }

      if (!indents.length) {
        indentLength = node.isLeaf ? INDENT_LENGTH : 0;
        indents.push(
          <span key={node.id} style={{ width: indentLength }}></span>,
        );
      }

      return {
        indents: indents,
        indentLength,
      };
    },
    [treeNodeDataMap, getIndentByNode],
  );

  const tree = useMemo(() => {
    treeNodeDataMap.current.clear();

    const renderTree = (
      treeNodes: TreeNode[],
      parentStatus = TreeNodeStatus.Unselected,
      parentId?: string,
      attachTo?: string,
    ) => {
      return treeNodes.map((treeNode, index) => {
        const status = getNodeStatus(
          treeNode.id,
          parentStatus,
          treeNode.type,
          attachTo,
        );
        const data: TreeNodeData = {
          id: treeNode.id,
          type: treeNode.type,
          parentId,
          name: treeNode.name,
          isLeaf: !treeNode.children,
          isLast: treeNodes.length === index + 1,
          expanded: isExpanded(treeNode.id),
          indentLength: 0,
          childrenIds: treeNode.children?.map((child) => child.id),
          icon: treeNode.icon,
          prefixIcon: treeNode.prefixIcon,
          suffixIcon: treeNode.suffixIcon,
          disableExpand: treeNode.disableExpand,
          attachTo: attachTo,
          invisible: treeNode.invisible,
        };
        treeNodeDataMap.current.set(data.id, data);
        const { indents, indentLength } = getIndents(data);
        data.indentLength = indentLength;

        return (
          <div key={treeNode.id}>
            <TreeNode
              data={data}
              onClickExpandBtn={() => treeNodeOnExpand(data)}
              status={status}
              onSelect={(ev) => treeNodeOnSelect(ev, treeNode, status)}
              showNameInput={editingNodeId === treeNode.id}
              indents={indents}
              attachedNode={
                treeNode.attachedNode &&
                renderTree(
                  [treeNode.attachedNode],
                  status,
                  undefined,
                  treeNode.id,
                )
              }
              className={treeNode.className}
              disableDragging={treeNode.disableDragging}
              disableRename={treeNode.disableRename}
              disableHover={treeNode.disableHover}
            >
              {treeNode.children &&
                renderTree(treeNode.children, status, treeNode.id, undefined)}
            </TreeNode>
            {treeNode.separator && (
              <div
                className={styles.separator}
                style={{ width: treeWidth - 16 }}
              />
            )}
          </div>
        );
      });
    };

    return renderTree(treeData);
  }, [
    treeData,
    editingNodeId,
    treeWidth,
    getIndents,
    getNodeStatus,
    isExpanded,
    treeNodeOnExpand,
    treeNodeOnSelect,
  ]);

  const pointerAction = useRef<PointerAction>(PointerAction.Idle);

  const onDragStart = useCallback(() => {
    pointerAction.current = PointerAction.DragStart;
  }, []);

  const draggingItem = useRef<DraggingItem>(DraggingItem.None);
  const getDraggingItem = useCallback(() => {
    if (
      currSelectedIds.length === 1 &&
      treeNodeDataMap.current.get(currSelectedIds[0])?.type ===
        TreeNodeType.Basic
    ) {
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

  const [disableHover, setDisableHover] = useState<boolean>(false);

  const onDragOver = useCallback(
    (ev: React.MouseEvent, target: DropTarget) => {
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
    },
    [getDraggingItem, optionOnDragOver, optionOnDragStart],
  );

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
  const timerOnNodeId = useRef<string>(undefined);

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

    // 对未展开的组需要添加计时器
    const shouldSetTimer =
      dropTarget.type === 'box' && !isExpanded(dropTarget.hoverId);

    // 清除已存在的计时器
    if (
      timerOnNodeId.current !== dropTarget.hoverId ||
      dropTarget.type !== 'box'
    ) {
      clearExpandTimer();
    }

    // 不满足添加的条件，或不需要重复添加
    if (!shouldSetTimer || timerOnNodeId.current === dropTarget.hoverId) {
      return;
    }

    // 添加定时器
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
  }, [
    currExpandedIds,
    dropTarget,
    isExpanded,
    onExpand,
    clearExpandTimer,
    treeNodeOnExpand,
  ]);

  useEffect(() => {
    return () => {
      clearTimeout(expandTimer.current);
    };
  }, []);

  const disableScroll = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      scrollTo: (id: string, options?: ScrollIntoViewOptions) => {
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
      scroll: (x: number, y: number) => {
        if (disableScroll.current) {
          disableScroll.current = false;
          return;
        }

        if (!treeRef.current) {
          return;
        }

        treeRef.current.scroll(x, y);
      },
    }),
    [],
  );

  const onScroll = useCallback<React.UIEventHandler>(
    (evt) => {
      optionOnScroll && optionOnScroll(evt);
    },
    [optionOnScroll],
  );

  const onMoveMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== treeRef.current) {
        return;
      }
      const target = undefined;
      const newTarget = optionOnDragOver && optionOnDragOver(target);
      setDropTarget(newTarget);
    },
    [optionOnDragOver],
  );

  return (
    <TreeNodeContext.Provider
      value={{
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
        isMobile,
      }}
    >
      <div
        ref={treeRef}
        className={className}
        style={style}
        onScroll={onScroll}
        onDragOver={isMobile ? onMoveMove : undefined}
        onMouseMove={onMoveMove}
      >
        <div className={styles.scrollTree}>{tree}</div>
      </div>
    </TreeNodeContext.Provider>
  );
};

export const Tree = forwardRef(TreeView);

const arrayUniq = (list: string[], value: string, hasValue: boolean) => {
  return hasValue ? list.filter((item) => item !== value) : [...list, value];
};

/**
 * 检查targetId是否是treeNode的child
 * @param treeNode 被检查的treeNode
 * @param targetId 目标ID
 * @returns
 */
const checkTargetIsChild = (treeNode: TreeNode, targetId: string) => {
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

/**
 * 将selectedIds中，treeNode的children过滤掉
 * 用于单点多选
 * 选中一个父节点时
 * 要将原本选中的其子节点全部取消选中
 * @param treeNode
 * @param selectedIds
 * @returns
 */
const filterChildren = (treeNode: TreeNode, selectedIds: string[]) => {
  if (!treeNode.children || !treeNode.children.length) {
    return selectedIds;
  }
  return selectedIds.filter((id) => !checkTargetIsChild(treeNode, id));
};

/**
 * 将选中的id中，所有父节点已被选中的BASIC节点过滤
 */
function filterAllChildren(
  treeNodeDataMap: Map<string, TreeNodeData>,
  selectedIds: string[],
) {
  return selectedIds.filter((id) => {
    const node = treeNodeDataMap.get(id);
    if (!node) {
      return false;
    }
    if (node.type === TreeNodeType.Attachable) {
      return true;
    }
    const breadcrumbs = getBreadcrumbs(treeNodeDataMap, id);
    for (const parentId of breadcrumbs) {
      if (selectedIds.some((v) => v === parentId)) {
        return false;
      }
    }
    return true;
  }, []);
}

/**
 * 获得序列多选所需要的信息
 */
function getSelectionInfo(
  treeNodeDataMap: Map<string, TreeNodeData>,
  rootIds: string[],
  lastSelectedId: string,
  newSelectedId: string,
) {
  // 首先查找到两个元素向上溯源至同一个父级的ID
  let lastBreadcrumbs = getBreadcrumbs(treeNodeDataMap, lastSelectedId);
  let newBreadcrumbs = getBreadcrumbs(treeNodeDataMap, newSelectedId);

  // 两个元素如果是被绑定的节点，向上找到它绑定的对象节点
  // 以绑定的节点作为选择的起点和终点
  const lastAttachTo = treeNodeDataMap.get(
    lastBreadcrumbs[0] || lastSelectedId,
  )?.attachTo;
  const newAttachTo = treeNodeDataMap.get(
    newBreadcrumbs[0] || newSelectedId,
  )?.attachTo;
  const lastId = lastAttachTo || lastSelectedId;
  const newId = newAttachTo || newSelectedId;

  if (lastAttachTo) {
    lastBreadcrumbs = getBreadcrumbs(treeNodeDataMap, lastAttachTo);
  }
  if (newAttachTo) {
    newBreadcrumbs = getBreadcrumbs(treeNodeDataMap, newAttachTo);
  }

  // 向上溯源查找到的同一个父级ID
  let parentId: string | undefined;

  let lastParentId = lastBreadcrumbs.pop();
  let newParentId = newBreadcrumbs.pop();
  while (lastParentId && newParentId && lastParentId === newParentId) {
    parentId = lastParentId;
    lastParentId = lastBreadcrumbs.pop();
    newParentId = newBreadcrumbs.pop();
  }

  // 最后一个选中的ID向上溯源的ID
  const findLast = lastParentId || lastId;
  // 最新选中的ID向上溯源的ID
  const findNew = newParentId || newId;

  // 公共父级ID的children列表
  const publicChildrenIds = parentId
    ? treeNodeDataMap.get(parentId)?.childrenIds || []
    : rootIds;

  const lastIndex = publicChildrenIds.indexOf(findLast);
  const newIndex = publicChildrenIds.indexOf(findNew);

  let firstIndex: number;
  let endIndex: number;

  let firstId: string;
  let endId: string;
  let firstParent: string;

  // 第一个选中的ID
  let firstSelectedId: string;
  // 第一个选中ID的被绑定节点
  let firstAttachTo: string | undefined;

  if (lastIndex < newIndex || (lastIndex === newIndex && !lastParentId)) {
    // 从上到下
    firstIndex = lastIndex;
    endIndex = newIndex;

    firstId = lastId;
    endId = newId;
    firstParent = findLast;

    firstAttachTo = lastAttachTo;
    firstSelectedId = lastSelectedId;
  } else {
    // 从下到上
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
    firstSelectedId,
  };
}

/**
 * 获取两个元素之间的ID
 * 用于序列多选
 * @param treeNodeDataMap 数据来源
 * @param rootIds 根目录ID
 * @param lastSelectedId 最后一个选中的ID
 * @param newSelectedId 最新选中的ID
 * @param currSelectedIds 当前选中的ID们
 * @returns
 */
function getIdsBetweenTwoIds(
  treeNodeDataMap: Map<string, TreeNodeData>,
  rootIds: string[],
  lastSelectedId: string,
  newSelectedId: string,
  currSelectedIds: string[],
) {
  const newSelectedIds = [...currSelectedIds];

  const {
    publicChildrenIds,
    firstIndex,
    endIndex,
    firstId,
    endId,
    firstParent,
    firstAttachTo,
    firstSelectedId,
  } = getSelectionInfo(treeNodeDataMap, rootIds, lastSelectedId, newSelectedId);

  if (!publicChildrenIds.length) {
    return newSelectedIds;
  }

  // 新选中和旧选中属于父子关系，第一个ID的子节点不一定都被选中
  // 所以不能直接选中第一个ID，在处理最后一个ID时向上依次选中
  if (firstIndex !== endIndex) {
    selectNode(treeNodeDataMap, firstId, newSelectedIds);
  }

  // 查找首个ID到首个ID父级孩子们最后一个元素之间的ID
  // 也就是getFromTargetToParentEndIds做的事情
  newSelectedIds.push(
    ...getFromTargetToParentEndIds(
      treeNodeDataMap,
      rootIds,
      firstId,
      firstParent,
    ),
  );

  // 溯源之间的所有ID，过滤掉首个和最后一个ID
  for (let i = firstIndex + 1; i < endIndex; i++) {
    selectNode(treeNodeDataMap, publicChildrenIds[i], newSelectedIds);
  }

  // 最后一个ID也不能直接选中
  // 如果endId是attachable节点，还需要选中最后一个ID到endId之间的所有ID
  newSelectedIds.push(publicChildrenIds[endIndex]);
  const endNode = treeNodeDataMap.get(endId);
  if (endNode && endNode.type === TreeNodeType.Attachable) {
    const descendants = getDescendants(
      treeNodeDataMap,
      publicChildrenIds[endIndex],
    );
    const excludeIds = getDescendants(treeNodeDataMap, endId, false);
    excludeIds.push(
      ...getFromTargetToParentEndIds(
        treeNodeDataMap,
        rootIds,
        endId,
        publicChildrenIds[endIndex],
      ),
    );
    newSelectedIds.push(
      ...descendants.filter((id) => !excludeIds.includes(id)),
    );
  }

  const uniqueIds = Array.from(new Set(newSelectedIds));

  // 首个ID是被绑定的节点，它的绑定节点不需要被选中
  if (firstAttachTo) {
    uniqueIds.splice(uniqueIds.indexOf(firstAttachTo), 1);
    const breadcrumbs = getBreadcrumbs(treeNodeDataMap, firstSelectedId);
    // 从firstSelectedId选中到它parent的最后一个id
    uniqueIds.push(firstSelectedId);
    uniqueIds.push(
      ...getFromTargetToParentEndIds(
        treeNodeDataMap,
        rootIds,
        firstSelectedId,
        breadcrumbs[0] || firstSelectedId,
      ),
    );
  }

  const filteredIds = filterAllChildren(treeNodeDataMap, uniqueIds);
  return Array.from(new Set(filteredIds));
}

/**
 * 获取从目标ID到指定的父级孩子们最后一个元素之间的ID（不包括目标ID自身）
 * 用于序列多选
 * @param treeNodeDataMap 数据来源
 * @param rootIds 根目录ID
 * @param targetId 目标ID
 * @param parentId 指定父级ID
 * @returns
 */
function getFromTargetToParentEndIds(
  treeNodeDataMap: Map<string, TreeNodeData>,
  rootIds: string[],
  targetId: string,
  parentId: string,
) {
  const ids: string[] = [];
  let currId: string | undefined = targetId;
  while (currId !== parentId) {
    if (!currId) {
      break;
    }
    const currParentId: string | undefined =
      treeNodeDataMap.get(currId)?.parentId;
    const childrenIds = currParentId
      ? treeNodeDataMap.get(currParentId)?.childrenIds
      : rootIds;
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

/**
 * 获得指定节点的所有子孙节点。
 * @param treeNodeDataMap 数据
 * @param id 指定节点id
 * @param includeRoot 是否返回节点自身
 * @returns
 */
function getDescendants(
  treeNodeDataMap: Map<string, TreeNodeData>,
  id: string,
  includeRoot: boolean = true,
) {
  const descendants: string[] = includeRoot ? [id] : [];
  const ids: string[] = [id];
  while (ids.length) {
    const id = ids.shift();
    if (!id) {
      break;
    }
    const childrenIds = treeNodeDataMap.get(id)?.childrenIds;
    if (!childrenIds) {
      continue;
    }
    ids.push(...childrenIds);
    descendants.push(...childrenIds);
  }
  return descendants;
}

/**
 * 选中节点。对于attachable节点，同时选中所有子节点。
 */
function selectNode(
  treeNodeDataMap: Map<string, TreeNodeData>,
  id: string,
  out: string[],
) {
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

export { TreeNodeType, SelectType };
