"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const schema_1 = require("../../schema");
const index_1 = require("../index");
tape('constrain - float', (t) => {
    const R = new index_1.MuRDARegister(new schema_1.MuFloat64(), (x) => Math.max(0, Math.min(1, +x || 0)));
    t.equal(R.action(0.1), 0.1);
    t.equal(R.action(-0.1), 0);
    t.equal(R.action(1.1), 1);
    t.equal(R.action(NaN), 0);
    t.end();
});
tape('constrain - array', (t) => {
    const constrain = (a) => a.map((x) => Math.max(0, Math.min(1, +x || 0)));
    const R = new index_1.MuRDARegister(new schema_1.MuArray(new schema_1.MuFloat64(), Infinity), constrain);
    t.deepEqual(R.action([]), []);
    t.deepEqual(R.action([NaN, -0.1, 0, 0.1, 0.5, 1, 1.1]), [0, 0, 0, 0.1, 0.5, 1, 1]);
    t.end();
});
//# sourceMappingURL=constrain.js.map