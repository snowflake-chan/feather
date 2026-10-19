"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuUnion = void 0;
class MuUnion {
    constructor(schemaSpec, identityType) {
        this.muType = 'union';
        this.muData = schemaSpec;
        this._types = Object.keys(schemaSpec).sort();
        if (identityType) {
            this.identity = {
                type: identityType,
                data: schemaSpec[identityType].identity,
            };
        }
        else {
            this.identity = {
                type: '',
                data: void 0,
            };
        }
        const result = {};
        Object.keys(schemaSpec).forEach((subtype) => {
            result[subtype] = schemaSpec[subtype].json;
        });
        this.json = {
            type: 'union',
            identity: this.identity.type,
            data: result,
        };
    }
    alloc() {
        const type = this.identity.type;
        return {
            type,
            data: type ? this.muData[type].clone(this.identity.data) : void 0,
        };
    }
    free(union) {
        const schema = this.muData[union.type];
        if (schema) {
            schema.free(union.data);
        }
    }
    equal(a, b) {
        if (a.type !== b.type) {
            return false;
        }
        if (a.type === '') {
            return true;
        }
        return this.muData[a.type].equal(a.data, b.data);
    }
    clone(union) {
        const type = union.type;
        return {
            type,
            data: type ? this.muData[type].clone(union.data) : void 0,
        };
    }
    assign(dst, src) {
        const dType = dst.type;
        const sType = src.type;
        const schema = this.muData;
        dst.type = src.type;
        if (dst.type !== dType) {
            schema[dType] && schema[dType].free(dst.data);
            if (sType) {
                schema[sType] && (dst.data = schema[sType].clone(src.data));
            }
            else {
                dst.data = void 0;
            }
            return dst;
        }
        if (schema[dType]) {
            dst.data = schema[dType].assign(dst.data, src.data);
        }
        return dst;
    }
    diff(base, target, out) {
        out.grow(8);
        const head = out.offset;
        ++out.offset;
        let opcode = 0;
        const schema = this.muData[target.type];
        if (base.type === target.type) {
            if (schema.diff(base.data, target.data, out)) {
                opcode = 1;
            }
        }
        else {
            out.writeUint8(this._types.indexOf(target.type));
            if (schema.diff(schema.identity, target.data, out)) {
                opcode = 2;
            }
            else {
                opcode = 4;
            }
        }
        if (opcode) {
            out.writeUint8At(head, opcode);
            return true;
        }
        out.offset = head;
        return false;
    }
    patch(base, inp) {
        const result = this.clone(base);
        const opcode = inp.readUint8();
        if (opcode === 1) {
            result.data = this.muData[result.type].patch(result.data, inp);
        }
        else {
            result.type = this._types[inp.readUint8()];
            const schema = this.muData[result.type];
            if (opcode === 2) {
                result.data = schema.patch(schema.identity, inp);
            }
            else if (opcode === 4) {
                result.data = schema.clone(schema.identity);
            }
            else {
                throw new Error(`invalid opcode ${opcode}`);
            }
        }
        return result;
    }
    toJSON(union) {
        return {
            type: union.type,
            data: this.muData[union.type].toJSON(union.data),
        };
    }
    fromJSON(x) {
        if (typeof x === 'object' && x) {
            const type = x.type;
            if (typeof type === 'string' && type in this.muData) {
                return {
                    type,
                    data: this.muData[type].fromJSON(x.data),
                };
            }
        }
        return this.clone(this.identity);
    }
}
exports.MuUnion = MuUnion;
//# sourceMappingURL=union.js.map