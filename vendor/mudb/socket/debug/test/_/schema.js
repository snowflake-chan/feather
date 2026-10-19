"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protocolSchema = void 0;
const schema_1 = require("../../../../schema");
exports.protocolSchema = {
    client: {
        pong: new schema_1.MuUint32(),
    },
    server: {
        ping: new schema_1.MuUint32(),
    },
};
//# sourceMappingURL=schema.js.map