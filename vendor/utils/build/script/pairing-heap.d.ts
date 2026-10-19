export type Lambda = () => boolean;
export declare const NIL_LAMBDA: Lambda;
declare class PairingHeapNode {
    weight: number;
    taskId: number;
    lambda: Lambda;
    _serial: number;
    _parent: PairingHeapNode;
    _left: PairingHeapNode;
    _right: PairingHeapNode;
    constructor(weight: number, taskId: number, lambda: Lambda, _serial: number, _parent: PairingHeapNode, _left: PairingHeapNode, _right: PairingHeapNode);
}
export type Node = PairingHeapNode;
export declare function clearPool(): void;
export declare function stats(): {
    nodesCreated: number;
    nodesReused: number;
};
export declare const NIL: PairingHeapNode;
export declare function create(weight: number, taskId: number): PairingHeapNode;
export declare function free(node: PairingHeapNode): void;
export declare function cmp(a: PairingHeapNode, b: PairingHeapNode): boolean;
export declare function merge(a: PairingHeapNode, b: PairingHeapNode): PairingHeapNode;
export declare function takeMin(root: PairingHeapNode): PairingHeapNode;
export declare function decreaseKey(root: PairingHeapNode, p: PairingHeapNode): PairingHeapNode;
export {};
//# sourceMappingURL=pairing-heap.d.ts.map