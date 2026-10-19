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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = start;
const fs_extra_1 = __importDefault(require("fs-extra"));
const pino_1 = __importDefault(require("pino"));
const content_server_1 = require("./utils/content-server");
const resource_1 = require("./utils/resource");
const build_cache_mock_1 = require("./build-cache-mock");
const build_system_1 = require("./build-system");
function start(paths, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // 初始化脚本使用的 logger
        const logger = (0, pino_1.default)({
            level: 'info',
            transport: {
                target: 'pino-pretty',
            },
        });
        const contentServer = (0, content_server_1.createContentServer)(logger, config);
        const ossContentServer = (0, content_server_1.createOSSContentServer)(logger, config);
        const buildCache = new build_cache_mock_1.MockBuildCache();
        const buildSystem = new build_system_1.BuildSystem(buildCache, contentServer, ossContentServer, config.nextUidListUsingGet, logger, false);
        const { targetDir } = paths;
        // 清除构建的文件夹
        logger.info('starting build.  node' + process.version);
        yield Promise.all([fs_extra_1.default.remove(targetDir)]);
        yield Promise.all([fs_extra_1.default.mkdirp(targetDir)]);
        // 将assetsDir下的文件上传到ipfs并得到hash通过tasksDir写成文件到targetDir供其他文件依赖
        logger.info('initializing resources....');
        yield (0, resource_1.buildResources)(buildSystem, contentServer, logger, paths);
        logger.info('resources built.');
        return { buildSystem, logger };
    });
}
//# sourceMappingURL=build.js.map