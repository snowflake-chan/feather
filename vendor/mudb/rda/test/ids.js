"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const _id_1 = require("../_id");
function idRangeOk(pred, succ, range) {
    for (let i = 0; i < range.length; ++i) {
        if ((0, _id_1.compareId)(pred, range[i]) >= 0) {
            return false;
        }
        if ((0, _id_1.compareId)(range[i], succ) >= 0) {
            return false;
        }
        if (i > 0 && (0, _id_1.compareId)(range[i - 1], range[i]) >= 0) {
            return false;
        }
    }
    return true;
}
tape('id initialization', (t) => {
    const N = [
        1,
        2,
        10,
        256,
        65536,
        (1 << 20),
    ];
    N.forEach((n) => {
        const ids = (0, _id_1.initialIds)(n);
        t.ok(idRangeOk(_id_1.ID_MIN, _id_1.ID_MAX, ids), 'initialized valid ids');
        t.equals((0, _id_1.initialIds)(n).join(), ids.join(), 'initialization deterministic');
    });
    t.end();
});
tape('id allocate', (t) => {
    function validateInsertion(ids, index, count) {
        const pred = index > 0 ? ids[index - 1] : _id_1.ID_MIN;
        const succ = index < ids.length ? ids[index] : _id_1.ID_MAX;
        const alloc = (0, _id_1.allocIds)(pred, succ, count);
        t.ok(idRangeOk(pred, succ, alloc), 'allocated ids ok');
        ids.splice(index, 0, ...alloc);
        t.ok(idRangeOk(_id_1.ID_MIN, _id_1.ID_MAX, ids), 'inserted ids ok');
        return ids;
    }
    for (let i = 0; i < 100; ++i) {
        let ids = [];
        for (let j = 0; j < 100; ++j) {
            ids = validateInsertion(ids, Math.floor(Math.random() * (ids.length + 1)), 128);
        }
    }
    validateInsertion(['aaaa', 'baaa'], 1, (1 << 16));
    t.end();
});
function searchBruteForce(ids, id) {
    for (let i = 0; i < ids.length; ++i) {
        const d = (0, _id_1.compareId)(ids[i], id);
        if (d >= 0) {
            return i;
        }
    }
    return ids.length;
}
tape('id search', (t) => {
    function testSearch(ids, id, msg) {
        t.equals((0, _id_1.searchId)(ids, id), searchBruteForce(ids, id), msg);
    }
    function testList(ids) {
        for (let i = 0; i < ids.length; ++i) {
            testSearch(ids, ids[i], `search element ${i}`);
        }
        testSearch(ids, _id_1.ID_MIN, 'min');
        testSearch(ids, _id_1.ID_MAX, 'max');
        const alloc = (0, _id_1.allocIds)(_id_1.ID_MIN, _id_1.ID_MAX, 1000);
        for (let i = 0; i < alloc.length; ++i) {
            testSearch(ids, alloc[i], 'random');
        }
        for (let i = 0; i <= ids.length; ++i) {
            (0, _id_1.allocIds)(i > 0 ? ids[i - 1] : _id_1.ID_MIN, i < ids.length ? ids[i] : _id_1.ID_MAX, 16).forEach((id) => testSearch(ids, id, `range ${i}`));
        }
    }
    testList(['@']);
    testList(['1', '2']);
    testList(['11', '33', '88']);
    testList(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    testList((0, _id_1.initialIds)(100));
    t.end();
});
//# sourceMappingURL=ids.js.map