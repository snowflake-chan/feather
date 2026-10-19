"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenContext = exports.CodeGenFunc = exports.CodeGenBlock = void 0;
class CodeGenBlock {
    constructor(func) {
        this.func = func;
        this.code = [];
    }
    def() {
        return this.func.def();
    }
    push(...code) {
        this.code.push.apply(this.code, code);
    }
    inject(x) {
        return this.func.context.inject(x);
    }
}
exports.CodeGenBlock = CodeGenBlock;
class CodeGenFunc {
    constructor(name, context) {
        this.name = name;
        this.context = context;
        this.args = [];
        this.vars = [];
        this.blocks = [];
    }
    arg() {
        const a = this.context.def();
        this.args.push(a);
        return a;
    }
    def() {
        const v = this.context.def();
        this.vars.push(v);
        return v;
    }
    block() {
        const b = new CodeGenBlock(this);
        this.blocks.push(b);
        return b;
    }
}
exports.CodeGenFunc = CodeGenFunc;
class CodeGenContext {
    constructor(name) {
        this.name = name;
        this.funcs = [];
        this.injectTokens = [];
        this.injectVals = [];
        this.varCounter = 0;
    }
    def() {
        return `v${this.varCounter++}`;
    }
    inject(x) {
        for (let i = 0; i < this.injectVals.length; ++i) {
            if (this.injectVals[i] === x) {
                return this.injectTokens[i];
            }
        }
        const r = this.def();
        this.injectTokens.push(r);
        this.injectVals.push(x);
        return r;
    }
    func(name) {
        const f = new CodeGenFunc(name, this);
        this.funcs.push(f);
        return f;
    }
    compile(debug = false) {
        const args = this.injectTokens.slice();
        args.push(`
            ${this.funcs
            .map((b) => `
                function ${b.name}_${this.name}(${b.args.join()}){
                    ${b.vars.length > 0 ? `var ${b.vars.join()};` : ''}
                    ${b.blocks.map((c) => c.code.join('')).join('\n')}
                }`)
            .join(';\n')}
            return {
                ${this.funcs
            .map((b) => `${b.name}:${b.name}_${this.name}`)
            .join(',\n')}
            }`);
        if (debug) {
            console.log(args[args.length - 1]);
        }
        try {
            return Function.apply(null, args).apply(null, this.injectVals);
        }
        catch (e) {
            console.log(e.stack);
            console.log(`codegen failed`);
            console.log(args[args.length - 1]);
            throw e;
        }
    }
}
exports.CodeGenContext = CodeGenContext;
