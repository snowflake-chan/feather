import React, {
  ReactNode,
  useMemo,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
  MutableRefObject,
  type JSX,
} from 'react';
import { Button } from '../../button';
import { Input } from '../../input';
import { Icon } from '../../icon';
import { isMetaKeyPressed, useClassName } from '../../util';
import {
  TreeNodeContext,
  DropTarget,
  PointerAction,
  DropType,
  DraggingItem,
  INDENT_LENGTH,
  LINE_INDENT_LENGTH,
  NODE_ID_PREFIX,
  EXTRA_ICON_LENGTH,
  SUFFIX_ICON_LENGTH,
  PREFIX_ICON_LENGTH,
} from '../index';
import { getBreadcrumbs, getRealDropData } from '../util';
import styles from './style.module.scss';
import Expand from './expand.svg';
import Collapse from './collapse.svg';

export enum TreeNodeType {
  Basic,
  Attachable,
  Root,
}

export interface TreeNodeData {
  id: string;
  type: TreeNodeType;
  parentId?: string;
  name: string;
  isLeaf: boolean;
  isLast: boolean;
  expanded: boolean;
  indentLength: number;
  childrenIds?: string[];
  disableExpand?: boolean;
  icon?: string | ReactNode;
  prefixIcon?: string | ReactNode;
  suffixIcon?: string | ReactNode;
  attachTo?: string;
  invisible?: boolean;
}

export enum TreeNodeStatus {
  Unselected,
  Selected,
  RelativeSelected,
  Relative,
}

interface TreeNodeNameOptions {
  id: string;
  name: string;
  type: TreeNodeType;
  showInput: boolean;
  indentLength: number;
  pointerAction?: MutableRefObject<PointerAction>;
  maxLength?: number;
  disableRename: boolean;
  onEditing?: (id?: string) => void;
  onRename?: (id: string, newName: string) => void;
  validator?: (value: string) => boolean;
  highlightLetter?: string;
}

const TREE_NODE_NAME = 'boxTreeNodeName';
const TREE_NODE_ATTACHABLE_NAME = 'boxTreeNodeAttachableName';
const TREE_NODE_PREFIX_ICON = 'boxTreeNodePrefixIcon';

function TreeNodeName(props: TreeNodeNameOptions) {
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
    highlightLetter,
  } = props;

  const ref = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  const onDoubleClick = useCallback(() => {
    if (
      type === TreeNodeType.Root ||
      disableRename ||
      pointerAction?.current !== PointerAction.Idle
    ) {
      return;
    }
    setIsEditing(true);
  }, [type, disableRename, pointerAction]);

  useEffect(() => {
    if (showInput) {
      setIsEditing(true);
    } else {
      ref.current?.blur();
      setIsEditing(false);
    }
  }, [showInput, name]);

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus({ preventScroll: true });
      ref.current?.select();
    }
  }, [isEditing]);

  const onBlur = useCallback(
    (value: string) => {
      onRename && onRename(id, value);
      setIsEditing(false);
    },
    [id, onRename],
  );

  const className = useClassName(
    [
      styles.name,
      TREE_NODE_NAME,
      type === TreeNodeType.Attachable ? TREE_NODE_ATTACHABLE_NAME : undefined,
    ],
    [type],
  );

  const toShowInput = isEditing && !disableRename;

  useEffect(() => {
    onEditing?.(toShowInput ? id : undefined);
  }, [toShowInput, onEditing, id]);

  const nameText = useMemo(() => {
    let matchRes = highlightLetter && name.match(highlightLetter);
    if (!highlightLetter || !matchRes) {
      return <span>{name}</span>;
    }

    const contentJSX: JSX.Element[] = [];
    let content = name;

    while (matchRes) {
      contentJSX.push(
        <span key={contentJSX.length}>{content.slice(0, matchRes.index)}</span>,
      );
      contentJSX.push(
        <span key={contentJSX.length} className={styles.highlightLetter}>
          {highlightLetter}
        </span>,
      );

      content = content.slice((matchRes.index || 0) + highlightLetter.length);
      matchRes = content.match(highlightLetter);
    }

    if (content) {
      contentJSX.push(<span key={contentJSX.length}>{content}</span>);
    }

    return <div>{contentJSX}</div>;
  }, [highlightLetter, name]);

  return (
    <div
      className={className}
      onDoubleClick={onDoubleClick}
      style={{ minWidth: `calc(100% - ${indentLength}px)` }}
    >
      <div style={{ visibility: toShowInput ? 'hidden' : 'visible' }}>
        {nameText}
      </div>
      {toShowInput && (
        <Input
          ref={ref}
          type="noBorder"
          size="custom"
          valueType="string"
          value={name}
          maxLength={maxLength}
          className={styles.nameInput}
          onBlur={onBlur}
          validator={validator}
        />
      )}
    </div>
  );
}

