export type RestrictProps<T, U> = Exclude<{
    [K in keyof T]: T[K] extends U ? K : undefined;
}[keyof T], symbol | undefined>;
export type RestrictObj<T, U> = {
    [K in RestrictProps<T, U>]: U;
};
export declare function safePropExpr(obj: string, prop: string | number | Symbol): string;
export declare function safeReadBoolExpr(propExpr: string): string;
export declare function safeReadNumExpr(propExpr: string, minVal: number, maxVal: number): string;
export declare function safeReadStrExpr(propExpr: string): string;
//# sourceMappingURL=script.d.ts.map