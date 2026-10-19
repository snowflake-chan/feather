export declare class PQEvent {
    id: number;
    time: number;
    event: () => void;
    parent: PQEvent;
    left: PQEvent;
    right: PQEvent;
    constructor(id: number, time: number, event: () => void, parent: PQEvent, left: PQEvent, right: PQEvent);
}
export declare const NIL: PQEvent;
export declare function merge(a: PQEvent, b: PQEvent): PQEvent;
export declare function pop(root: PQEvent): PQEvent;
export declare function decreaseKey(root: PQEvent, p: PQEvent, time: number): PQEvent;
export declare function createNode(id: number, time: number, event: () => void): PQEvent;
//# sourceMappingURL=pq.d.ts.map