interface TreeNodeOptions {
  data: TreeNodeData;
  onClickExpandBtn: () => void;
  status: TreeNodeStatus;
  onSelect: (ev: React.MouseEvent) => void;
  showNameInput: boolean;
  children?: ReactNode;
  attachedNode?: ReactNode;
  indents: ReactNode;
  /**
   * 指定节点的类名
   */
  className?: string;
  /**
   * 是否禁用Hover
   * @default false
   */
  disableHover?: boolean;
  /**
   * 是否禁用重命名
   * @default false
   */
  disableRename?: boolean;
  /**
   * 是否禁用拖拽
   * @default false
   */
  disableDragging?: boolean;
}

const PADDING = 8;

const TREE_NODE_CONTAINER = 'boxTreeNodeContainer';
const TREE_NODE_ATTACHABLE_ICON = 'boxTreeNodeAttachableIcon';

export function TreeNode(props: TreeNodeOptions) {
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
    disableHover: propsDisableHover = false,
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
    invisible = false,
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
    isMobile,
  } = useContext(TreeNodeContext);

  const expandButton = useMemo(() => {
    const onMouseDown = (ev: React.MouseEvent) => ev.stopPropagation();
    const onClick = (ev: React.MouseEvent) => {
      ev.stopPropagation();
      onClickExpandBtn();
    };
    // Attachable节点，如果是treeLine样式，使用带连接线的+/-按钮样式
    if (type === TreeNodeType.Attachable && attachableStyle === 'treeLine') {
      // 有子节点，显示+/-按钮
      if (childrenIds?.length) {
        return (
          <div className={styles.expandBtn}>
            <div className={styles.left}>
              <div className={styles.verticalLine}></div>
              <Button
                className={styles.icon}
                type="icon"
                icon={expanded ? <Collapse /> : <Expand />}
                onMouseDown={onMouseDown}
                onClick={onClick}
              />
              {!isLast && <div className={styles.verticalLine}></div>}
            </div>
            <div className={styles.horizontalLine}></div>
          </div>
        );
      }
      // 没有子节点，只显示连接线
      return (
        <div className={styles.expandBtn}>
          <div className={styles.rightAngle}></div>
          {!isLast && <div className={styles.lineToNext}></div>}
        </div>
      );
    }

    // Attachable节点普通样式，如果children长度为0，自动隐藏展开按钮
    if (type === TreeNodeType.Attachable && !childrenIds?.length) {
      return <div className={styles.icon} />;
    }

    // Basic节点，使用箭头样式，没有连接线
    return (
      <Button
        className={styles.icon}
        type="icon"
        icon={expandIcon}
        style={{
          transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
        }}
        onMouseDown={onMouseDown}
        onClick={onClick}
      />
    );
  }, [
    expandIcon,
    attachableStyle,
    expanded,
    isLast,
    type,
    childrenIds?.length,
    onClickExpandBtn,
  ]);

  const extraIcon = useMemo(() => {
    if (!icon) {
      return;
    }
    if (typeof icon === 'string') {
      const className =
        type === TreeNodeType.Attachable
          ? [styles.extraIcon, TREE_NODE_ATTACHABLE_ICON].join(' ')
          : styles.extraIcon;

      return <Icon className={className} symbolId={icon} />;
    }
    return icon;
  }, [icon, type]);

  const stickyPrefixIcon = useMemo(() => {
    if (!prefixIcon) {
      return;
    }
    if (typeof prefixIcon === 'string') {
      return (
        <div className={`${styles.stickyPrefixIcon} ${TREE_NODE_PREFIX_ICON}`}>
          <Icon className={styles.extraIcon} symbolId={prefixIcon} />
        </div>
      );
    }
    return (
      <div className={`${styles.stickyPrefixIcon} ${TREE_NODE_PREFIX_ICON}`}>
        {prefixIcon}
      </div>
    );
  }, [prefixIcon]);

  const stickySuffixIcon = useMemo(() => {
    if (!suffixIcon) {
      return;
    }
    if (typeof suffixIcon === 'string') {
      return (
        <div className={styles.stickySuffixIconWrap}>
          <div className={styles.stickySuffixIcon}>
            <Icon className={styles.extraIcon} symbolId={suffixIcon} />
          </div>
        </div>
      );
    }
    return (
      <div className={styles.stickySuffixIconWrap}>
        <div className={styles.stickySuffixIcon}>{suffixIcon}</div>
      </div>
    );
  }, [suffixIcon]);

  const totalIndentLength = useMemo(() => {
    const expandBtn = isLeaf
      ? 0
      : type === TreeNodeType.Attachable
        ? LINE_INDENT_LENGTH
        : INDENT_LENGTH;
    const iconLength = icon === undefined ? 0 : EXTRA_ICON_LENGTH;
    const prefixIconLength = prefixIcon === undefined ? 0 : PREFIX_ICON_LENGTH;
    const suffixIconLength = suffixIcon === undefined ? 0 : SUFFIX_ICON_LENGTH;

    return (
      indentLength +
      expandBtn +
      iconLength +
      prefixIconLength +
      suffixIconLength
    );
  }, [isLeaf, type, icon, prefixIcon, suffixIcon, indentLength]);

  const calcMarkerLeft = useCallback((data: TreeNodeData) => {
    const expandBtn = data.isLeaf
      ? 0
      : data.type === TreeNodeType.Attachable
        ? LINE_INDENT_LENGTH
        : INDENT_LENGTH;
    return PADDING + data.indentLength + expandBtn;
  }, []);

  const getLineMarker = useCallback(
    (type: DropType, left?: number) => {
      let markerLeft = left;
      if (markerLeft === undefined) {
        const realData =
          dropTarget && getRealDropData(dropTarget, treeNodeDataMap);
        if (realData) {
          markerLeft = calcMarkerLeft(realData);
        }
      }

      if (markerLeft === undefined) {
        return;
      }

      return (
        <div
          className={styles.markerLine}
          style={{
            width: `calc(100% - ${markerLeft}px)`,
            left: markerLeft,
            top: type === 'top' ? -0.5 : 'unset',
            bottom: type === 'bottom' ? -0.5 : 'unset',
          }}
        />
      );
    },
    [calcMarkerLeft, dropTarget, treeNodeDataMap],
  );

  // box样式或上方的提示线
  const marker = useMemo(() => {
    if (!dropTarget || !draggingItem?.current) {
      return;
    }

    if (dropTarget.dropId === id && dropTarget.type === 'top') {
      return getLineMarker('top');
    }

    if (
      (dropTarget.dropId === id && dropTarget.type === 'box') ||
      dropTarget.parentId === id
    ) {
      return <div className={styles.markerBox} />;
    }
  }, [dropTarget, draggingItem, id, getLineMarker]);

  // 下方的提示线
  const bottomMarker = useMemo(() => {
    if (!dropTarget || !draggingItem?.current) {
      return;
    }

    if (dropTarget.dropId === id && dropTarget.type === 'bottom') {
      return getLineMarker('bottom');
    }

    // 插入到已展开的attachable节点中
    if (
      dropTarget.dropId === id &&
      dropTarget.parentId === id &&
      dropTarget.type === 'box'
    ) {
      const targetNode = treeNodeDataMap.get(dropTarget.dropId);
      if (!targetNode || !targetNode.childrenIds) {
        return;
      }

      const firstChild = treeNodeDataMap.get(targetNode.childrenIds[0]);
      if (!firstChild) {
        return;
      }
      // marker和第一个子节点对齐
      const left = calcMarkerLeft(firstChild);
      return getLineMarker('bottom', left);
    }
  }, [
    dropTarget,
    draggingItem,
    id,
    getLineMarker,
    treeNodeDataMap,
    calcMarkerLeft,
  ]);

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
      default:
        break;
    }
    if (disableHover || propsDisableHover) {
      list.push(styles.disableHover);
    }
    return list.join(' ');
  }, [prefixIcon, status, disableHover, propsDisableHover]);

  const setLevelOffset = useCallback(
    (out: DropTarget, clientX: number, rectLeft: number) => {
      const targetNode = treeNodeDataMap.get(out.dropId);
      if (!targetNode) {
        return;
      }

      // 只有 当前marker在下方，并且当前目标位于组内最后一位时
      // 需要设置level Offset
      if (out.type !== 'bottom' || !targetNode.isLast) {
        return;
      }

      const realData = getRealDropData(out, treeNodeDataMap);

      if (!realData) {
        return;
      }

      const currLeft = rectLeft + calcMarkerLeft(realData);

      // 向左偏移
      // 最多偏移至最上层的父节点下
      if (realData.isLast && realData.parentId && clientX < currLeft) {
        const parentId = treeNodeDataMap.get(realData.parentId)?.parentId;
        if (parentId) {
          out.parentId = parentId;
          out.levelOffset -= 1;
          return;
        }
      }

      // 向右偏移
      // 最大偏移至0
      const indent =
        realData.type === TreeNodeType.Attachable
          ? LINE_INDENT_LENGTH
          : INDENT_LENGTH;
      if (out.levelOffset < 0 && clientX > currLeft + indent) {
        out.parentId = realData.id;
        out.levelOffset += 1;
      }
    },
    [calcMarkerLeft, treeNodeDataMap],
  );

  const updateDropTarget = useCallback(
    (out: DropTarget) => {
      // 拖拽attachable节点到被绑定的basic节点上，更新dropTarget的dropId
      if (!draggingItem || draggingItem.current !== DraggingItem.Attachable) {
        return;
      }

      const hoverTarget = treeNodeDataMap.get(out.hoverId);
      let attachToId = hoverTarget?.attachTo;
      if (!attachToId) {
        const breadcrumbs = getBreadcrumbs(treeNodeDataMap, out.hoverId);
        const topParent = treeNodeDataMap.get(
          breadcrumbs[breadcrumbs.length - 1],
        );
        attachToId = topParent?.attachTo;
      }

      const attachedNode = attachToId
        ? treeNodeDataMap.get(attachToId)
        : undefined;

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
    },
    [draggingItem, treeNodeDataMap],
  );

  const processDropTarget = useCallback(
    (ev: React.MouseEvent) => {
      const { top, height, bottom, left } =
        ev.currentTarget.getBoundingClientRect();
      if (ev.clientY < top || ev.clientY > bottom) {
        return;
      }

      const target: DropTarget = {
        hoverId: id,
        dropId: id,
        parentId,
        type: ev.clientY < top + height / 2 ? 'top' : 'bottom',
        levelOffset: 0,
      };

      // 未展开父节点
      // 当鼠标位于元素高度中间1/3时移入组内
      const unExpandedIsBox =
        !isLeaf &&
        !expanded &&
        ev.clientY > top + height / 3 &&
        ev.clientY < bottom - height / 3;

      // 已展开父节点
      // 当鼠标位于元素高度下半截内时移入组内
      const expandedIsBox =
        !isLeaf && expanded && ev.clientY >= top + height / 2;

      if (unExpandedIsBox || expandedIsBox) {
        target.parentId = id;
        target.type = 'box';
      }

      updateDropTarget(target);

      // 还原上一次move计算得到的层级偏移量
      if (
        dropTarget &&
        dropTarget.hoverId === id &&
        dropTarget.type === 'bottom' &&
        target.type === 'bottom'
      ) {
        target.parentId = dropTarget.parentId;
        target.levelOffset = dropTarget.levelOffset;
      }

      const newTarget = contextOnDragOver(ev, target);

      // 根据鼠标位置设置层级偏移
      newTarget && setLevelOffset(newTarget, ev.clientX, left);

      setDropTarget(newTarget);
    },
    [
      id,
      isLeaf,
      parentId,
      expanded,
      dropTarget,
      setDropTarget,
      setLevelOffset,
      updateDropTarget,
      contextOnDragOver,
    ],
  );

  const onMouseMove = useCallback(
    (ev: React.MouseEvent) => {
      if (pointerAction?.current === PointerAction.Idle) {
        return;
      }

      // mousedown之后的首次move事件，视为开始拖拽
      if (pointerAction?.current === PointerAction.PointerDown) {
        if (!disableDragging && type !== TreeNodeType.Root) {
          contextOnDragStart();
        }
        return;
      }
      processDropTarget(ev);
    },
    [
      type,
      pointerAction,
      disableDragging,
      processDropTarget,
      contextOnDragStart,
    ],
  );

  const shouldUseClick = useCallback(
    (ev: React.MouseEvent) =>
      (status === TreeNodeStatus.Selected ||
        status === TreeNodeStatus.RelativeSelected) &&
      !isMetaKeyPressed(ev) &&
      !ev.shiftKey,
    [status],
  );

  const onClick = useCallback(
    (ev: React.MouseEvent) => {
      ev.stopPropagation();
      shouldUseClick(ev) && onSelect(ev);
    },
    [shouldUseClick, onSelect],
  );

  const onPointerDown = useCallback(
    (ev: React.PointerEvent) => {
      ev.stopPropagation();

      !shouldUseClick(ev) && onSelect(ev);
      ev.pointerType === 'mouse' && ev.button === 0 && contextOnMouseDown();
    },
    [contextOnMouseDown, onSelect, shouldUseClick],
  );

  const onDragStart = useCallback(
    (ev: React.DragEvent) => {
      // 这里调用ev.dataTransfer.setData所传递数据内容并不重要
      // 调用这个方法只是为了让移动端可以触发 drag 的一系列事件
      // 如果不传递数据的话，IOS端没有办法触发drag
      // ev.dataTransfer.setData('text/plain', '_');
      ev.dataTransfer.setData(
        '_',
        `
          Here, the content of the data passed to 'ev.dataTransfer.setData' is not important.
          Calling this method is simply to enable a series of drag events to be triggered on mobile devices.
          If no data is passed, drag events cannot be triggered on iOS devices.
        `,
      );
      ev.dataTransfer.dropEffect = 'none';
      ev.button === 0 && contextOnDragStart();
    },
    [contextOnDragStart],
  );

  const onDragEnd = useCallback(
    (ev: React.DragEvent) => {
      ev.button === 0 && contextOnPointerUp();
    },
    [contextOnPointerUp],
  );

  const onDragOver = useCallback(
    (ev: React.DragEvent) => {
      ev.preventDefault();
      processDropTarget(ev);
    },
    [processDropTarget],
  );

  const onDrop = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
  }, []);

  const classNames = useClassName(
    [styles.treeNode, optionClassName],
    [optionClassName],
  );

  return (
    <div className={classNames}>
      {!invisible && (
        <div className={styles.notChildren}>
          <div
            id={`${NODE_ID_PREFIX}${id}`}
            className={styles.interaction}
            onClick={onClick}
            onPointerDown={onPointerDown}
            onMouseMove={onMouseMove}
            draggable={isMobile}
            onDragStart={isMobile ? onDragStart : undefined}
            onDragEnd={isMobile ? onDragEnd : undefined}
            onDragOver={isMobile ? onDragOver : undefined}
            onDrop={isMobile ? onDrop : undefined}
          >
            <div className={nameClassName}>
              {stickyPrefixIcon}
              {indents}
              {!isLeaf && !disableExpand && expandButton}
              {extraIcon}
              <TreeNodeName
                id={id}
                name={name}
                type={type}
                showInput={showNameInput}
                indentLength={totalIndentLength}
                disableRename={disableRename}
                pointerAction={pointerAction}
                maxLength={nameMaxLength}
                onEditing={onEditingNode}
                onRename={onRename}
                validator={renameValidator}
                highlightLetter={highlightLetter}
              />
              {stickySuffixIcon}
            </div>
            {marker}
          </div>
          {attachedNode}
          {bottomMarker}
        </div>
      )}
      {expanded && children}
    </div>
  );
}
