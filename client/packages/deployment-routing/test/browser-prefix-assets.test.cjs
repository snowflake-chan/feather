'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const test = require('node:test');
const bootstrap = require('@box/deployment-routing/browser');

function environment() {
    const requests = [];
    class Element {
        setAttribute(name, value) {
            requests.push(String(value));
        }
    }
    class Image extends Element {
        set src(value) {
            requests.push(String(value));
            this.value = value;
        }
        get src() {
            return this.value;
        }
    }
    class Script extends Element {
        set src(value) {
            requests.push(String(value));
            this.value = value;
        }
        get src() {
            return this.value;
        }
    }
    class Style {
        set backgroundImage(value) {
            requests.push(value);
        }
        setProperty(name, value) {
            requests.push(value);
        }
    }
    const window = {
        location: { origin: 'http://engine.test' },
        fetch() {},
        open() {},
        Element,
        HTMLImageElement: Image,
        HTMLScriptElement: Script,
        CSSStyleDeclaration: Style,
    };
    vm.runInNewContext(bootstrap({ basePath: '/abc', peerPaths: ['/woooow'] }), {
        window,
        Request,
        URL,
        navigator: {},
        XMLHttpRequest: class {
            open() {}
        },
        history: { pushState() {}, replaceState() {} },
        document: { readyState: 'loading', documentElement: {}, addEventListener() {} },
        MutationObserver: class {
            observe() {}
        },
    });
    return { requests, Image, Script, Style };
}

test('detached images are prefixed before the browser starts loading', () => {
    const { requests, Image } = environment();
    const image = new Image();
    image.src = '/_next/static/media/photo.png';
    assert.deepEqual(requests, ['/abc/_next/static/media/photo.png']);
    assert.equal(image.src, '/abc/_next/static/media/photo.png');
});

test('dynamic scripts are prefixed synchronously for properties and attributes', () => {
    const { requests, Script } = environment();
    const script = new Script();
    script.src = 'http://engine.test/_next/static/chunks/page.js';
    script.setAttribute('src', '/_next/static/chunks/lazy.js');
    assert.deepEqual(requests, [
        'http://engine.test/abc/_next/static/chunks/page.js',
        '/abc/_next/static/chunks/lazy.js',
    ]);
});

test('asset setters preserve external and peer service URLs', () => {
    const { requests, Image } = environment();
    const image = new Image();
    for (const url of [
        '/abc/image.png',
        '/woooow/image.png',
        'https://cdn.test/image.png',
        'data:image/png;base64,AAAA',
    ]) {
        image.src = url;
    }
    assert.deepEqual(requests, [
        '/abc/image.png',
        '/woooow/image.png',
        'https://cdn.test/image.png',
        'data:image/png;base64,AAAA',
    ]);
});

test('inline background images are prefixed before loading', () => {
    const { requests, Style } = environment();
    const style = new Style();
    style.backgroundImage = 'url(/_next/static/media/banner.jpg)';
    style.setProperty('background-image', 'url("/_next/static/media/banner.jpg")');
    assert.deepEqual(requests, [
        'url("/abc/_next/static/media/banner.jpg")',
        'url("/abc/_next/static/media/banner.jpg")',
    ]);
});

test('server-rendered inline background images receive the service prefix', () => {
    const { html } = require('@box/deployment-routing/server');
    const source =
        '<html><head></head><body><div style="background-image:url(/_next/static/media/banner.jpg)"></div></body></html>';
    assert.ok(
        html(source, { basePath: '/abc', peerPaths: [] }).includes(
            'style="background-image:url(&quot;/abc/_next/static/media/banner.jpg&quot;)"',
        ),
    );
});
