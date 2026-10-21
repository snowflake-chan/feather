import React, { ReactNode, type JSX } from 'react';
export declare enum TreeNodeType {
    Basic = 0,
    Attachable = 1,
    Root = 2
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
export declare enum TreeNodeStatus {
    Unselected = 0,
    Selected = 1,
    RelativeSelected = 2,
    Relative = 3
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
    className?: string;
    disableHover?: boolean;
    disableRename?: boolean;
    disableDragging?: boolean;
}
export declare function TreeNode(props: TreeNodeOptions): JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map