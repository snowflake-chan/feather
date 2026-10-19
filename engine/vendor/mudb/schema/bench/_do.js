"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deltaByteLength = deltaByteLength;
exports.diffPatchDuration = diffPatchDuration;
const perf_hooks_1 = require("perf_hooks");
const stream_1 = require("../../stream");
function deltaByteLength(schema, a, b) {
    const ws = new stream_1.MuWriteStream(1);
    schema.diff(a, b, ws);
    console.log(`${JSON.stringify(a)} -> ${JSON.stringify(b)}: ${ws.bytes().length}`);
}
function diffPatchDuration(schema, a, b, rounds, id = '', sampleSize = 9) {
    const diffSample = [];
    const diffObserver = new perf_hooks_1.PerformanceObserver((list) => {
        const entry = list.getEntriesByName(`diff`)[0];
        if (entry) {
            perf_hooks_1.performance.clearMarks();
            diffSample.push(entry.duration);
            if (diffSample.length === sampleSize) {
                diffObserver.disconnect();
                diffSample.sort((x, y) => x - y);
                const median = diffSample[sampleSize >>> 1];
                console.log((id && `${id}: `) + `diff ${rounds} rounds: ${median}`);
            }
        }
    });
    diffObserver.observe({ entryTypes: ['measure'] });
    const wss = new Array(sampleSize * rounds);
    for (let i = 0; i < wss.length; ++i) {
        wss[i] = new stream_1.MuWriteStream(1);
    }
    for (let i = 0; i < sampleSize; ++i) {
        perf_hooks_1.performance.mark('A');
        for (let j = 0; j < rounds; ++j) {
            const ws = wss[i * rounds + j];
            schema.diff(a, b, ws);
        }
        perf_hooks_1.performance.mark('B');
        perf_hooks_1.performance.measure(`diff`, 'A', 'B');
    }
    const patchSample = [];
    const patchObserver = new perf_hooks_1.PerformanceObserver((list) => {
        const entry = list.getEntriesByName(`patch`)[0];
        if (entry) {
            perf_hooks_1.performance.clearMarks();
            patchSample.push(entry.duration);
            if (patchSample.length === sampleSize) {
                patchObserver.disconnect();
                patchSample.sort((x, y) => x - y);
                const median = patchSample[sampleSize >>> 1];
                console.log((id && `${id}: `) + `patch ${rounds} rounds: ${median}`);
            }
        }
    });
    patchObserver.observe({ entryTypes: ['measure'] });
    const rss = wss.map((ws) => new stream_1.MuReadStream(ws.bytes()));
    for (let i = 0; i < sampleSize; ++i) {
        perf_hooks_1.performance.mark('C');
        for (let j = 0; j < rounds; ++j) {
            const rs = rss[i * rounds + j];
            (rs.offset < rs.length) && schema.patch(a, rs);
        }
        perf_hooks_1.performance.mark('D');
        perf_hooks_1.performance.measure(`patch`, 'C', 'D');
    }
}
//# sourceMappingURL=_do.js.map