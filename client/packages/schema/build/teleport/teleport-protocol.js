"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeleportProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
exports.TeleportProtocol = {
    name: 'teleport',
    client: {
        teleport: new schema_1.MuStruct({
            playHash: new schema_1.MuASCII(),
            serverId: new schema_1.MuUTF8(),
        }),
        editTeleport: new schema_1.MuASCII(),
    },
    server: {},
};
//# sourceMappingURL=teleport-protocol.js.map