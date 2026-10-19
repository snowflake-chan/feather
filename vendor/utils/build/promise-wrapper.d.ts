export declare class PromiseWrapper<T> {
    handle: number;
    resolve: (value: T) => void;
    reject: (err?: any) => void;
    promise: Promise<T>;
    constructor(handle: number);
}
//# sourceMappingURL=promise-wrapper.d.ts.map