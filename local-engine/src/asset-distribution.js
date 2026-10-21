'use strict';

// This configuration belongs to the Creator machine, not to a project or a
// distributable package.  It deliberately stores only the credentials needed
// to publish immutable, public content-addressed objects.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const configurationFileName = '.asset-distribution.json';
const allowedModes = new Set(['local', 'oss']);

function configurationPath(projectsRoot) {
    return path.join(projectsRoot, configurationFileName);
}

function isSafePublicURL(value, { allowLocalHttp = true } = {}) {
    try {
        const parsed = new URL(String(value || ''));
        if (parsed.username || parsed.password || parsed.search || parsed.hash) {
            return false;
        }
        if (parsed.protocol === 'https:') {
            return true;
        }
        return (
            allowLocalHttp &&
            parsed.protocol === 'http:' &&
            ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname)
        );
    } catch {
        return false;
    }
}

function normalizeURL(value) {
    return String(value || '')
        .trim()
        .replace(/\/$/, '');
}

function readConfiguration(projectsRoot, { includeSecret = false } = {}) {
    try {
        const config = JSON.parse(fs.readFileSync(configurationPath(projectsRoot), 'utf8'));
        const result = {
            formatVersion: 1,
            provider: 's3-compatible',
            endpoint: normalizeURL(config.endpoint),
            bucket: String(config.bucket || '').trim(),
            region: String(config.region || 'auto').trim() || 'auto',
            accessKeyId: String(config.accessKeyId || '').trim(),
            cdnBaseUrl: normalizeURL(config.cdnBaseUrl),
            hasSecretAccessKey: Boolean(config.secretAccessKey),
        };
        if (includeSecret) {
            result.secretAccessKey = String(config.secretAccessKey || '');
        }
        return result;
    } catch (error) {
        if (error?.code === 'ENOENT') {
            return {
                formatVersion: 1,
                provider: 's3-compatible',
                endpoint: '',
                bucket: '',
                region: 'auto',
                accessKeyId: '',
                cdnBaseUrl: '',
                hasSecretAccessKey: false,
                ...(includeSecret ? { secretAccessKey: '' } : {}),
            };
        }
        throw new Error(`无法读取资源分发配置：${error.message}`);
    }
}

function validateConfiguration(config) {
    if (!isSafePublicURL(config.endpoint)) {
        throw new Error('OSS Endpoint 必须是 HTTPS 地址（本机开发可使用 localhost HTTP）');
    }
    if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/i.test(config.bucket || '')) {
        throw new Error('OSS Bucket 名称无效');
    }
    if (!String(config.accessKeyId || '').trim() || !String(config.secretAccessKey || '').trim()) {
        throw new Error('请填写 OSS Access Key 和 Secret Key');
    }
    if (!isSafePublicURL(config.cdnBaseUrl, { allowLocalHttp: false })) {
        throw new Error('资源公开地址必须是 HTTPS 地址');
    }
}

