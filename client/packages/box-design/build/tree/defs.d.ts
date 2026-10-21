import { MutableRefObject } from 'react';
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
export declare enum TreeNodeType {
    Basic = 0,
    Attachable = 1,
    Root = 2
}
export declare enum MouseAction {
    Idle = 0,
    MouseDown = 1,
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
export type DropType = 'top' | 'bottom' | 'box';
export interface DropTarget {
    hoverId: string;
    dropId: string;
    type: DropType;
    levelOffset: number;
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
    onDragOver: (ev: React.MouseEvent, target: DropTarget) => DropTarget | undefined;
    nameMaxLength?: number;
    onRename?: (id: string, newName: string) => void;
    renameValidator?: (value: string) => boolean;
}
export declare const TreeNodeContext: import("react").Context<TreeNodeContextProps>;
export declare const INDENT_LENGTH = 16;
export declare const LINE_INDENT_LENGTH = 20;
export declare const EXTRA_ICON_LENGTH = 16;
export declare const NODE_ID_PREFIX = "treeNode-";
export declare enum SelectType {
    Single = 0,
    Multi = 1,
    Sequence = 2
}
export {};
//# sourceMappingURL=defs.d.ts.map