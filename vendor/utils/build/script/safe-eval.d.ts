export declare function createUnsafeEval(environment: {
    [id: string]: any;
}): {
    expr: (expr: string) => any;
    module: (env: {
        [id: string]: any;
    }, src: string, filename: string) => any;
};
export declare function createSafeEval(environment: {
    [id: string]: any;
}): {
    expr: (expr: string) => any;
    module: (env: {
        [id: string]: any;
    }, src: string, filename: string) => any;
};
//# sourceMappingURL=safe-eval.d.ts.map