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
exports.storeProjectJSON = storeProjectJSON;
exports.storeProject = storeProject;
exports.retrieveProject = retrieveProject;
exports.updateProjectByHotProject = updateProjectByHotProject;
const migrations_1 = require("../migrations");
const project_rda_1 = require("@box/schema/project/project-rda");
const CURRENT_VERSION = project_rda_1.ProjectRDA.stateSchema.identity.version;
function storeProjectJSON(bs, rawJSON) {
    return __awaiter(this, void 0, void 0, function* () {
        // split assets into scripts and everything else
        const assets = {};
        const scriptAssets = {};
        const keys = Object.keys(rawJSON.assets);
        keys.sort();
        for (let i = 0; i < keys.length; ++i) {
            const path = keys[i];
            const asset = rawJSON.assets[path];
            if (asset.type === project_rda_1.AssetType.JS_SCRIPT ||
                asset.type === project_rda_1.AssetType.CLIENT_JS_SCRIPT) {
                scriptAssets[path] = asset;
            }
            else {
                assets[path] = asset;
            }
        }
        const [infoHash, entitiesTreeHash, assetsHash, scriptAssetsHash, deleteAssetsHash, voxelsHash, playerHash, environmentHash, physicsHash, ambientSoundHash, zonesHash, gamepadHash, uiTree, audioAssets, pictureAssets,] = yield Promise.all([
            bs.storeJSON(rawJSON.info),
            bs.storeJSON(rawJSON.entitiesTree),
            bs.storeJSON(assets),
            bs.storeJSON(scriptAssets),
            bs.storeJSON(rawJSON.deleteAssets),
            bs.storeJSON(rawJSON.voxels),
            bs.storeJSON(rawJSON.player),
            bs.storeJSON(rawJSON.environment),
            bs.storeJSON(rawJSON.physics),
            bs.storeJSON(rawJSON.ambientSound),
            bs.storeJSON(rawJSON.zones || []),
            bs.storeJSON(rawJSON.gamepad),
            bs.storeJSON(rawJSON.uiTree),
            bs.storeJSON(rawJSON.audioAssets),
            bs.storeJSON(rawJSON.pictureAssets),
        ]);
        rawJSON.info = infoHash;
        rawJSON.entitiesTree = entitiesTreeHash;
        rawJSON.assets = assetsHash;
        rawJSON.scriptAssets = scriptAssetsHash;
        rawJSON.deleteAssets = deleteAssetsHash;
        rawJSON.voxels = voxelsHash;
        rawJSON.player = playerHash;
        rawJSON.environment = environmentHash;
        rawJSON.physics = physicsHash;
        rawJSON.ambientSound = ambientSoundHash;
        rawJSON.zones = zonesHash;
        rawJSON.gamepad = gamepadHash;
        rawJSON.uiTree = uiTree;
        rawJSON.audioAssets = audioAssets;
        rawJSON.pictureAssets = pictureAssets;
        const projectHash = yield bs.storeJSON(rawJSON);
        return {
            projectHash,
            groupProjectMetaData: {
                version: rawJSON.version,
                hashes: {
                    uiTree: uiTree,
                    audioAssets: audioAssets,
                    pictureAssets: pictureAssets,
                },
            },
        };
    });
}
function storeProject(bs, project) {
    return __awaiter(this, void 0, void 0, function* () {
        return storeProjectJSON(bs, project_rda_1.ProjectRDA.stateSchema.toJSON(project));
    });
}
function retrieveProject(bs, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const rawJSON = yield bs.retrieveJSON(hash);
        if (rawJSON.type !== 'project') {
            throw new Error('invalid project hash: ' +
                hash +
                '.  expected type "project", got ' +
                rawJSON.type);
        }
        if (rawJSON.version !== CURRENT_VERSION) {
            // run a migration
            bs.logger.info(`project ${hash} is an older version (${rawJSON.version}), migrating to latest project ${CURRENT_VERSION}`);
            const nextHash = yield (0, migrations_1.buildMigrate)(bs, bs.logger, 'project', rawJSON.version, CURRENT_VERSION, hash);
            if (!nextHash) {
                throw new Error(`error migrating project ${hash} from ${rawJSON.version} to ${CURRENT_VERSION}.  DID YOU REMEMBER TO WRITE A MIGRATION IN src/build/migrations/ ????  DID YOU???????????`);
            }
            bs.logger.info(`successfully migrated project ${hash} from ${rawJSON.version} to ${CURRENT_VERSION}.  new hash = ${nextHash}`);
            return retrieveProject(bs, nextHash);
        }
        // load all the subresources
        const [info, entitiesTree, assets, scriptAssets, deleteAssets, voxels, player, environment, physics, ambientSound, zones, gamepad, uiTree, audioAssets, pictureAssets,] = yield Promise.all([
            bs.retrieveJSON(rawJSON.info),
            bs.retrieveJSON(rawJSON.entitiesTree),
            bs.retrieveJSON(rawJSON.assets),
            bs.retrieveJSON(rawJSON.scriptAssets),
            bs.retrieveJSON(rawJSON.deleteAssets),
            bs.retrieveJSON(rawJSON.voxels),
            bs.retrieveJSON(rawJSON.player),
            bs.retrieveJSON(rawJSON.environment),
            bs.retrieveJSON(rawJSON.physics),
            bs.retrieveJSON(rawJSON.ambientSound),
            bs.retrieveJSON(rawJSON.zones),
            bs.retrieveJSON(rawJSON.gamepad),
            rawJSON.uiTree ? bs.retrieveJSON(rawJSON.uiTree) : undefined,
            rawJSON.audioAssets ? bs.retrieveJSON(rawJSON.audioAssets) : undefined,
            bs.retrieveJSON(rawJSON.pictureAssets),
        ]);
        rawJSON.info = info;
        rawJSON.entitiesTree = entitiesTree;
        rawJSON.assets = Object.assign(Object.assign({}, assets), scriptAssets);
        rawJSON.deleteAssets = deleteAssets;
        rawJSON.voxels = voxels;
        rawJSON.player = player;
        rawJSON.environment = environment;
        rawJSON.physics = physics;
        rawJSON.ambientSound = ambientSound;
        rawJSON.zones = zones;
        rawJSON.gamepad = gamepad;
        rawJSON.uiTree = uiTree;
        rawJSON.audioAssets = audioAssets;
        rawJSON.pictureAssets = pictureAssets;
        return {
            hash,
            project: project_rda_1.ProjectRDA.stateSchema.fromJSON(rawJSON),
        };
    });
}
function updateProjectByHotProject(out, bs, hotProject) {
    return __awaiter(this, void 0, void 0, function* () {
        Object.keys(hotProject.seeds).forEach((id) => {
            const seed = hotProject.seeds[id];
            const entityNode = out.project.entitiesTree[id];
            if (!(entityNode === null || entityNode === void 0 ? void 0 : entityNode.value)) {
                return;
            }
            entityNode.value.mesh = seed.mesh;
            entityNode.value.defaultMotionId = seed.defaultMotionId;
            entityNode.value.bounds[0] = seed.bounds[0];
            entityNode.value.bounds[1] = seed.bounds[1];
            entityNode.value.bounds[2] = seed.bounds[2];
        });
        out.hash = (yield storeProject(bs, out.project)).projectHash;
    });
}
//# sourceMappingURL=project-serialize.js.map