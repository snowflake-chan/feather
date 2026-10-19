"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuOption = void 0;
var TypeDiff;
(function (TypeDiff) {
    TypeDiff[TypeDiff["BECAME_UNDEFINED"] = 0] = "BECAME_UNDEFINED";
    TypeDiff[TypeDiff["BECAME_IDENTITY"] = 1] = "BECAME_IDENTITY";
    TypeDiff[TypeDiff["BECAME_DEFINED"] = 2] = "BECAME_DEFINED";
    TypeDiff[TypeDiff["STAYED_DEFINED"] = 3] = "STAYED_DEFINED";
})(TypeDiff || (TypeDiff = {}));
class MuOption {
    constructor(schema, identity, identityIsUndefined = false) {
        this.muType = 'option';
        this.muData = schema;
        if (identityIsUndefined) {
            this.identity = undefined;
        }
        else {
            this.identity = identity !== undefined ? schema.clone(identity) : schema.clone(schema.identity);
        }
        this.json = {
            type: 'option',
            valueType: schema.json,
            identity: JSON.stringify(this.identity),
        };
    }
    alloc() {
        return this.muData.alloc();
    }
    free(val) {
        if (val === undefined) {
            return;
        }
        this.muData.free(val);
    }
    equal(a, b) {
        if (a === undefined && b === undefined) {
            return true;
        }
        if (a !== undefined && b === undefined) {
            return false;
        }
        if (a === undefined && b !== undefined) {
            return false;
        }
        return this.muData.equal(a, b);
    }
    clone(val) {
        if (val === undefined) {
            return undefined;
        }
        return this.muData.clone(val);
    }
    assign(dst, src) {
        if (dst !== undefined && src !== undefined) {
            return this.muData.assign(dst, src);
        }
        return src;
    }
    diff(base, target, out) {
        if (base === undefined && target === undefined) {
            return false;
        }
        if (base === undefined && target !== undefined) {
            out.grow(1);
            if (this.muData.equal(this.muData.identity, target)) {
                out.writeUint8(TypeDiff.BECAME_IDENTITY);
                return true;
            }
            out.writeUint8(TypeDiff.BECAME_DEFINED);
            this.muData.diff(this.muData.identity, target, out);
            return true;
        }
        if (base !== undefined && target === undefined) {
            out.grow(1);
            out.writeUint8(TypeDiff.BECAME_UNDEFINED);
            return true;
        }
        if (this.muData.equal(base, target)) {
            return false;
        }
        out.grow(1);
        out.writeUint8(TypeDiff.STAYED_DEFINED);
        this.muData.diff(base, target, out);
        return true;
    }
    patch(base, inp) {
        const typeDiff = inp.readUint8();
        if (TypeDiff[typeDiff] === undefined) {
            throw new Error('Panic in muOption, invalid TypeDiff');
        }
        if (typeDiff == TypeDiff.BECAME_UNDEFINED) {
            return undefined;
        }
        if (typeDiff == TypeDiff.BECAME_DEFINED) {
            return this.muData.patch(this.muData.identity, inp);
        }
        if (typeDiff === TypeDiff.BECAME_IDENTITY) {
            return this.muData.clone(this.muData.identity);
        }
        if (typeDiff !== TypeDiff.STAYED_DEFINED || base === undefined) {
            throw new Error('Panic in muOption, invariants broken');
        }
        return this.muData.patch(base, inp);
    }
    toJSON(val) {
        if (val === undefined) {
            return undefined;
        }
        return this.muData.toJSON(val);
    }
    fromJSON(json) {
        if (json === undefined) {
            return undefined;
        }
        return this.muData.fromJSON(json);
    }
}
exports.MuOption = MuOption;
//# sourceMappingURL=option.js.map