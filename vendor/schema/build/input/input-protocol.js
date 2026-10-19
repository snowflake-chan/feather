"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputProtocolSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.InputProtocolSchema = {
    name: 'input',
    client: {
        setCameraPitch: new schema_1.MuUint8(0),
        setCameraYaw: new schema_1.MuUint8(0),
    },
    server: {},
};
//# sourceMappingURL=input-protocol.js.map