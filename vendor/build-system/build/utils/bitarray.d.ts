export interface BitArrayData {
    data: number[];
    size: number;
}
export declare class BitArray {
    data: number[];
    size: number;
    constructor(size?: number);
    init(size: number): void;
    get(pos: number): boolean;
    set(pos: number, value?: boolean): void;
    load(data: BitArrayData): void;
    save(): {
        data: number[];
        size: number;
    };
}
//# sourceMappingURL=bitarray.d.ts.map