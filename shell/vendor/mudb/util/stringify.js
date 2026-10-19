"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stableStringify = stableStringify;
function stableStringify(base) {
    const result = [];
    const seen = [];
    function stringify(x_) {
        const x = x_ && x_.toJSON && typeof x_.toJSON === 'function'
            ? x_.toJSON()
            : x_;
        if (x === undefined) {
            return false;
        }
        if (x === true) {
            result.push('true');
            return true;
        }
        if (x === false) {
            result.push('false');
            return true;
        }
        if (typeof x === 'number') {
            result.push(isFinite(x) ? '' + x : 'null');
            return true;
        }
        if (typeof x !== 'object') {
            const res = JSON.stringify(x);
            if (typeof res === 'undefined') {
                return false;
            }
            result.push(res);
            return true;
        }
        if (x === null) {
            result.push('null');
            return true;
        }
        if (seen.indexOf(x) >= 0) {
            throw new TypeError('Converting circular structure to JSON');
        }
        seen.push(x);
        if (Array.isArray(x)) {
            result.push('[');
            for (let i = 0; i < x.length; ++i) {
                if (!stringify(x[i])) {
                    result.push('null');
                }
                if (i < x.length - 1) {
                    result.push(',');
                }
            }
            result.push(']');
        }
        else {
            result.push('{');
            const keys = Object.keys(x).sort();
            let needsComma = false;
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                if (needsComma) {
                    result.push(',');
                    needsComma = false;
                }
                result.push(`${JSON.stringify(key)}:`);
                if (!stringify(x[key])) {
                    result.pop();
                    if (i > 0 && i === keys.length - 1) {
                        result.pop();
                    }
                }
                else {
                    needsComma = true;
                }
            }
            result.push('}');
        }
        seen[seen.indexOf(x)] = seen[seen.length - 1];
        seen.pop();
        return true;
    }
    if (!stringify(base)) {
        return void 0;
    }
    return result.join('');
}
//# sourceMappingURL=stringify.js.map