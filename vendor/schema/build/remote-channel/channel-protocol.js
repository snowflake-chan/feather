"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteChannelProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
exports.RemoteChannelProtocol = {
    name: 'remote-channel',
    client: {
        sendClientEvent: new schema_1.MuStruct({
            tick: new schema_1.MuVarint(),
            args: new schema_1.MuUTF8(),
        }),
    },
    server: {
        sendServerEvent: new schema_1.MuStruct({
            tick: new schema_1.MuVarint(),
            args: new schema_1.MuUTF8(),
        }),
    },
};
//# sourceMappingURL=channel-protocol.js.map