'use strict';

function bootstrap(config) {
    const base = config.basePath;
    window.__BOX_APP_BASE_PATH__ = base;
    window.__BOX_PUBLIC_PREFIXES__ = config.peerPaths || [];
    if (!base) {
        return;
    }
    const within = (path, prefix) => path === prefix || path.startsWith(prefix + '/');
    const resolve = (value) => {
        if (
            typeof value !== 'string' ||
            (!value.startsWith('/') && !/^(https?|wss?):\/\//i.test(value))
        ) {
            return value;
        }
        if (value.startsWith('//')) {
            return value;
        }
        const url = new URL(value, window.location.origin);
        const ownProtocol =
            url.protocol === 'ws:' ? 'http:' : url.protocol === 'wss:' ? 'https:' : url.protocol;
        if (ownProtocol + '//' + url.host !== window.location.origin) {
            return value;
        }
        if (
            within(url.pathname, base) ||
            window.__BOX_PUBLIC_PREFIXES__.some((prefix) => prefix && within(url.pathname, prefix))
        ) {
            return value;
        }
        url.pathname = base + url.pathname;
        return value.startsWith('/') ? url.pathname + url.search + url.hash : url.href;
    };
    window.__BOX_RESOLVE_PUBLIC_URL__ = resolve;
    const fetch = window.fetch.bind(window);
    window.fetch = async (input, options) => {
        if (input instanceof Request) {
            const url = resolve(input.url);
            if (url !== input.url) {
                const request = options ? new Request(input, options) : input;
                if (request.body === null) {
                    input = new Request(url, request);
                } else {
                    // Passing Request as init exposes its ReadableStream and makes Chrome
                    // require HTTP/2 for uploads. A Blob retains HTTP/1.1 compatibility.
                    const body = await request.blob();
                    const init = {};
                    for (const key of [
                        'method',
                        'headers',
                        'mode',
                        'credentials',
                        'cache',
                        'redirect',
                        'referrer',
                        'referrerPolicy',
                        'integrity',
                        'keepalive',
                        'signal',
                    ]) {
                        init[key] = request[key];
                    }
                    input = new Request(url, { ...init, body });
                }
                options = undefined;
            }
        } else if (input instanceof URL) {
            input = resolve(input.href);
        } else {
            input = resolve(input);
        }
        return fetch(input, options);
    };
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
        return open.call(this, method, resolve(String(url)), ...args);
    };
    for (const name of ['WebSocket', 'EventSource', 'Worker', 'SharedWorker']) {
        const Original = window[name];
        if (!Original) {
            continue;
        }
        window[name] = class extends Original {
            constructor(url, options) {
                super(resolve(String(url)), options);
            }
        };
    }
    if (navigator.serviceWorker?.register) {
        const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
        navigator.serviceWorker.register = (url, options = {}) =>
            register(resolve(String(url)), { ...options, scope: resolve(options.scope || '/') });
    }
    const openWindow = window.open.bind(window);
    window.open = (url, target, features) =>
        openWindow(url == null ? url : resolve(String(url)), target, features);
    for (const method of ['pushState', 'replaceState']) {
        const original = history[method].bind(history);
        history[method] = (state, title, url) =>
            original(state, title, url == null ? url : resolve(String(url)));
    }
    const resolveStyle = (value) =>
        typeof value !== 'string'
            ? value
            : value.replace(
                  /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"']*?))\s*\)/gi,
                  (whole, dq, sq, bare) => {
                      const original = dq ?? sq ?? bare ?? '';
                      const next = resolve(original);
                      return next === original ? whole : `url("${next}")`;
                  },
              );
    const attributes = ['src', 'href', 'srcset', 'poster', 'action', 'data', 'style'];
    const resolveAttribute = (name, value) =>
        name === 'style'
            ? resolveStyle(value)
            : name === 'srcset'
              ? value
                    .split(',')
                    .map((entry) =>
                        entry.replace(/^(\s*)(\S+)/, (whole, space, url) => space + resolve(url)),
                    )
                    .join(',')
              : resolve(value);
    // Asset setters can start loading before a MutationObserver runs, including
    // images which are never attached to the document.
    const setAttribute = window.Element?.prototype.setAttribute;
    if (setAttribute) {
        window.Element.prototype.setAttribute = function (name, value) {
            const key = String(name).toLowerCase();
            return setAttribute.call(
                this,
                name,
                attributes.includes(key) ? resolveAttribute(key, String(value)) : value,
            );
        };
    }
    for (const [name, keys] of [
        ['HTMLImageElement', ['src', 'srcset']],
        ['HTMLScriptElement', ['src']],
        ['HTMLLinkElement', ['href']],
        ['HTMLIFrameElement', ['src']],
        ['HTMLMediaElement', ['src']],
        ['HTMLVideoElement', ['poster']],
        ['HTMLSourceElement', ['src', 'srcset']],
        ['HTMLEmbedElement', ['src']],
        ['HTMLObjectElement', ['data']],
        ['HTMLFormElement', ['action']],
        ['HTMLAnchorElement', ['href']],
    ]) {
        const prototype = window[name]?.prototype;
        if (!prototype) {
            continue;
        }
        for (const key of keys) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            if (!descriptor?.set || !descriptor.configurable) {
                continue;
            }
            Object.defineProperty(prototype, key, {
                ...descriptor,
                set(value) {
                    return descriptor.set.call(this, resolveAttribute(key, String(value)));
                },
            });
        }
    }
    const stylePrototype = window.CSSStyleDeclaration?.prototype;
    if (stylePrototype) {
        const setProperty = stylePrototype.setProperty;
        stylePrototype.setProperty = function (name, value, priority) {
            return setProperty.call(this, name, resolveStyle(value), priority);
        };
        for (const key of [
            'cssText',
            'background',
            'backgroundImage',
            'borderImage',
            'borderImageSource',
            'listStyle',
            'listStyleImage',
            'mask',
            'maskImage',
            'webkitMaskImage',
            'content',
            'cursor',
            'filter',
            'clipPath',
        ]) {
            const descriptor = Object.getOwnPropertyDescriptor(stylePrototype, key);
            if (!descriptor?.set || !descriptor.configurable) {
                continue;
            }
            Object.defineProperty(stylePrototype, key, {
                ...descriptor,
                set(value) {
                    return descriptor.set.call(this, resolveStyle(value));
                },
            });
        }
    }
    const fix = (element) => {
        if (!element || typeof element.getAttribute !== 'function') {
            return;
        }
        for (const name of attributes) {
            const value = element.getAttribute(name);
            if (!value) {
                continue;
            }
            const next = resolveAttribute(name, value);
            if (next !== value) {
                element.setAttribute(name, next);
            }
        }
    };
    const walk = (root) => {
        if (!root || root.nodeType !== 1) {
            return;
        }
        fix(root);
        if (!root.querySelectorAll) {
            return;
        }
        for (const element of root.querySelectorAll(
            '[src],[href],[srcset],[poster],[action],[data],[style]',
        )) {
            fix(element);
        }
    };
    const ready = () => walk(document.documentElement);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ready, { once: true });
    } else {
        ready();
    }
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes') {
                fix(mutation.target);
            } else {
                for (const node of mutation.addedNodes) {
                    walk(node);
                }
            }
        }
    }).observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: attributes,
    });
}

module.exports = (config) =>
    `(${bootstrap.toString()})(${JSON.stringify(config).replace(/</g, '\\u003c')});`;
