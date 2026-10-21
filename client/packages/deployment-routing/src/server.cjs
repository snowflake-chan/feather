'use strict';
const http = require('node:http');
const bootstrap = require('./browser.cjs');
const path = require('./public-path.cjs');

function configuration() {
    const base = process.env.BOX_APP_BASE_PATH || '';
    const peerPaths = JSON.parse(process.env.BOX_PUBLIC_SERVICE_PREFIXES || '[]');
    return { basePath: base, peerPaths };
}
function html(source, config = configuration()) {
    if (!config.basePath) {
        return source;
    }
    const transform = (tag) =>
        tag.replace(
            /\b(href|src|srcset|action|poster|data|style)=("|')([^"']*)\2/gi,
            (whole, key, quote, value) => {
                const resolved =
                    key.toLowerCase() === 'style'
                        ? css(value, config).replace(
                              new RegExp(quote, 'g'),
                              quote === '"' ? '&quot;' : '&#39;',
                          )
                        : key.toLowerCase() === 'srcset'
                          ? path.srcSet(value, config.basePath, config.peerPaths)
                          : path.publicPath(value, config.basePath, config.peerPaths);
                return `${key}=${quote}${resolved}${quote}`;
            },
        );
    let raw = '';
    const result = source.replace(/<(?:[^"'>]|"[^"]*"|'[^']*')*>/g, (tag) => {
        if (raw) {
            if (new RegExp(`^<\\/${raw}\\s*>$`, 'i').test(tag)) {
                raw = '';
            }
            return tag;
        }
        if (/^<!--/.test(tag)) {
            return tag;
        }
        if (/^<(script|style)\b/i.test(tag)) {
            raw = RegExp.$1.toLowerCase();
        }
        return transform(tag);
    });
    const data = result.replace(
        /(<script\b[^>]*id="__NEXT_DATA__"[^>]*>)([\s\S]*?)(<\/script>)/,
        (whole, opening, json, closing) => {
            const value = JSON.parse(json);
            if (!/^https?:\/\//i.test(value.assetPrefix || '')) {
                value.assetPrefix = path
                    .publicPath(value.assetPrefix || '/', config.basePath, config.peerPaths)
                    .replace(/\/$/, '');
            }
            return opening + JSON.stringify(value).replace(/</g, '\\u003c') + closing;
        },
    );
    // Stylesheet URLs inside CSS are resolved by the browser, not by the HTML
    // attribute rewrite above, so inline styles and stylesheet responses are
    // prefix-rewritten as well (fonts, background images, @import).
    const styled = data.replace(
        /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
        (whole, opening, body, closing) => `${opening}${css(body, config)}${closing}`,
    );
    return styled.replace(
        /<head(?:\s[^>]*)?>/i,
        (opening) => `${opening}<script>${bootstrap(config)}</script>`,
    );
}
function css(source, config = configuration()) {
    if (!config.basePath) {
        return source;
    }
    return source
        .replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"']*?))\s*\)/gi, (whole, dq, sq, bare) => {
            const value = dq ?? sq ?? bare ?? '';
            const resolved = path.publicPath(value, config.basePath, config.peerPaths);
            return resolved === value ? whole : `url("${resolved}")`;
        })
        .replace(/(@import\s+)(?:"([^"]*)"|'([^']*)')/gi, (whole, prefix, dq, sq) => {
            const value = dq ?? sq ?? '';
            const resolved = path.publicPath(value, config.basePath, config.peerPaths);
            return resolved === value ? whole : `${prefix}"${resolved}"`;
        });
}
function imageRequest(value, config = configuration()) {
    if (!config.basePath || typeof value !== 'string') {
        return value;
    }
    let url;
    try {
        url = new URL(value, 'http://box.internal');
    } catch {
        return value;
    }
    if (url.pathname !== '/_next/image' || url.searchParams.getAll('url').length !== 1) {
        return value;
    }
    const source = url.searchParams.get('url');
    if (!source.startsWith(config.basePath + '/')) {
        return value;
    }
    // Next fetches local optimizer sources inside its own unprefixed router.
    url.searchParams.set('url', source.slice(config.basePath.length));
    return url.pathname + url.search;
}
function install() {
    if (http.ServerResponse.prototype.__boxPrefixInstalled) {
        return;
    }
    const write = http.ServerResponse.prototype.write;
    const end = http.ServerResponse.prototype.end;
    const writeHead = http.ServerResponse.prototype.writeHead;
    const flush = http.ServerResponse.prototype.flushHeaders;
    const emit = http.Server.prototype.emit;
    http.Server.prototype.emit = function (event, ...args) {
        if (event === 'request' && args[0]) {
            args[0].url = imageRequest(args[0].url);
            if (configuration().basePath) {
                // Prefix rewriting consumes text. Compression must happen after
                // this adapter, otherwise compressed bytes become invalid UTF-8.
                args[0].headers['accept-encoding'] = 'identity';
            }
        }
        return emit.call(this, event, ...args);
    };
    const context = (response) => response.__boxPrefixConfig || configuration();
    const contentType = (response) =>
        String(response.getHeader('content-type') || response.__boxContentType || '');
    const isHtml = (response) =>
        Boolean(context(response).basePath) && /^text\/html/i.test(contentType(response));
    const isCss = (response) =>
        Boolean(context(response).basePath) && /^text\/css/i.test(contentType(response));
    const buffered = (response) => isHtml(response) || isCss(response);
    http.ServerResponse.prototype.writeHead = function (status, ...args) {
        const headers = args.find((value) => value && typeof value === 'object');
        if (headers && !Array.isArray(headers)) {
            for (const [key, value] of Object.entries(headers)) {
                this.setHeader(key, value);
            }
        }
        const location = this.getHeader('location');
        if (typeof location === 'string') {
            this.setHeader(
                'location',
                path.publicPath(location, context(this).basePath, context(this).peerPaths),
            );
        }
        const link = this.getHeader('link');
        if (typeof link === 'string') {
            this.setHeader(
                'link',
                link.replace(
                    /<([^>]*)>/g,
                    (whole, value) =>
                        `<${path.publicPath(value, context(this).basePath, context(this).peerPaths)}>`,
                ),
            );
        }
        if (buffered(this)) {
            this.statusCode = status;
            return this;
        }
        return writeHead.call(this, status, ...args);
    };
    http.ServerResponse.prototype.flushHeaders = function () {
        if (!buffered(this)) {
            return flush.call(this);
        }
    };
    http.ServerResponse.prototype.write = function (chunk, encoding, callback) {
        if (!buffered(this)) {
            return write.call(this, chunk, encoding, callback);
        }
        this.__boxChunks ||= [];
        const bytes = Buffer.isBuffer(chunk)
            ? chunk
            : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined);
        this.__boxSize = (this.__boxSize || 0) + bytes.length;
        // Map library pages can contain several inline cover images in their
        // Next data. Retain a bound while allowing those legitimate responses.
        if (this.__boxSize > 32 * 1024 * 1024) {
            this.destroy(new Error('HTML exceeds prefix adapter limit'));
            return false;
        }
        this.__boxChunks.push(bytes);
        if (typeof encoding === 'function') {
            encoding();
        } else if (callback) {
            callback();
        }
        return true;
    };
    http.ServerResponse.prototype.end = function (chunk, encoding, callback) {
        if (!buffered(this)) {
            return end.call(this, chunk, encoding, callback);
        }
        if (chunk) {
            this.write(chunk, typeof encoding === 'string' ? encoding : undefined);
        }
        if (this.destroyed) {
            return this;
        }
        const source = Buffer.concat(this.__boxChunks || []).toString('utf8');
        const result = isCss(this) ? css(source, context(this)) : html(source, context(this));
        this.removeHeader('content-length');
        this.removeHeader('etag');
        writeHead.call(this, this.statusCode);
        return end.call(this, result, typeof encoding === 'function' ? encoding : callback);
    };
    http.ServerResponse.prototype.__boxPrefixInstalled = true;
}
module.exports = { html, css, imageRequest, install, configuration };
