"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuRPCSchemas = void 0;
const schema_1 = require("../schema");
class MuRPCSchemas {
    error(message) {
        const result = this.responseSchema.alloc();
        result.type = 'error';
        result.data = message;
        return result;
    }
    constructor(protocol) {
        this.protocol = protocol;
        this.errorSchema = new schema_1.MuUTF8();
        this.tokenSchema = new schema_1.MuVarint();
        const argTable = {};
        const retTable = {};
        const methods = Object.keys(protocol.api);
        for (let i = 0; i < methods.length; ++i) {
            const m = methods[i];
            const s = protocol.api[m];
            argTable[m] = s.arg;
            retTable[m] = s.ret;
        }
        this.argSchema = new schema_1.MuUnion(argTable);
        this.retSchema = new schema_1.MuUnion(retTable);
        this.responseSchema = new schema_1.MuUnion({
            success: this.retSchema,
            error: this.errorSchema,
        });
    }
}
exports.MuRPCSchemas = MuRPCSchemas;
//# sourceMappingURL=protocol.js.map