"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilter = createFilter;
exports.createBuilder = createBuilder;
const murmur3_1 = require("./murmur3");
const seeds = [
    // they are just random numbers
    0x865cf75d, 0xba624a56, 0x5141fada, 0xdb228460, 0xe3781cd2, 0x508008d1,
    0x37549d09,
];
function createFilter(bitArray) {
    return function (s) {
        for (let i = 0; i < seeds.length; i++) {
            const pos = (0, murmur3_1.murmur3)(s, seeds[i]) % bitArray.size;
            if (!bitArray.get(pos)) {
                return false;
            }
        }
        return true;
    };
}
function createBuilder(bitArray, n, p = 0.01) {
    const m = Math.ceil((n * Math.log(p)) / Math.log(1 / Math.pow(2, Math.log(2))));
    bitArray.init(m);
    return function (s) {
        for (let i = 0; i < seeds.length; i++) {
            const pos = (0, murmur3_1.murmur3)(s, seeds[i]) % bitArray.size;
            bitArray.set(pos);
        }
    };
}
//# sourceMappingURL=bloom-filter.js.map