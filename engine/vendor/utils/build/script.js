"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safePropExpr = safePropExpr;
exports.safeReadBoolExpr = safeReadBoolExpr;
exports.safeReadNumExpr = safeReadNumExpr;
exports.safeReadStrExpr = safeReadStrExpr;
function safePropExpr(obj, prop) {
    if (typeof prop === 'string') {
        return `${obj}.${prop}`;
    }
    else if (typeof prop === 'number') {
        return `${obj}[${prop}]`;
    }
    else if (typeof prop === 'symbol') {
        throw new Error('symbol not supported');
    }
    return '';
}
function safeReadBoolExpr(propExpr) {
    return `(!!${propExpr})`;
}
function safeReadNumExpr(propExpr, minVal, maxVal) {
    let readExpr = `(+${propExpr} || 0)`;
    if (minVal !== -Infinity) {
        readExpr = `Math.max(${minVal}, ${readExpr})`;
    }
    if (maxVal !== Infinity) {
        readExpr = `Math.min(${maxVal}, ${readExpr})`;
    }
    return readExpr;
}
function safeReadStrExpr(propExpr) {
    return `('' + ${propExpr})`;
}
