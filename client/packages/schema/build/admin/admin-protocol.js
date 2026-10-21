"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEventSchema = exports.AdminUserSetSchema = exports.AdminUserSchema = exports.AdminCommandSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const permission_rda_1 = require("../permissions/permission-rda");
exports.AdminCommandSchema = new schema_1.MuUnion({
    // stat sync
    pollUsers: new schema_1.MuVoid(),
    // chat policing
    ghost: new schema_1.MuBoolean(false),
    kick: new schema_1.MuVarint(),
    ban: new schema_1.MuVarint(),
    banIp: new schema_1.MuASCII(),
    redirect: new schema_1.MuStruct({
        userId: new schema_1.MuVarint(),
        href: new schema_1.MuUTF8(),
    }),
    alert: new schema_1.MuStruct({
        userId: new schema_1.MuVarint(),
        message: new schema_1.MuUTF8(),
    }),
    // user content and scripts
    scriptEval: new schema_1.MuUTF8(),
    serverEval: new schema_1.MuUTF8(),
    stopScripts: new schema_1.MuVoid(),
    reloadProject: new schema_1.MuVoid(),
    // really dangerous admin function
    exitProcess: new schema_1.MuVoid(),
    restartContainer: new schema_1.MuVoid(),
    updateHash: new schema_1.MuASCII(),
});
exports.AdminUserSchema = new schema_1.MuStruct({
    name: new schema_1.MuUTF8(),
    entityId: new schema_1.MuVarint(),
    userId: permission_rda_1.UserIdSchema,
    ipAddress: new schema_1.MuASCII(),
});
exports.AdminUserSetSchema = new schema_1.MuArray(exports.AdminUserSchema, Infinity);
exports.AdminEventSchema = new schema_1.MuUnion({
    users: exports.AdminUserSetSchema,
    log: new schema_1.MuUTF8(),
});
//# sourceMappingURL=admin-protocol.js.map