"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test = require("tape");
const system_1 = require("../system");
test('cAF', (t) => {
    t.plan(3);
    function cb1() { cb1['called'] = true; }
    function cb2() { cb2['called'] = true; }
    function cb3() { cb3['called'] = true; }
    system_1.MuSystemScheduler.requestAnimationFrame(cb1);
    const handle = system_1.MuSystemScheduler.requestAnimationFrame(cb2);
    system_1.MuSystemScheduler.requestAnimationFrame(cb3);
    system_1.MuSystemScheduler.cancelAnimationFrame(handle);
    system_1.MuSystemScheduler.requestAnimationFrame(() => {
        t.true(cb1['called'], 'cb1 was called');
        t.notOk(cb2['called'], 'cb2 was not called');
        t.true(cb3['called'], 'cb3 was called');
        t.end();
    });
});
test('rAF does not eat errors', (t) => {
    if (typeof process !== 'undefined') {
        process.on('uncaughtException', () => {
            process.removeAllListeners('uncaughtException');
            t.pass('error bubbled up');
            t.end();
        });
    }
    system_1.MuSystemScheduler.requestAnimationFrame(() => {
        throw new Error('foo');
    });
});
//# sourceMappingURL=system.js.map