"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishProtocol = exports.SaveGameRPCSchema = exports.CancelPublishRPCSchema = exports.PublishRPCSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const replica_schema_1 = require("../replica/replica-schema");
exports.PublishRPCSchema = new schema_1.MuStruct({
    token: replica_schema_1.RPCTokenSchema,
    shortname: new schema_1.MuASCII(),
});
exports.CancelPublishRPCSchema = new schema_1.MuStruct({
    token: replica_schema_1.RPCTokenSchema,
    // TODO add other args here
});
exports.SaveGameRPCSchema = new schema_1.MuStruct({
    token: replica_schema_1.RPCTokenSchema,
    saveAs: new schema_1.MuUTF8(''),
});
exports.PublishProtocol = {
    name: 'publishing',
    client: {
        init: new schema_1.MuStruct({
            gameId: new schema_1.MuVarint(),
        }),
        rpcResponse: replica_schema_1.RPCResultSchema,
    },
    server: {
        saveGame: exports.SaveGameRPCSchema,
    },
};
//# sourceMappingURL=publish-schema.js.map