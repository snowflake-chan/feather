"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prebakeMap = prebakeMap;
const bake_1 = require("../project/bake");
const stream_1 = require("@box/mudb/stream");
const prebake_schema_1 = require("../project/prebake-schema");
const hot_schema_1 = require("@box/schema/project/hot-schema");
const permission_rda_1 = require("@box/schema/permissions/permission-rda");
const project_rda_1 = require("@box/schema/project/project-rda");
const permission_serialize_1 = require("../permissions/permission-serialize");
const project_serialize_1 = require("../project/project-serialize");
const permission_init_1 = require("../permissions/permission-init");
function preloadHashes(content, hashes) {
    return __awaiter(this, void 0, void 0, function* () {
        const chunks = new Array(hashes.length);
        for (let i = 0; i < hashes.length; ++i) {
            chunks[i] = content.retrieve(hashes[i]);
        }
        const bytes = new Array(hashes.length);
        for (let i = 0; i < chunks.length; ++i) {
            const b = yield chunks[i];
            if (!b) {
                // Imported projects can reference an asset that is no longer present in
                // the local content store. Keep the chunk slot so voxel indices remain
                // aligned, but treat the missing chunk as empty instead of aborting the
                // whole map startup.
                console.warn(`missing content hash ${hashes[i]}, using an empty chunk`);
                bytes[i] = new Uint8Array();
                continue;
            }
            bytes[i] = b;
        }
        return bytes;
    });
}
function prebakeMap(bs, hash, blockInfoHash, hotVersion, permissionVersion, projectVersion, extraProjectHash, groupProjectMetaData, dataFromBackend) {
    return __awaiter(this, void 0, void 0, function* () {
        // check versions
        if (hotVersion !== hot_schema_1.HotProjectSchema.identity.version ||
            permissionVersion !== permission_rda_1.PermissionRDA.stateSchema.identity.version ||
            projectVersion !== project_rda_1.ProjectRDA.stateSchema.identity.version) {
            throw new Error(`Versions(hotVersion, permissionVersion, projectVersion) do not match, expected (${hot_schema_1.HotProjectSchema.identity.version}, ${permission_rda_1.PermissionRDA.stateSchema.identity.version}, ${project_rda_1.ProjectRDA.stateSchema.identity.version} but got ${hotVersion}, ${permissionVersion} ${projectVersion}).`);
        }
        // Legacy code: If we get an old project, we need to create permissions for it
        // In old versions we only stored project hashes without permission info, so need to apply the migration here
        // Unfortunately this means we need to fetch the hash twice when prebaking the project at start up.
        const json = yield bs.retrieveJSON(hash);
        if (!(json.type === 'permission' || json.type === 'permissions')) {
            bs.logger.info('invalid project type ' + json.type + ' initiating prebake');
            return yield prebakeMap(bs, yield (0, permission_init_1.createDefaultPermissions)({
                userId: 0,
                projectHash: hash,
                contentServer: bs.contentServer,
                buildSystem: bs,
                logger: bs.logger,
            }), blockInfoHash, hotVersion, permissionVersion, projectVersion, extraProjectHash, groupProjectMetaData, dataFromBackend);
        }
        const permissionInfo = yield (0, permission_serialize_1.retrievePermissions)(bs, hash);
        const bakeCache = new bake_1.ProjectBakeCache(bs.contentServer, bs, blockInfoHash);
        try {
            const projectHash = yield bs.build('migrateGroupProject', permissionInfo.permissions.versionControl.branches['master'].headHash, groupProjectMetaData, dataFromBackend, projectVersion);
            const projectInfo = yield (0, project_serialize_1.retrieveProject)(bs, projectHash);
            bs.logger.info('Project retrieved.');
            const extraProjectBytes = yield bs.retrieveContent(extraProjectHash);
            bs.logger.info('Extra project retrieved.');
            let extraProject;
            if (extraProjectBytes.length === 0) {
                extraProject = hot_schema_1.ExtraProjectInfoSchema.clone(hot_schema_1.ExtraProjectInfoSchema.identity);
            }
            else {
                extraProject = hot_schema_1.ExtraProjectInfoSchema.patch(hot_schema_1.ExtraProjectInfoSchema.identity, new stream_1.MuReadStream(extraProjectBytes));
            }
            try {
                // preload all voxels
                const voxelsPromise = preloadHashes(bs.contentServer, projectInfo.project.voxels.chunks);
                bs.logger.info('Voxels preload task created.');
                const hotProjectPromise = bakeCache.bake(projectInfo.project, extraProject, hot_schema_1.HotProjectSchema.clone(hot_schema_1.HotProjectSchema.identity));
                bs.logger.info('Hot project bake task created.');
                const voxels = yield voxelsPromise;
                bs.logger.info('Voxels preloaded.');
                if (!voxels) {
                    throw new Error('error loading voxels');
                }
                const hotProject = yield hotProjectPromise;
                bs.logger.info('Hot project baked.');
                yield (0, project_serialize_1.updateProjectByHotProject)(projectInfo, bs, hotProject);
                bs.logger.info(`new projectHash in prebake cache = ${projectInfo.hash}`);
                try {
                    const stream = new stream_1.MuWriteStream(1 << 20);
                    prebake_schema_1.PrebakeCacheSchema.diff(prebake_schema_1.PrebakeCacheSchema.identity, {
                        voxelBytes: voxels,
                        permissions: permissionInfo.permissions,
                        permissionsHash: permissionInfo.hash,
                        projectHash: projectInfo.hash,
                        coldProject: projectInfo.project,
                        hotProject,
                        extraProjectInfo: extraProject,
                    }, stream);
                    try {
                        return yield bs.storeContent(stream.bytes());
                    }
                    finally {
                        stream.destroy();
                    }
                }
                finally {
                    hot_schema_1.HotProjectSchema.free(hotProject);
                }
            }
            finally {
                project_rda_1.ProjectRDA.stateSchema.free(projectInfo.project);
                hot_schema_1.ExtraProjectInfoSchema.free(extraProject);
            }
        }
        finally {
            permission_rda_1.PermissionsSchema.free(permissionInfo.permissions);
            bakeCache.destroy();
        }
    });
}
//# sourceMappingURL=prebake.js.map