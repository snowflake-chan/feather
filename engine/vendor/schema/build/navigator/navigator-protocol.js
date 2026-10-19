"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigatorProtocol = void 0;
const navigator_schema_1 = require("./navigator-schema");
exports.NavigatorProtocol = {
    name: 'navigator',
    client: {
        postMessage: navigator_schema_1.PostMessageSchema,
    },
    server: {
        messageEvent: navigator_schema_1.MessageEventSchema,
    },
};
//# sourceMappingURL=navigator-protocol.js.map