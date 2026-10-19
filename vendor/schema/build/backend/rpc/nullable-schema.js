"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuNullable = void 0;
var TypeDiff;
(function (TypeDiff) {
    TypeDiff[TypeDiff["BECAME_NULL"] = 0] = "BECAME_NULL";
    TypeDiff[TypeDiff["BECAME_IDENTITY"] = 1] = "BECAME_IDENTITY";
    TypeDiff[TypeDiff["BECAME_NOTNULL"] = 2] = "BECAME_NOTNULL";
    TypeDiff[TypeDiff["STAYED_NOTNULL"] = 3] = "STAYED_NOTNULL";
})(TypeDiff || (TypeDiff = {}));
class MuNullable {
    constructor(schema, identity = null, identityIsNull = false) {
        this.muType = 'nullable';
        this.muData = schema;
        if (identityIsNull) {
            this.identity = null;
        }
        else {
            this.identity =
                identity !== null
                    ? schema.clone(identity)
                    : schema.clone(schema.identity);
        }
        this.json = {
            type: 'nullable',
            valueType: schema.json,
            identity: JSON.stringify(this.identity),
        };
    }
    alloc() {
        return this.muData.alloc();
    }
    free(val) {
        if (val === null) {
            return;
        }
        this.muData.free(val);
    }
    equal(a, b) {
        if (a === b && a === null) {
            return true;
        }
        if (a === null || b === null) {
            return false;
        }
        return this.muData.equal(a, b);
    }
    clone(val) {
        if (val === null) {
            return null;
        }
        return this.muData.clone(val);
    }
    assign(dst, src) {
        if (dst !== null && src !== null) {
            return this.muData.assign(dst, src);
        }
        return src;
    }
    diff(base, target, out) {
        if (base === null && target === null) {
            return false;
        }
        if (base === null && target !== null) {
            out.grow(1);
            if (this.muData.equal(this.muData.identity, target)) {
                out.writeUint8(TypeDiff.BECAME_IDENTITY);
                return true;
            }
            out.writeUint8(TypeDiff.BECAME_NOTNULL);
            this.muData.diff(this.muData.identity, target, out);
            return true;
        }
        if (base !== null && target === null) {
            out.grow(1);
            out.writeUint8(TypeDiff.BECAME_NULL);
            return true;
        }
        if (this.muData.equal(base, target)) {
            return false;
        }
        out.grow(1);
        out.writeUint8(TypeDiff.STAYED_NOTNULL);
        this.muData.diff(base, target, out);
        return true;
    }
    patch(base, inp) {
        const typeDiff = inp.readUint8();
        if (TypeDiff[typeDiff] === undefined) {
            throw new Error('Panic in muNullable, invalid TypeDiff');
        }
        if (typeDiff === TypeDiff.BECAME_NULL) {
            return null;
        }
        if (typeDiff === TypeDiff.BECAME_NOTNULL) {
            return this.muData.patch(this.muData.identity, inp);
        }
        if (typeDiff === TypeDiff.BECAME_IDENTITY) {
            return this.muData.clone(this.muData.identity);
        }
        if (typeDiff !== TypeDiff.STAYED_NOTNULL || base === null) {
            throw new Error('Panic in muNullable, invariants broken');
        }
        return this.muData.patch(base, inp);
    }
    toJSON(val) {
        if (val === null) {
            return null;
        }
        return this.muData.toJSON(val);
    }
    fromJSON(json) {
        if (json === null) {
            return null;
        }
        return this.muData.fromJSON(json);
    }
}
exports.MuNullable = MuNullable;
//# sourceMappingURL=nullable-schema.js.map