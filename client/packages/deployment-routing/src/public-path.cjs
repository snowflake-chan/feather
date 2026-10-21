'use strict';
function basePath() {
    return typeof window === 'undefined'
        ? process.env.BOX_APP_BASE_PATH || ''
        : window.__BOX_APP_BASE_PATH__ || '';
}
function publicPath(value, overrideBase, overridePeers) {
    if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
        return value;
    }
    const base = overrideBase === undefined ? basePath() : overrideBase;
    const peers =
        overridePeers ||
        (typeof window === 'undefined'
            ? JSON.parse(process.env.BOX_PUBLIC_SERVICE_PREFIXES || '[]')
            : window.__BOX_PUBLIC_PREFIXES__ || []);
    const path = value.split(/[?#]/)[0];
    if (
        !base ||
        [base, ...peers].some(
            (prefix) => prefix && (path === prefix || path.startsWith(prefix + '/')),
        )
    ) {
        return value;
    }
    if (path === '/') {
        return base + value.slice(1);
    }
    return base + value;
}
function props(type, original) {
    if (typeof type !== 'string' || !original) {
        return original;
    }
    let result = original;
    for (const key of ['href', 'src', 'action', 'poster', 'data']) {
        const value = publicPath(original[key]);
        if (value !== original[key]) {
            if (result === original) {
                result = { ...original };
            }
            result[key] = value;
        }
    }
    if (typeof original.srcSet === 'string') {
        const value = srcSet(original.srcSet);
        if (value !== original.srcSet) {
            if (result === original) {
                result = { ...original };
            }
            result.srcSet = value;
        }
    }
    return result;
}
function srcSet(value, base, peers) {
    return value
        .split(',')
        .map((entry) =>
            entry.replace(/^(\s*)(\S+)/, (_, space, url) => space + publicPath(url, base, peers)),
        )
        .join(',');
}
module.exports = { basePath, publicPath, props, srcSet };
