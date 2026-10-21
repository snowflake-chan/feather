export class CodeGenBlock {
    public code:string[] = [];

    constructor (
        public func:CodeGenFunc,
    ) {}

    public def () {
        return this.func.def();
    }

    public push (...code:string[]) {
        this.code.push.apply(this.code, code);
    }

    public inject (x:any) {
        return this.func.context.inject(x);
    }
}

export class CodeGenFunc {
    public args:string[] = [];
    public vars:string[] = [];
    public blocks:CodeGenBlock[] = [];

    constructor (
        public name:string,
        public context:CodeGenContext,
    ) {}

    public arg () {
        const a = this.context.def();
        this.args.push(a);
        return a;
    }

    public def () {
        const v = this.context.def();
        this.vars.push(v);
        return v;
    }

    public block () {
        const b = new CodeGenBlock(this);
        this.blocks.push(b);
        return b;
    }
}

export class CodeGenContext {
    public funcs:CodeGenFunc[] = [];
    public injectTokens:string[] = [];
    public injectVals:string[] = [];
    public varCounter = 0;

    constructor (public name:string) {}

    public def () {
        return `v${this.varCounter++}`;
    }

    public inject (x:any) {
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

    public func (name:string) {
        const f = new CodeGenFunc(name, this);
        this.funcs.push(f);
        return f;
    }

    public compile (debug:boolean = false) {
        const args = this.injectTokens.slice();
        args.push(`
            ${this.funcs.map((b) => `
                function ${b.name}_${this.name}(${b.args.join()}){
                    ${b.vars.length > 0 ? `var ${b.vars.join()};` : '' }
                    ${b.blocks.map((c) => c.code.join('')).join('\n')}
                }`).join(';\n')}
            return {
                ${this.funcs.map((b) => `${b.name}:${b.name}_${this.name}`).join(',\n')}
            }`);
        if (debug) {
            console.log(args[args.length - 1]);
        }
        try {
            return Function.apply(null, args).apply(null, this.injectVals);
        } catch (e) {
            console.log(e.stack);
            console.log(`codegen failed`);
            console.log(args[args.length - 1]);
            throw e;
        }
    }
}