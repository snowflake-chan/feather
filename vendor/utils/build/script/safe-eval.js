"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnsafeEval = createUnsafeEval;
exports.createSafeEval = createSafeEval;
function racePolyfill(promises) {
    return new Promise((resolve_, reject_) => {
        let resolved = false;
        function resolve(value) {
            if (resolved) {
                return;
            }
            resolved = true;
            resolve_(value);
        }
        function reject(err) {
            if (resolved) {
                Promise.reject(err);
                return;
            }
            resolved = true;
            reject_(err);
        }
        for (const p of promises) {
            p.then(resolve, reject);
        }
    });
}
function createUnsafeEval(environment) {
    const globals = Object.keys(environment);
    const args = globals.map((k) => environment[k]);
    return {
        expr: Function.apply(null, globals.concat('return function(_s) { return eval(_s); }')).apply(environment, args),
        module: (env, src, filename) => {
            const nglobals = globals.slice();
            const nargs = args.slice();
            Object.keys(env).forEach((id) => {
                const idx = nglobals.indexOf(id);
                if (idx >= 0) {
                    nargs[idx] = env[id];
                }
                else {
                    nglobals.push(id);
                    nargs.push(env[id]);
                }
            });
            nglobals.push(`${src}\n//# sourceURL=${filename}`);
            return Function.apply(null, nglobals).apply(null, nargs);
        },
    };
}
function createSafeEval(environment) {
    const globalObject = typeof global !== undefined ? global : self;
    for (const key in environment) {
        globalObject[key] = environment[key];
    }
    if (typeof self !== 'undefined') {
        const topLevels = [
            'navigator',
            'location',
            'performance',
            'caches',
            'indexedDB',
            'isSecureContext',
            'origin',
            'importScripts',
            'dump',
            'atob',
            'btoa',
            'createImageBitmap',
            'fetch',
            'close',
            'EventTarget',
            'addEventListener',
            'dispatchEvent',
            'removeEventListener',
            'onafterprint',
            'onbeforeprint',
            'onbeforeunload',
            'onhashchange',
            'onlanguagechange',
            'onmessage',
            'onmessageerror',
            'onoffline',
            'ononline',
            'onpagehide',
            'onpageshow',
            'onpopstate',
            'onstorage',
            'onunhandledrejection',
            'onunload',
            'BroadcastChannel',
            'MessageChannel',
            'MessagePort',
            'PortCollection',
            'Cache',
            'CustomEvent',
            'Event',
            'DataStore',
            'DataStoreChangeEvent',
            'DataStoreCursor',
            'DataStoreTask',
            'XMLHttpRequest',
            'WebSocket',
            'CloseEvent',
            'MessageEvent',
            'DOMRequest',
            'DOMCursor',
            'FileReader',
            'FileReaderSync',
            'FormData',
            'ImageData',
            'NetworkInformation',
            'Notification',
            'NotificationEvent',
            'PerformanceEntry',
            'PerformanceMeasure',
            'PerformanceMark',
            'PerformanceObserver',
            'PerformanceResourceTiming',
            'EventSource',
            'ServiceWorkerRegistration',
            'URL',
            'Worker',
            'WorkerNavigator',
            'Headers',
            'Request',
            'Response',
            'Body',
            'IDBEnvironment',
            'IDBFactory',
            'IDBOpenDBRequest',
            'IDBDatabase',
            'IDBTransaction',
            'IDBRequest',
            'IDBObjectStore',
            'IDBIndex',
            'IDBCursor',
            'IDBCursorWithValue',
            'IDBKeyRange',
            'IDBLocaleAwareKeyRange',
            'IDBVersionChangeEvent',
            'IDBVersionChangeRequest',
            'IDBDatabaseException',
            'IDBTransactionSync',
            'IDBObjectStoreSync',
            'IDBIndexSync',
            'IDBFactorySync',
            'IDBEnvironmentSync',
            'IDBDatabaseSync',
            'IDBCursorSync',
            'name',
            'message',
            'messageerror',
            'postMessage',
        ];
        topLevels.forEach((tl) => {
            if (self[tl] === undefined) {
                return;
            }
            try {
                self[tl] = undefined;
                delete self[tl];
            }
            catch (e) { }
        });
    }
    Promise.race = racePolyfill;
    return createUnsafeEval(environment);
}
