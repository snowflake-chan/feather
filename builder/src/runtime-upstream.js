'use strict';

// Child processes listen on loopback; future isolated runtime containers use a
// private Compose DNS name.  The proxy only needs this narrow endpoint shape,
// so callers never need to branch on the execution adapter.
function runtimeUpstream(runtime) {
    return {
        hostname: runtime.hostname || '127.0.0.1',
        port: Number(runtime.port),
    };
}

function runtimeHostHeader(runtime) {
    const upstream = runtimeUpstream(runtime);
    return `${upstream.hostname}:${upstream.port}`;
}

module.exports = { runtimeUpstream, runtimeHostHeader };
