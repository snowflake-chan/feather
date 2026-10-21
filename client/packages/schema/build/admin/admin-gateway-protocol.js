"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProtocol = void 0;
const schema_1 = require("@box/mudb/schema");
exports.AdminProtocol = {
    name: 'admin',
    client: {
        redirect: new schema_1.MuUTF8(),
        alert: new schema_1.MuUTF8(),
    },
    server: {
        closeWebsocket: new schema_1.MuVoid(),
        logCurrentStore: new schema_1.MuVoid(),
    },
};
//# sourceMappingURL=admin-gateway-protocol.js.map