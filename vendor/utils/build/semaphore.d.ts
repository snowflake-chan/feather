export declare class Semaphore {
    counter: number;
    private _head;
    private _tail;
    constructor(counter?: number);
    spinP(I?: number): boolean;
    p(I?: number): Promise<void>;
    v(X?: number): void;
}
//# sourceMappingURL=semaphore.d.ts.map