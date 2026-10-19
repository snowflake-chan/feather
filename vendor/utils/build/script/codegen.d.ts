export declare class CodeGenBlock {
    func: CodeGenFunc;
    code: string[];
    constructor(func: CodeGenFunc);
    def(): string;
    push(...code: string[]): void;
    inject(x: any): string;
}
export declare class CodeGenFunc {
    name: string;
    context: CodeGenContext;
    args: string[];
    vars: string[];
    blocks: CodeGenBlock[];
    constructor(name: string, context: CodeGenContext);
    arg(): string;
    def(): string;
    block(): CodeGenBlock;
}
export declare class CodeGenContext {
    name: string;
    funcs: CodeGenFunc[];
    injectTokens: string[];
    injectVals: string[];
    varCounter: number;
    constructor(name: string);
    def(): string;
    inject(x: any): string;
    func(name: string): CodeGenFunc;
    compile(debug?: boolean): any;
}
//# sourceMappingURL=codegen.d.ts.map