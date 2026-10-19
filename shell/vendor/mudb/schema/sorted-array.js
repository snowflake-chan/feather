"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuSortedArray = void 0;
const array_1 = require("./array");
function defaultCompare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
}
var SortedOp;
(function (SortedOp) {
    SortedOp[SortedOp["NONE"] = -1] = "NONE";
    SortedOp[SortedOp["SKIP"] = 0] = "SKIP";
    SortedOp[SortedOp["PATCH"] = 1] = "PATCH";
    SortedOp[SortedOp["INSERT"] = 2] = "INSERT";
    SortedOp[SortedOp["INSERT_IDENTITY"] = 3] = "INSERT_IDENTITY";
    SortedOp[SortedOp["COPY"] = 4] = "COPY";
})(SortedOp || (SortedOp = {}));
class MuSortedArray {
    stats() {
        return this._arraySchema.stats();
    }
    constructor(schema, capacity, compare, identity) {
        this.muType = 'sorted-array';
        this.muData = schema;
        this.capacity = capacity;
        this.compare = compare || defaultCompare;
        const arraySchema = this._arraySchema = new array_1.MuArray(schema, capacity, identity);
        this.identity = arraySchema.identity.sort(this.compare);
        this.json = {
            type: 'sorted-array',
            valueType: schema.json,
            identity: JSON.stringify(this.identity),
        };
        this.alloc = arraySchema.alloc;
        this.free = arraySchema.free;
        this.equal = arraySchema.equal;
        this.clone = arraySchema.clone;
        this.assign = arraySchema.assign;
        this.toJSON = arraySchema.toJSON;
        this.fromJSON = arraySchema.fromJSON;
    }
    diff(base, target, out) {
        if (base.length === 0 && target.length === 0) {
            return false;
        }
        const schema = this.muData;
        const compare = this.compare;
        out.grow(8);
        const head = out.offset;
        let opPtr = head;
        let opCount = 0;
        let opCode = SortedOp.NONE;
        out.offset += 4;
        let numOps = 0;
        function emitOp() {
            if (opCount > 0) {
                out.writeUint32At(opPtr, (opCount << 3) | opCode);
                numOps++;
            }
            out.grow(4);
            opPtr = out.offset;
            out.offset += 4;
        }
        let basePtr = 0;
        let targetPtr = 0;
        while (basePtr < base.length && targetPtr < target.length) {
            const baseItem = base[basePtr];
            const targetItem = target[targetPtr];
            const cmp = compare(baseItem, targetItem);
            if (cmp < 0) {
                if (opCode !== SortedOp.SKIP) {
                    emitOp();
                    opCount = 1;
                    opCode = SortedOp.SKIP;
                }
                else {
                    opCount++;
                }
                basePtr++;
            }
            else if (0 < cmp) {
                if (opCode === SortedOp.INSERT) {
                    if (schema.diff(schema.identity, targetItem, out)) {
                        opCount++;
                    }
                    else {
                        emitOp();
                        opCode = SortedOp.INSERT_IDENTITY;
                        opCount = 1;
                    }
                }
                else if (opCode === SortedOp.INSERT_IDENTITY) {
                    const prevOffset = out.offset;
                    out.grow(4);
                    out.offset += 4;
                    if (schema.diff(schema.identity, targetItem, out)) {
                        emitOp();
                        out.offset -= 4;
                        opPtr = prevOffset;
                        opCode = SortedOp.INSERT;
                        opCount = 1;
                    }
                    else {
                        out.offset -= 4;
                        opCount += 1;
                    }
                }
                else {
                    emitOp();
                    opCount = 1;
                    if (schema.diff(schema.identity, targetItem, out)) {
                        opCode = SortedOp.INSERT;
                    }
                    else {
                        opCode = SortedOp.INSERT_IDENTITY;
                    }
                }
                targetPtr++;
            }
            else {
                if (opCode === SortedOp.PATCH) {
                    if (schema.diff(baseItem, targetItem, out)) {
                        opCount++;
                    }
                    else {
                        emitOp();
                        opCode = SortedOp.COPY;
                        opCount = 1;
                    }
                }
                else if (opCode === SortedOp.COPY) {
                    const prevOffset = out.offset;
                    out.grow(4);
                    out.offset += 4;
                    if (schema.diff(baseItem, targetItem, out)) {
                        emitOp();
                        out.offset -= 4;
                        opPtr = prevOffset;
                        opCode = SortedOp.PATCH;
                        opCount = 1;
                    }
                    else {
                        out.offset -= 4;
                        opCount += 1;
                    }
                }
                else {
                    emitOp();
                    opCount = 1;
                    if (schema.diff(baseItem, targetItem, out)) {
                        opCode = SortedOp.PATCH;
                    }
                    else {
                        opCode = SortedOp.COPY;
                    }
                }
                basePtr++;
                targetPtr++;
            }
        }
        if (basePtr < base.length) {
            if (opCode !== SortedOp.SKIP) {
                emitOp();
                opCount = base.length - basePtr;
                opCode = SortedOp.SKIP;
            }
            else {
                opCount += base.length - basePtr;
            }
            basePtr++;
        }
        while (targetPtr < target.length) {
            const targetItem = target[targetPtr];
            if (opCode === SortedOp.INSERT) {
                if (schema.diff(schema.identity, targetItem, out)) {
                    opCount++;
                }
                else {
                    emitOp();
                    opCode = SortedOp.INSERT_IDENTITY;
                    opCount = 1;
                }
            }
            else if (opCode === SortedOp.INSERT_IDENTITY) {
                const prevOffset = out.offset;
                out.grow(4);
                out.offset += 4;
                if (schema.diff(schema.identity, targetItem, out)) {
                    emitOp();
                    out.offset -= 4;
                    opPtr = prevOffset;
                    opCode = SortedOp.INSERT;
                    opCount = 1;
                }
                else {
                    out.offset -= 4;
                    opCount += 1;
                }
            }
            else {
                emitOp();
                opCount = 1;
                if (schema.diff(schema.identity, targetItem, out)) {
                    opCode = SortedOp.INSERT;
                }
                else {
                    opCode = SortedOp.INSERT_IDENTITY;
                }
            }
            targetPtr++;
        }
        if (numOps === 0 && opCode === SortedOp.COPY && opCount === base.length) {
            out.offset = head;
            return false;
        }
        if (opCode !== SortedOp.SKIP) {
            emitOp();
        }
        out.offset -= 4;
        out.writeUint32At(head, numOps);
        return true;
    }
    patch(base, inp) {
        this._arraySchema.allocCount += 1;
        const schema = this.muData;
        const result = this.alloc();
        const numOps = inp.readUint32();
        let ptr = 0;
        let tLength = 0;
        for (let i = 0; i < numOps; ++i) {
            const code = inp.readUint32();
            const count = code >> 3;
            tLength += count;
            if (tLength > this.capacity) {
                throw new RangeError(`target length exceeds capacity ${this.capacity}`);
            }
            const op = code & 0x7;
            switch (op) {
                case SortedOp.INSERT_IDENTITY:
                    for (let j = 0; j < count; ++j) {
                        result.push(schema.clone(schema.identity));
                    }
                    break;
                case SortedOp.INSERT:
                    for (let j = 0; j < count; ++j) {
                        result.push(schema.patch(schema.identity, inp));
                    }
                    break;
                case SortedOp.PATCH:
                    for (let j = 0; j < count; ++j) {
                        result.push(schema.patch(base[ptr++], inp));
                    }
                    break;
                case SortedOp.COPY:
                    for (let j = 0; j < count; ++j) {
                        result.push(schema.clone(base[ptr++]));
                    }
                    break;
                case SortedOp.SKIP:
                    ptr += count;
                    break;
            }
        }
        return result;
    }
}
exports.MuSortedArray = MuSortedArray;
//# sourceMappingURL=sorted-array.js.map