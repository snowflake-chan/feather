export declare enum ColorOption {
    default = 0,
    monochrome = 1,
    mvColorScheme = 2,
    eightBit = 3,
    custom = 4
}
export declare const ColorEvent: {
    updateColor: string;
};
export declare function to8Bit(color: any): number;
export declare function to24Bit(packed: any): number[];
export declare class ColorTable {
    private _messages;
    colorsRgb: number[][];
    MSE: number[][];
    TR: number[][];
    private _currentIndex;
    constructor(options?: any);
    initColor(option: {
        type: ColorOption;
        customColors?: any;
    }): void;
    initWithExistColors(platte: any): void;
    setPbrArray(pbrArray: number[][]): void;
    setTRArray(trArray: number[][]): void;
    getHexColors(): string[];
    getHexColorById(idx: any): string;
    getRgbById(idx: any): number[];
    getRgbColorById(idx: any): number[];
    getRGBArray(): {
        r: number;
        g: number;
        b: number;
    }[];
    setCurrentIndex(idx: any): void;
    getCurrentColor(): {
        index: number;
        colorHex: number[];
    };
    updateColor(idx: any, c: any): void;
    updatePBRProperties(idx: any, properties: any): void;
    updateTR(idx: any, properties: any): void;
    getColor(idx: any): number[] | undefined;
    getPBRProperties(idx: any): number[] | undefined;
    getTRProperties(idx: any): number[] | undefined;
    on(event: any, fn: any): this;
    fire(event: any, args?: any): this | undefined;
    remove(event: any, fn: any): this;
    removeAll(event: any): this;
}
//# sourceMappingURL=color_table.d.ts.map