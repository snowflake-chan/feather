function racePolyfill(promises: Iterable<Promise<any>>): Promise<any> {
  return new Promise((resolve_, reject_) => {
    let resolved: boolean = false;

    function resolve(value: any) {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve_(value);
    }

    function reject(err: any) {
      if (resolved) {
        (<any>Promise).reject(err);
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

export function createUnsafeEval(environment: { [id: string]: any }): {
  expr: (expr: string) => any;
  module: (env: { [id: string]: any }, src: string, filename: string) => any;
} {
  const globals = Object.keys(environment);
  const args: any[] = globals.map((k) => environment[k]);
  return {
    expr: Function.apply(
      null,
      globals.concat('return function(_s) { return eval(_s); }'),
    ).apply(environment, args),
    module: (env, src, filename) => {
      const nglobals = globals.slice();
      const nargs = args.slice();
      Object.keys(env).forEach((id) => {
        const idx = nglobals.indexOf(id);
        if (idx >= 0) {
          nargs[idx] = env[id];
        } else {
          nglobals.push(id);
          nargs.push(env[id]);
        }
      });
      nglobals.push(`${src}\n//# sourceURL=${filename}`);
      return Function.apply(null, nglobals).apply(null, nargs);
    },
  };
}

export function createSafeEval(environment: { [id: string]: any }) {
  // global in isoalte, self in worker
  const globalObject = typeof global !== undefined ? global : self;
  for (const key in environment) {
    globalObject[key] = environment[key];
  }

  if (typeof self !== 'undefined') {
    // We're in a web worker, burn those bridges
    const topLevels = [
      // Props
      'navigator',
      'location',
      'performance',
      'caches',
      'indexedDB',
      'isSecureContext',
      'origin',

      // Methods
      'importScripts',
      'dump',
      'atob',
      'btoa',
      // 'clearInterval',
      // 'setInterval',
      // 'clearTimeout',
      // 'setTimeout',
      'createImageBitmap',
      'fetch',
      'close',

      // Events
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

      // Other
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
      // 'Promise',
      'EventSource',
      'ServiceWorkerRegistration',
      // 'TextEncoder', // maybe ok to allow, but not sure if they're
      // 'TextDecoder', // available in isolated-vm sandbox
      'URL',
      'Worker',
      'WorkerNavigator',

      // Fetch
      // 'fetch', // appears above in the list
      'Headers',
      'Request',
      'Response',
      'Body',

      // IndexedDB
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

      // Dedicated Worker things
      'name',
      // 'onmessage', // appears above in the list
      // 'onmessageerror', // appears above in the list
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
      } catch (e) {}
    });
  }

  // update promise.race
  Promise.race = racePolyfill;

  return createUnsafeEval(environment);
}
