"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResources = buildResources;
const fs_1 = __importDefault(require("fs"));
const fsext = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const build_system_1 = require("../build-system");
const stream_1 = require("@box/mudb/stream");
const upload_dir_1 = require("./upload-dir");
function inferType(json) {
    switch (typeof json) {
        case 'string':
        case 'number':
        case 'boolean':
            return typeof json;
        case 'object':
            if (Array.isArray(json)) {
                return inferType(json[0]) + '[]';
            }
            else {
                const result = [];
                Object.keys(json).forEach((prop, i) => {
                    result.push(`'${prop}':${inferType(json[prop])}`);
                });
                return `{ ${result.join('; ')} }`;
            }
    }
    return 'any';
}
function escape(msg) {
    if (msg.length > 1000) {
        return escape(msg.substring(0, 1000));
    }
    return msg.replace(/\//g, ' / ');
}
function emitStringLiteral(str) {
    return '`' + str.replace(/\$\{/g, "${'${'}").replace(/\`/g, "${'`'}") + '`';
}
/**
 * 保存到 ipfs, 并写入本地 src/assets 目录
 */
function rebuildResources(buildSystem, assetJSON, resourceJSON, targetDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const assetHash = yield buildSystem.storeJSON(assetJSON);
        let error = null;
        yield Promise.all(Object.keys(resourceJSON).map((resourceName) => __awaiter(this, void 0, void 0, function* () {
            const resourceHash = resourceJSON[resourceName];
            if (typeof resourceHash === 'string') {
                const bs = new build_system_1.BuildSystem(buildSystem.cache, buildSystem.contentServer, buildSystem.ossContentServer, buildSystem.nextUidListUsingGet, buildSystem.logger.child({ caller: resourceName }), buildSystem.debug);
                try {
                    let valueExpr = `{};`;
                    let typeExpr = 'any';
                    let env = '';
                    try {
                        const hash = yield bs.build('buildResource', assetHash, resourceHash);
                        const resourceSpec = yield bs.retrieveJSON(resourceHash);
                        if ('env' in resourceSpec) {
                            env = resourceSpec.env;
                        }
                        if (resourceSpec.ret === 'bin') {
                            const bytes = yield bs.retrieveContent(hash);
                            if (!bytes) {
                                throw new Error('error loading resoult hash: ' + hash);
                            }
                            valueExpr = `new Uint8Array([${Array.prototype.join.call(bytes)}]);`;
                            typeExpr = 'Uint8Array';
                        }
                        else if (resourceSpec.ret === 'text') {
                            const text = (0, stream_1.decodeUTF8)(yield bs.retrieveContent(hash));
                            typeExpr = 'string';
                            valueExpr = emitStringLiteral(text);
                        }
                        else if (resourceSpec.ret === 'json') {
                            const str = (0, stream_1.decodeUTF8)(yield bs.retrieveContent(hash));
                            if (str) {
                                const json = JSON.parse(str);
                                if (resourceSpec.type) {
                                    typeExpr = resourceSpec.type;
                                }
                                else {
                                    typeExpr = inferType(json);
                                }
                                valueExpr = `<any>JSON.parse(${emitStringLiteral(str)})`;
                            }
                            else {
                                typeExpr = 'undefined';
                                valueExpr = 'void 0';
                            }
                        }
                        else {
                            typeExpr = 'string';
                            valueExpr = emitStringLiteral(hash);
                        }
                    }
                    catch (e) {
                        bs.logger.error(`error building resource ${resourceName}:  ${e.stack}`);
                        valueExpr += `/* error building ${resourceName}: ${escape(e.message)} */`;
                        error = new Error(`Build resource error: ${bs.logger.bindings().caller} ${e.message || ''} ${e.stack || ''}`);
                    }
                    bs.logger.info('test ' + resourceName);
                    const baseName = path_1.default.basename(resourceName).replace('.json', '');
                    const typeName = baseName.toUpperCase() + '_RES';
                    const src = `export const ${typeName}:${typeExpr} = ${valueExpr};`;
                    const filePath = path_1.default.join(targetDir, env, baseName + '.ts');
                    try {
                        if (env) {
                            yield fsext.mkdirp(path_1.default.join(targetDir, env));
                        }
                        const prevSrc = yield fs_1.default.promises.readFile(filePath);
                        if (prevSrc.toString() === src) {
                            return;
                        }
                    }
                    catch (e) { }
                    yield fs_1.default.promises.writeFile(filePath, src);
                    bs.logger.info(`${filePath} updated`);
                }
                catch (e) {
                    bs.logger.error(e);
                    error = new Error(`Build resource error: ${bs.logger.bindings().caller} ${e.message || ''} ${e.stack || ''}`);
                }
            }
        })));
        if (error) {
            throw error;
        }
    });
}
function buildResources(buildSystem, contentServer, logger, paths, skipPattern) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tasksDir, assetsDir, targetDir } = paths;
        const beginTime = Date.now();
        logger.info('building resources...');
        const [assetJSON, resourceJSON] = yield Promise.all([
            (0, upload_dir_1.uploadDirectory)(assetsDir, contentServer),
            (0, upload_dir_1.uploadDirectory)(tasksDir, contentServer),
        ]);
        const pending = [];
        if (skipPattern) {
            Object.keys(resourceJSON).forEach((resource) => {
                if (resource.match(skipPattern)) {
                    delete resourceJSON[resource];
                    pending.push((() => __awaiter(this, void 0, void 0, function* () {
                        const baseName = path_1.default.basename(resource).replace('.json', '');
                        const typeName = baseName.toUpperCase() + '_RES';
                        const src = `export const ${typeName}:any = void 0;`;
                        yield fs_1.default.promises.writeFile(path_1.default.join(targetDir, baseName + '.ts'), src);
                        buildSystem.logger.info('write temporary file ' + baseName + '.ts');
                    }))());
                }
            });
        }
        yield rebuildResources(buildSystem, assetJSON, resourceJSON, targetDir);
        yield Promise.all(pending);
        logger.info(`resource build total time = ${((Date.now() - beginTime) / 1000).toFixed(4)} seconds`);
    });
}
//# sourceMappingURL=resource.js.map