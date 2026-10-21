'use strict';

const fs = require('fs');
const path = require('path');
const cidPattern = /Qm[1-9A-HJ-NP-Za-km-z]{44}/g;
const exactCidPattern =
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}(?:\.(?:png|jpe?g|webp|gif|mp3|wav|ogg|m4a|lut))?$/i;
const displayOnlyResourceFields = new Set(['previewImage', 'bannerImages']);
const checks = [
    [
        'group-storage',
        /getGroupStorage\s*\(/,
        '使用了群组数据空间；本地模式会使用稳定的工程群组命名空间。',
    ],
    ['project-storage', /getDataStorage\s*\(/, '使用了工程数据空间；数据会保存在本地持久化目录。'],
    ['player-kick', /\.kick\s*\(/, '脚本会主动踢出玩家，请确认本地玩家身份规则。'],
    [
        'guest-name-check',
        /(?:startsWith|includes|===?)\s*\(\s*['"](?:explorer|guest)/i,
        '脚本包含游客名称判断；本地玩家默认名称为“本地玩家”。',
    ],
    [
        'purchase',
        /onPlayerPurchaseSuccess|purchase|payment|商城|支付/i,
        '检测到平台支付或商城逻辑，本地不会模拟云端交易。',
    ],
    [
        'cloud-http',
        /https?:\/\/(?:[^\s'"`]+\.)?(?:dao3\.fun|codemao\.cn|box3\.fun|createra\.fun)/i,
        '检测到云端 API 地址；离线运行时该功能可能不可用。',
    ],
];

function walkFiles(root) {
    const files = [],
        pending = [root];
    while (pending.length) {
        const directory = pending.pop();
        if (!fs.existsSync(directory)) {
            continue;
        }
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const target = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                pending.push(target);
            } else if (entry.isFile()) {
                files.push(target);
            }
        }
    }
    return files;
}

function collectJSONCids(value, result = new Set()) {
    if (typeof value === 'string') {
        if (exactCidPattern.test(value)) {
            result.add(value.split('.')[0]);
        }
        return result;
    }
    if (Array.isArray(value)) {
        for (const child of value) {
            collectJSONCids(child, result);
        }
        return result;
    }
    if (!value || typeof value !== 'object') {
        return result;
    }
    for (const [key, child] of Object.entries(value)) {
        // Cloud project covers, banners, and asset thumbnails are presentation
        // metadata. The migrator deliberately does not require them for an
        // offline runtime, so their absence must not make an import incompatible.
        if (!displayOnlyResourceFields.has(key)) {
            collectJSONCids(child, result);
        }
    }
    return result;
}

function referencedCids(text) {
    try {
        return collectJSONCids(JSON.parse(text));
    } catch {
        return new Set(text.match(cidPattern) || []);
    }
}

function scanProjectCompatibility(sourceRoot) {
    const blobsRoot = path.join(sourceRoot, 'blobs');
    const files = walkFiles(sourceRoot);
    const warnings = [],
        capabilities = new Set(),
        missingBlobs = new Set();
    let scriptsScanned = 0,
        emptyScripts = 0;
    for (const file of files) {
        const stat = fs.statSync(file);
        if (stat.size > 8 * 1024 * 1024) {
            continue;
        }
        const bytes = fs.readFileSync(file);
        if (bytes.includes(0)) {
            continue;
        }
        const text = bytes.toString('utf8');
        const scriptLike = /\.(?:js|ts|tsx|jsx)$/i.test(file) || /\bworld\.|\bstorage\./.test(text);
        if (scriptLike) {
            scriptsScanned += 1;
            if (!text.trim()) {
                emptyScripts += 1;
            }
            for (const [id, pattern, message] of checks) {
                if (pattern.test(text)) {
                    capabilities.add(id);
                    if (!warnings.some((warning) => warning.code === id)) {
                        warnings.push({ code: id, message });
                    }
                }
            }
        }
        for (const hash of referencedCids(text)) {
            if (!fs.existsSync(path.join(blobsRoot, hash))) {
                missingBlobs.add(hash);
            }
        }
    }
    if (emptyScripts) {
        warnings.push({ code: 'empty-scripts', message: `发现 ${emptyScripts} 个空脚本文件。` });
    }
    const errors = [...missingBlobs]
        .slice(0, 200)
        .map((hash) => ({ code: 'missing-blob', hash, message: `缺少资源 blob ${hash}` }));
    return {
        generatedAt: new Date().toISOString(),
        level: errors.length ? 'error' : warnings.length ? 'warning' : 'compatible',
        summary: {
            filesScanned: files.length,
            scriptsScanned,
            warnings: warnings.length,
            errors: errors.length,
            missingBlobCount: missingBlobs.size,
        },
        capabilities: [...capabilities],
        warnings,
        errors,
    };
}

module.exports = { collectJSONCids, scanProjectCompatibility };
