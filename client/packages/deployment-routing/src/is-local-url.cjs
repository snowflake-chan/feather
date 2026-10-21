'use strict';
module.exports.isLocalURL = (value) => {
    try {
        const url = new URL(value, window.location.origin);
        if (url.origin !== window.location.origin) {
            return false;
        }
        const base = window.__BOX_APP_BASE_PATH__ || '';
        const within = (path, prefix) => path === prefix || path.startsWith(prefix + '/');
        if (
            (window.__BOX_PUBLIC_PREFIXES__ || []).some(
                (prefix) => prefix && prefix !== base && within(url.pathname, prefix),
            )
        ) {
            return false;
        }
        if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)) {
            return true;
        }
        return !base || within(url.pathname, base);
    } catch {
        return false;
    }
};
