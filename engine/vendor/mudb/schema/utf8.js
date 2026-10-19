"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuUTF8 = void 0;
const _string_1 = require("./_string");
class MuUTF8 extends _string_1.MuString {
    constructor(identity) {
        super(identity || '', 'utf8');
    }
    diff(base, target, stream) {
        if (base !== target) {
            stream.writeString(target);
            return true;
        }
        return false;
    }
    patch(base, stream) {
        return stream.readString();
    }
}
exports.MuUTF8 = MuUTF8;
//# sourceMappingURL=utf8.js.map