"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrebakeCacheSchema = void 0;
const schema_1 = require("@box/mudb/schema");
const project_rda_1 = require("@box/schema/project/project-rda");
const hot_schema_1 = require("@box/schema/project/hot-schema");
const permission_rda_1 = require("@box/schema/permissions/permission-rda");
exports.PrebakeCacheSchema = new schema_1.MuStruct({
    voxelBytes: new schema_1.MuArray(new schema_1.MuBytes(), Infinity),
    hotProject: hot_schema_1.HotProjectSchema,
    coldProject: project_rda_1.ProjectRDA.stateSchema,
    permissions: permission_rda_1.PermissionRDA.stateSchema,
    extraProjectInfo: hot_schema_1.ExtraProjectInfoSchema,
    permissionsHash: new schema_1.MuASCII(),
    projectHash: new schema_1.MuASCII(),
});
//# sourceMappingURL=prebake-schema.js.map