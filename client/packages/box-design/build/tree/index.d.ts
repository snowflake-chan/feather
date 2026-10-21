import React, { MutableRefObject, ReactNode } from 'react';
import { ComponentOptions } from '../interfaces';
import { TreeNodeData, TreeNodeType } from './tree-node';
import { SelectType } from './defs';
export declare const NODE_ID_PREFIX = "treeNode-";
export declare const INDENT_LENGTH = 16;
export declare const LINE_INDENT_LENGTH = 20;
export declare const EXTRA_ICON_LENGTH = 16;
export declare const PREFIX_ICON_LENGTH = 22;
export declare const SUFFIX_ICON_LENGTH = 22;
export interface TreeNode {
    id: string;
    name: string;
    type: TreeNodeType;
    icon?: string | ReactNode;
    attachedNode?: TreeNode;
    children?: TreeNode[];
    separator?: boolean;
    disableExpand?: boolean;
    className?: string;
    disableRename?: boolean;
    disableHover?: boolean;
    disableDragging?: boolean;
    invisible?: boolean;
    prefixIcon?: string | ReactNode;
    suffixIcon?: string | ReactNode;
}
interface TreeOptions extends ComponentOptions {
    treeData: TreeNode[];
    expandIcon: string | ReactNode;
    onExpand?: (ids: string[]) => void;
    expandedIds?: string[];
    defaultExpandedIds?: string[];
    onSelect?: (ids: string[], selectType: SelectType) => void;
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    onDragStart?: (ev: React.MouseEvent, draggingItem: DraggingItem) => void;
    onDragOver?: (target?: DropTarget) => DropTarget | undefined;
    onDragEnd?: (targetId?: string, dropType?: DropType) => void;
    abortRef?: MutableRefObject<() => void>;
    editingNodeId?: string;
    onEditingNode?: (id?: string) => void;
    nameMaxLength?: number;
    onRename?: (id: string, newName: string) => void;
    renameValidator?: (value: string) => boolean;
    onScroll?: React.UIEventHandler;
    attachableStyle?: AttachableStyle;
    highlightLetter?: string;
    isMobile?: boolean;
}
export type DropType = 'top' | 'bottom' | 'box';
export type AttachableStyle = 'treeLine' | 'normal';
export interface DropTarget {
    hoverId: string;
    dropId: string;
    type: DropType;
    levelOffset: number;
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
    onDragOver: (ev: React.MouseEvent, target: DropTarget) => DropTarget | undefined;
    nameMaxLength?: number;
    onEditingNode?: (id?: string) => void;
    onRename?: (id: string, newName: string) => void;
    renameValidator?: (value: string) => boolean;
    highlightLetter?: string;
    onPointerUp: () => void;
    isMobile?: boolean;
}
export declare enum PointerAction {
    Idle = 0,
    PointerDown = 1,
    DragStart = 2,
    Dragging = 3
}
export declare enum DraggingItem {
    None = 0,
    Attachable = 1,
    SingleBasic = 2,
    MultiBasic = 3,
    NotAllowed = 4
}
export declare const TreeNodeContext: React.Context<TreeNodeContextProps>;
export type TreeHandle = {
    scrollTo: (id: string, options?: ScrollIntoViewOptions) => void;
    scroll: (x: number, y: number) => void;
};
export declare const TreeView: React.ForwardRefRenderFunction<TreeHandle, TreeOptions>;
export declare const Tree: React.ForwardRefExoticComponent<TreeOptions & React.RefAttributes<TreeHandle>>;
export { TreeNodeType, SelectType };
//# sourceMappingURL=index.d.ts.map