function saveConfiguration(projectsRoot, input) {
    const current = readConfiguration(projectsRoot, { includeSecret: true });
    const next = {
        formatVersion: 1,
        provider: 's3-compatible',
        endpoint: normalizeURL(input?.endpoint),
        bucket: String(input?.bucket || '').trim(),
        region: String(input?.region || 'auto').trim() || 'auto',
        accessKeyId: String(input?.accessKeyId || '').trim(),
        secretAccessKey: String(input?.secretAccessKey || '').trim() || current.secretAccessKey,
        cdnBaseUrl: normalizeURL(input?.cdnBaseUrl),
    };
    validateConfiguration(next);
    fs.mkdirSync(projectsRoot, { recursive: true });
    const target = configurationPath(projectsRoot);
    const temporary = `${target}.${process.pid}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
    fs.renameSync(temporary, target);
    try {
        fs.chmodSync(target, 0o600);
    } catch {
        // Windows does not support POSIX permissions. The file remains local and
        // ignored by git on every platform.
    }
    return readConfiguration(projectsRoot);
}

function hmac(key, value, encoding) {
    return crypto.createHmac('sha256', key).update(value).digest(encoding);
}

function sha256(value, encoding = 'hex') {
    return crypto.createHash('sha256').update(value).digest(encoding);
}

function awsSigningKey(secret, date, region, service) {
    const dateKey = hmac(`AWS4${secret}`, date);
    const regionKey = hmac(dateKey, region);
    const serviceKey = hmac(regionKey, service);
    return hmac(serviceKey, 'aws4_request');
}

function encodedPathname(value) {
    return value
        .split('/')
        .map((part) =>
            encodeURIComponent(part).replace(
                /[!'()*]/g,
                (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
            ),
        )
        .join('/');
}

function signedS3Request(config, method, key, body) {
    const endpoint = new URL(config.endpoint);
    const objectPath = `${endpoint.pathname.replace(/\/$/, '')}/${config.bucket}/${key}`.replace(
        /\/+/g,
        '/',
    );
    endpoint.pathname = encodedPathname(objectPath.startsWith('/') ? objectPath : `/${objectPath}`);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const shortDate = amzDate.slice(0, 8);
    const payloadHash = sha256(body || Buffer.alloc(0));
    const canonicalHeaders = `host:${endpoint.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const scope = `${shortDate}/${config.region}/s3/aws4_request`;
    const canonicalRequest = [
        method,
        endpoint.pathname,
        '',
        canonicalHeaders,
        signedHeaders,
        payloadHash,
    ].join('\n');
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
    const signature = hmac(
        awsSigningKey(config.secretAccessKey, shortDate, config.region, 's3'),
        stringToSign,
        'hex',
    );
    return {
        url: endpoint,
        headers: {
            'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
            'x-amz-content-sha256': payloadHash,
            'x-amz-date': amzDate,
        },
    };
}

async function requestObject(config, method, key, body) {
    const signed = signedS3Request(config, method, key, body);
    const headers = { ...signed.headers };
    if (method === 'PUT') {
        headers['Content-Type'] = 'application/octet-stream';
        headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    const response = await fetch(signed.url, {
        method,
        headers,
        body: body || undefined,
        redirect: 'error',
        signal: AbortSignal.timeout(120_000),
    });
    return response;
}

async function uploadPublicAssets(projectsRoot, assets) {
    const config = readConfiguration(projectsRoot, { includeSecret: true });
    validateConfiguration(config);
    const uploaded = [];
    const skipped = [];
    for (const asset of assets) {
        const key = `engine/m/${asset.hash}`;
        let existing;
        try {
            existing = await requestObject(config, 'HEAD', key);
        } catch (error) {
            throw new Error(`无法连接 OSS：${error.message}`);
        }
        if (existing.ok) {
            const length = Number(existing.headers.get('content-length') || 0);
            if (length && length !== asset.size) {
                throw new Error(`OSS 中同名资源大小不一致：${asset.hash}`);
            }
            skipped.push(asset.hash);
            continue;
        }
        if (![403, 404].includes(existing.status)) {
            throw new Error(`检查 OSS 资源失败（HTTP ${existing.status}）：${asset.hash}`);
        }
        const body = fs.readFileSync(asset.path);
        const response = await requestObject(config, 'PUT', key, body);
        if (!response.ok) {
            throw new Error(`上传 OSS 资源失败（HTTP ${response.status}）：${asset.hash}`);
        }
        uploaded.push(asset.hash);
    }
    return {
        uploaded,
        skipped,
        distribution: {
            formatVersion: 1,
            mode: 'external-cdn',
            cdnBaseUrl: config.cdnBaseUrl,
            pathTemplate: 'engine/m/{hash}',
        },
    };
}

function assertAssetMode(mode) {
    if (!allowedModes.has(mode || 'local')) {
        throw new Error('资源发布方式无效');
    }
    return mode || 'local';
}

module.exports = {
    assertAssetMode,
    configurationPath,
    readConfiguration,
    saveConfiguration,
    uploadPublicAssets,
};
