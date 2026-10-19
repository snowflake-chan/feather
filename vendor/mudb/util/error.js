"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeError = makeError;
function makeError(path) {
    return function (errOrMsg) {
        const msg = typeof errOrMsg === 'string' ? errOrMsg : errOrMsg.toString();
        return new Error(`${msg} [mudb/${path}]`);
    };
}
//# sourceMappingURL=error.js.map