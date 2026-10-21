import { MutableRefObject, createContext } from 'react';

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
  icon?: string;
  attachTo?: string;
  invisible?: boolean;
}

export enum TreeNodeType {
  Basic,
  Attachable,
  Root,
}

export enum MouseAction {
  Idle,
  MouseDown,
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

export type DropType = 'top' | 'bottom' | 'box';

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
  expandIcon: string;
  disableHover: boolean;
  treeNodeDataMap: Map<string, TreeNodeData>;
  mouseAction?: MutableRefObject<MouseAction>;
  draggingItem?: MutableRefObject<DraggingItem>;
  dropTarget?: DropTarget;
  setDropTarget: (target?: DropTarget) => void;
  onMouseDown: () => void;
  onDragStart: (ev: React.MouseEvent) => void;
  onDragOver: (
    ev: React.MouseEvent,
    target: DropTarget,
  ) => DropTarget | undefined;
  nameMaxLength?: number;
  onRename?: (id: string, newName: string) => void;
  renameValidator?: (value: string) => boolean;
}

export const TreeNodeContext = createContext<TreeNodeContextProps>({
  expandIcon: '',
  disableHover: false,
  treeNodeDataMap: new Map<string, TreeNodeData>(),
  setDropTarget: () => {},
  onMouseDown: () => {},
  onDragStart: () => {},
  onDragOver: () => undefined,
});

export const INDENT_LENGTH = 16;
export const LINE_INDENT_LENGTH = 20;
export const EXTRA_ICON_LENGTH = 16;
export const NODE_ID_PREFIX = 'treeNode-';

export enum SelectType {
  /**
   * 单选
   */
  Single,
  /**
   * 多选（command 或者 control）
   */
  Multi,
  /**
   * 序列多选（shift）
   */
  Sequence,
}
