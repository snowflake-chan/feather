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
exports.importProject = importProject;
exports.exportProject = exportProject;
const stream_1 = require("@box/mudb/stream");
const voxel_collision_schema_1 = require("@box/schema/voxel/voxel-collision-schema");
const project_rda_1 = require("@box/schema/project/project-rda");
const project_serialize_1 = require("../project/project-serialize");
const FILE_TYPES = {
    js: project_rda_1.AssetType.JS_SCRIPT,
    vb: project_rda_1.AssetType.VOXEL_MODEL,
    lut: project_rda_1.AssetType.COLOR_LUT,
    part: project_rda_1.AssetType.PARTICLE_TEXTURE,
    png: project_rda_1.AssetType.IMAGE,
    mp3: project_rda_1.AssetType.AUDIO,
};
const FILE_EXTENSION = {};
Object.keys(FILE_TYPES).forEach((x) => (FILE_EXTENSION[FILE_TYPES[x]] = '.' + x));
FILE_EXTENSION[project_rda_1.AssetType.VOXEL_MODEL] = '';
FILE_EXTENSION[project_rda_1.AssetType.JS_SCRIPT] = '';
FILE_EXTENSION[project_rda_1.AssetType.CLIENT_JS_SCRIPT] = '';
FILE_EXTENSION[project_rda_1.AssetType.PARTICLE_TEXTURE] = '.png';
function escapePath(x) {
    return x.replace(/\\/g, `\\`).replace(/\//g, `\/`);
}
function extension(file) {
    const parts = file.split('.');
    if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
    }
    return '';
}
function removeExtension(filename) {
    return filename.replace(/\..*$/, '');
}
function importAssets(assetDir) {
    const result = project_rda_1.AssetsRDA.stateSchema.clone(project_rda_1.AssetsRDA.stateSchema.identity);
    function importDirRec(prefix, folder) {
        const meta = folder['.'];
        if (!meta) {
            return;
        }
        meta.forEach(({ name, dir, size }) => {
            const fileHash = folder[name];
            if (!fileHash) {
                return;
            }
            if (dir) {
                return importDirRec(prefix.concat([name]), fileHash);
            }
            const ext = extension(name);
            if (!(ext in FILE_TYPES)) {
                return;
            }
            const asset = project_rda_1.AssetEntryRDA.stateSchema.clone(project_rda_1.AssetEntryRDA.stateSchema.identity);
            // TODO: figure out how to assign owner/content id here
            asset.contentId = asset.ownerId = 0;
            // TODO: check file contents are consistent
            const type = (asset.type = FILE_TYPES[ext]);
            const fileExt = FILE_EXTENSION[type];
            asset.hash = removeExtension(fileHash) + fileExt;
            asset.size = size;
            // update preview image
            const previewPath = name + '.preview';
            if (previewPath in folder) {
                // TODO: check preview image is valid
                asset.previewImage = removeExtension(folder[previewPath]) + '.png';
            }
            else if (fileExt === '.png') {
                asset.previewImage = asset.hash;
            }
            else {
                asset.previewImage = '';
            }
            const assetPath = prefix.slice();
            assetPath.push(removeExtension(name) + '.' + ext);
            result[assetPath.map((x) => escapePath(x)).join('/')] = asset;
        });
    }
    importDirRec([], assetDir);
    return result;
}
function exportAssets(bs, assetTable) {
    return __awaiter(this, void 0, void 0, function* () {
        function insertFile(dir, path, asset) {
            if (path.length > 1) {
                let folder = dir[path[0]];
                if (!folder) {
                    folder = dir[path[0]] = {
                        dir: {},
                        size: 0,
                    };
                }
                if (folder.dir) {
                    return insertFile(folder.dir, path.slice(1), asset);
                }
                else {
                    throw new Error('invalid folder type');
                }
            }
            dir[path[0]] = {
                hash: removeExtension(asset.hash),
                size: asset.size,
            };
            if (asset.previewImage) {
                dir[path[0] + '.preview'] = {
                    hash: removeExtension(asset.previewImage),
                    size: 0,
                };
            }
        }
        const result = {};
        Object.keys(assetTable).forEach((path) => insertFile(result, path.split('/'), assetTable[path]));
        function uploadDir(dir) {
            return __awaiter(this, void 0, void 0, function* () {
                const meta = [];
                const json = {};
                yield Promise.all(Object.keys(dir).map((name) => __awaiter(this, void 0, void 0, function* () {
                    const file = dir[name];
                    if (file.dir) {
                        const hash = yield uploadDir(file.dir);
                        meta.push({
                            name,
                            dir: true,
                            size: 0,
                        });
                        json[name] = hash;
                    }
                    else if (file.hash) {
                        meta.push({
                            name,
                            dir: false,
                            size: file.size,
                        });
                        json[name] = file.hash;
                    }
                })));
                meta.sort((a, b) => (a.name < b.name ? -1 : 1));
                json['.'] = meta;
                return bs.storeJSON(json);
            });
        }
        return uploadDir(result);
    });
}
function importDeletedAssets(bs, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        return [];
    });
}
function exportDeletedAssets(bs, deletedAssets) {
    return __awaiter(this, void 0, void 0, function* () {
        // TODO
        return bs.storeJSON({
            '.': [],
        });
    });
}
function importVoxels(bs, voxelHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, shape, chunks } = yield bs.retrieveJSON(voxelHash);
        const hashes = yield Promise.all(data.map((h) => bs.storeContent(new Uint8Array(h))));
        const result = project_rda_1.VoxelRDA.stateSchema.clone(project_rda_1.VoxelRDA.stateSchema.identity);
        result.shape.x = shape.x | 0;
        result.shape.y = shape.y | 0;
        result.shape.z = shape.z | 0;
        result.chunks = chunks.slice();
        // check integrity
        if (chunks.length !==
            (result.shape.x * result.shape.y * result.shape.z) >> (3 * voxel_collision_schema_1.CHUNK_SHIFT)) {
            throw new Error('inconsistent voxel shape');
        }
        for (let i = 0; i < chunks.length; ++i) {
            const h = chunks[i];
            if (hashes.indexOf(h) < 0) {
                throw new Error('missing chunk data ' + h);
            }
        }
        return result;
    });
}
function exportVoxels(bs, voxels) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = [];
        const chunks = {};
        yield Promise.all(voxels.chunks.map((hash) => __awaiter(this, void 0, void 0, function* () {
            if (hash in chunks) {
                return;
            }
            chunks[hash] = true;
            const bytes = yield bs.retrieveContent(hash);
            data.push(Array.prototype.slice.call(bytes));
        })));
        return bs.storeContent((0, stream_1.encodeUTF8)(JSON.stringify({
            type: 'terrain',
            version: '0.0.0',
            prevHash: '',
            data,
            shape: voxels.shape,
            chunks: voxels.chunks,
        })));
    });
}
function importBannerImages(dir) {
    if (!dir || typeof dir !== 'object') {
        return [];
    }
    const items = dir['.'];
    if (!items || !Array.isArray(items)) {
        return [];
    }
    const result = [];
    for (let i = 0; i < items.length; ++i) {
        const x = items[i];
        if (!x.name || x.dir) {
            continue;
        }
        if (extension(x.name) === 'png') {
            result.push(removeExtension(dir[x.name]) + '.png');
        }
    }
    return result;
}
function exportBannerImages(bs, bannerImages) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = {};
        const meta = [];
        for (let i = 0; i < bannerImages.length; ++i) {
            const name = i + '.png';
            dir[name] = removeExtension(bannerImages[i]);
            meta.push({
                name,
                dir: false,
                size: 0,
            });
        }
        dir['.'] = meta;
        return bs.storeJSON(dir);
    });
}
function importProject(bs, dirHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield bs.retrieveJSON(yield bs.build('addMeta', yield bs.build('optimizeDir', dirHash)));
        const [voxels, deleteAssets, projectJSON] = yield Promise.all([
            importVoxels(bs, dir['voxels.json']),
            importDeletedAssets(bs, dir['.trash']),
            bs.retrieveJSON(dir['project.json']),
        ]);
        // update sub fields
        projectJSON.assets = importAssets(dir['assets']);
        projectJSON.deleteAssets = deleteAssets;
        projectJSON.voxels = voxels;
        // update preview image fields
        projectJSON.info = projectJSON.info || {};
        if (dir['preview.png']) {
            projectJSON.info.previewImage =
                removeExtension(dir['preview.png']) + '.png';
        }
        else {
            projectJSON.info.previewImage = '';
        }
        // import banner images
        projectJSON.info.bannerImages = importBannerImages(dir['banner']);
        // finally run a retrieve and store cycle to migrate project by brute force
        const baseHash = (yield (0, project_serialize_1.storeProjectJSON)(bs, projectJSON)).projectHash;
        // retrieve the final project hash and force a migration
        const { hash, project } = yield (0, project_serialize_1.retrieveProject)(bs, baseHash);
        project_rda_1.ProjectRDA.stateSchema.free(project);
        // return final good hash
        return hash;
    });
}
function exportProject(bs, projectHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const { project } = yield (0, project_serialize_1.retrieveProject)(bs, projectHash);
        const projectJSON = project_rda_1.ProjectRDA.stateSchema.toJSON(project);
        delete projectJSON.assets;
        delete projectJSON.voxels;
        delete projectJSON.deleteAssets;
        delete projectJSON.info.bannerImages;
        const previewImage = projectJSON.info.previewImage;
        delete projectJSON.info.previewImage;
        // clear prev Hash
        delete projectJSON.prevHash;
        const [assetsHash, bannerHash, voxelsHash, deletedAssets, projectJSONHash] = yield Promise.all([
            exportAssets(bs, project.assets),
            exportBannerImages(bs, project.info.bannerImages),
            exportVoxels(bs, project.voxels),
            exportDeletedAssets(bs, project.deleteAssets),
            bs.storeContent((0, stream_1.encodeUTF8)(JSON.stringify(projectJSON, null, '  '))),
        ]);
        const dirState = {
            '.': [
                {
                    name: 'assets',
                    dir: true,
                    size: 0,
                },
                {
                    name: 'banner',
                    dir: true,
                    size: 0,
                },
                {
                    name: '.trash',
                    dir: true,
                    size: 0,
                },
                {
                    name: 'voxels.json',
                    dir: false,
                    size: 0,
                },
                {
                    name: 'project.json',
                    dir: false,
                    size: 0,
                },
            ],
            'assets': assetsHash,
            'banner': bannerHash,
            '.trash': deletedAssets,
            'voxels.json': voxelsHash,
            'project.json': projectJSONHash,
        };
        if (previewImage) {
            dirState['preview.png'] = removeExtension(previewImage);
            dirState['.'].push({
                name: 'preview.png',
                dir: false,
                size: 0,
            });
        }
        return bs.storeJSON(dirState);
    });
}
//# sourceMappingURL=import-project.js.map