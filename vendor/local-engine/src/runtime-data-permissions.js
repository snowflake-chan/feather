'use strict';

const fs = require('fs');
const path = require('path');

const RECOVERABLE_CHMOD_CODES = new Set(['EPERM', 'EACCES', 'EROFS', 'ENOSYS']);

function applyReadableMode(fileSystem, target, mode, accessMode) {
    try {
        fileSystem.chmodSync(target, mode);
    } catch (error) {
        if (!RECOVERABLE_CHMOD_CODES.has(error?.code)) {
            throw error;
        }
        try {
            fileSystem.accessSync(target, accessMode);
        } catch {
            // chmod is best-effort only on Docker Desktop bind mounts. If the
            // runtime cannot actually read/traverse the path, keep the original
            // chmod error so startup fails with the actionable path and operation.
            throw error;
        }
    }
}

function makeRuntimeDataReadable(root, fileSystem = fs) {
    const pending = [root];
    while (pending.length) {
        const target = pending.pop();
        applyReadableMode(
            fileSystem,
            target,
            0o755,
            fileSystem.constants.R_OK | fileSystem.constants.X_OK,
        );
        for (const entry of fileSystem.readdirSync(target, { withFileTypes: true })) {
            const entryPath = path.join(target, entry.name);
            if (entry.isDirectory()) {
                pending.push(entryPath);
            } else if (entry.isFile()) {
                applyReadableMode(fileSystem, entryPath, 0o644, fileSystem.constants.R_OK);
            } else {
                throw new Error(`运行数据包含不支持的文件类型：${entryPath}`);
            }
        }
    }
}

module.exports = { makeRuntimeDataReadable };
