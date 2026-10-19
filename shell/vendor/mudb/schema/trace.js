"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSchemaTrace = exports.MuSchemaLogger = void 0;
class MuSchemaLogger {
    constructor(schema, name) {
        this.allocCount = 0;
        this.freeCount = 0;
        this._savedAlloc = 0;
        this._savedFree = 0;
        this._schema = schema;
        this.name = name;
    }
    begin() {
        this._savedAlloc = this._schema.allocCount;
        this._savedFree = this._schema.freeCount;
    }
    end() {
        this.allocCount += this._schema.allocCount - this._savedAlloc;
        this.freeCount += this._schema.freeCount - this._savedFree;
    }
}
exports.MuSchemaLogger = MuSchemaLogger;
class MuSchemaTrace {
    createLog(name) {
        const x = new MuSchemaLogger(this, name);
        this.logs.push(x);
        return x;
    }
    printLog() {
        const x = this.logs.map(({ name, allocCount, freeCount }) => {
            return {
                name,
                alloc: allocCount,
                free: freeCount,
                object: allocCount - freeCount,
            };
        });
        x.push({
            name: 'total',
            alloc: this.allocCount,
            free: this.freeCount,
            object: this.allocCount - this.freeCount,
        });
        if (console.table) {
            console.table(x);
        }
        else {
            console.log(x.map((y) => JSON.stringify(y)).join('\n'));
        }
    }
    constructor(base) {
        this.logs = [];
        this.allocCount = 0;
        this.freeCount = 0;
        this.schema = base;
        this.identity = base.identity;
        this.muType = base.muType;
        this.muData = base.muData;
        this.json = base.json;
    }
    alloc() {
        this.allocCount++;
        return this.schema.alloc();
    }
    free(x) {
        this.freeCount++;
        return this.schema.free(x);
    }
    equal(a, b) {
        return this.schema.equal(a, b);
    }
    clone(x) {
        this.allocCount++;
        return this.schema.clone(x);
    }
    assign(dst, src) {
        return this.schema.assign(dst, src);
    }
    diff(base, target, out) {
        return this.schema.diff(base, target, out);
    }
    patch(base, inp) {
        this.allocCount++;
        return this.schema.patch(base, inp);
    }
    toJSON(x) {
        return this.schema.toJSON(x);
    }
    fromJSON(json) {
        return this.schema.fromJSON(json);
    }
}
exports.MuSchemaTrace = MuSchemaTrace;
//# sourceMappingURL=trace.js.map