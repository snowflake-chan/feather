"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitArray = void 0;
class BitArray {
    constructor(size) {
        this.data = [];
        this.size = 0;
        if (size) {
            this.init(size);
        }
    }
    init(size) {
        this.size = (size + 31) & -32;
        this.data = Array(this.size / 32).fill(0);
    }
    get(pos) {
        const idx = pos >> 5;
        const bit = 1 << (pos & 0x1f);
        return (this.data[idx] & bit) !== 0;
    }
    set(pos, value = true) {
        const idx = pos >> 5;
        const bit = 1 << (pos & 0x1f);
        this.data[idx] |= value ? bit : ~bit;
    }
    load(data) {
        this.data = data.data;
        this.size = data.size;
    }
    save() {
        return {
            data: this.data,
            size: this.size,
        };
    }
}
exports.BitArray = BitArray;
//# sourceMappingURL=bitarray.js.map