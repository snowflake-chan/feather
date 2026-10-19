"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const error_1 = require("../error");
test('makeError()(string)', (t) => {
    const path = 'util/test/error';
    const msg = 'contrived error';
    const error = (0, error_1.makeError)(path);
    try {
        throw error(msg);
    }
    catch (e) {
        t.equal(e.toString(), `Error: ${msg} [mudb/${path}]`, e.toString());
        t.end();
    }
});
test('makeError()(Error)', (t) => {
    const path = 'util/test/error';
    const msg = 'contrived error';
    const error = (0, error_1.makeError)(path);
    try {
        throw error(new Error(msg));
    }
    catch (e) {
        t.equal(e.toString(), `Error: Error: ${msg} [mudb/${path}]`, e.toString());
        t.end();
    }
});
test('makeError()(SyntaxError)', (t) => {
    const path = 'util/test/error';
    const error = (0, error_1.makeError)(path);
    try {
        JSON.parse('');
    }
    catch (e) {
        t.true(/^Error: SyntaxError: /.test(error(e).toString()), error(e).toString());
        t.end();
    }
});
//# sourceMappingURL=error.js.map