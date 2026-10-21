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
exports.uploadDirectory = uploadDirectory;
exports.watchUploadDirectory = watchUploadDirectory;
exports.watchFile = watchFile;
exports.watchNewFiles = watchNewFiles;
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const semaphore_1 = require("@box/utils/semaphore");
/**
 * helper function, uploads a directory completely into IPFS
 *
 * return the structure of the directory
 */
function uploadDirectory(root, content) {
    function uploadRecursive(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            const ls = yield fs_1.default.promises.readdir(dir, { withFileTypes: true });
            const result = {};
            const meta = [];
            yield Promise.all(ls.map((file) => __awaiter(this, void 0, void 0, function* () {
                const fullPath = path_1.default.join(dir, file.name);
                if (file.isDirectory()) {
                    result[file.name] = yield uploadRecursive(fullPath);
                    meta.push({
                        name: file.name,
                        dir: true,
                        size: 0,
                    });
                }
                else if (file.isFile()) {
                    const bytes = yield fs_1.default.promises.readFile(fullPath);
                    result[file.name] = yield content.store(bytes);
                    meta.push({
                        name: file.name,
                        dir: false,
                        size: bytes.length,
                    });
                }
            })));
            meta.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name === b.name) {
                    return 0;
                }
                return 1;
            });
            result['.'] = meta;
            return result;
        });
    }
    return uploadRecursive(root);
}
// watch version of upload
function watchUploadDirectory(root, content, logger, onChange) {
    const mutex = new semaphore_1.Semaphore(1);
    let dirty = false;
    function checkUpload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mutex.p();
            while (dirty) {
                let nextDir = null;
                while (dirty) {
                    dirty = false;
                    try {
                        nextDir = yield uploadDirectory(root, content);
                    }
                    catch (e) {
                        logger.error(e);
                    }
                }
                if (nextDir) {
                    try {
                        yield onChange(nextDir);
                    }
                    catch (e) {
                        logger.error(e);
                    }
                }
            }
            mutex.v();
        });
    }
    chokidar_1.default
        .watch(root, {
        persistent: true,
    })
        .on('all', () => {
        if (dirty) {
            return;
        }
        dirty = true;
        checkUpload()
            .then(() => { })
            .catch((e) => logger.error(e));
    });
}
function watchFile(logger, file, onChange) {
    const mutex = new semaphore_1.Semaphore(1);
    let dirty = true;
    function handleChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = null;
            yield mutex.p();
            while (dirty) {
                while (dirty) {
                    dirty = false;
                    try {
                        data = yield fs_1.default.promises.readFile(file);
                    }
                    catch (e) {
                        logger.error(e);
                    }
                }
                if (data) {
                    try {
                        yield onChange(data);
                    }
                    catch (e) {
                        logger.error(e);
                    }
                }
            }
            mutex.v();
        });
    }
    chokidar_1.default.watch(file, { persistent: true }).on('all', () => {
        dirty = true;
        handleChange().catch((e) => logger.error(e));
    });
}
function watchNewFiles(logger, directory, onChange) {
    chokidar_1.default
        .watch(directory, {
        ignoreInitial: true,
        persistent: true,
    })
        .on('add', (path) => {
        onChange(path).catch((e) => logger.error(e));
    })
        .on('error', (error) => logger.error(error instanceof Error ? error : new Error(String(error))));
}
//# sourceMappingURL=upload-dir.js.map