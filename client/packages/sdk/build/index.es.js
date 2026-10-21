import { connectToChild, connectToParent } from 'penpal';
import dsbridge from '@box/dsbridge';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, [])).next());
    });
}

class IframeController {
    constructor(events) {
        this.events = events;
        this.isReady = false;
        this.emitEvent = (key, value) => {
            if (!this.target) {
                throw Error('connection is not ready');
            }
            return this.target.emit(key, value);
        };
    }
    connect(spec) {
        return __awaiter(this, void 0, void 0, function* () {
            const { eventsOn, current, timeout } = spec;
            if (current === 'parent') {
                this.connection = connectToChild({
                    iframe: spec.iframe,
                    methods: {
                        emit: (key, value) => {
                            this.events.emit(key, value);
                            eventsOn && eventsOn(key, value);
                        },
                    },
                    timeout,
                });
                try {
                    this.target = yield this.connection.promise;
                    this.isReady = true;
                }
                catch (e) {
                    this.isReady = false;
                    eventsOn && eventsOn('error', e);
                }
                return this.isReady;
            }
            else {
                this.connection = connectToParent({
                    methods: {
                        emit: (key, value) => {
                            this.events.emit(key, value);
                            eventsOn && eventsOn(key, value);
                        },
                        receiveHeartbeat: () => true,
                    },
                    timeout,
                });
                try {
                    this.target = yield this.connection.promise;
                    this.isReady = true;
                }
                catch (e) {
                    eventsOn && eventsOn('error', e);
                    this.isReady = false;
                }
                return this.isReady;
            }
        });
    }
    destroy() {
        var _a;
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.destroy();
    }
}

var ErrorType;
(function (ErrorType) {
    ErrorType["LoadError"] = "loadError";
    ErrorType["Custom"] = "custom";
})(ErrorType || (ErrorType = {}));
var CommonErrorMsg;
(function (CommonErrorMsg) {
    CommonErrorMsg["Unauthorized"] = "unauthorized";
    CommonErrorMsg["PermissionDenied"] = "permissionDenied";
    CommonErrorMsg["Unknown"] = "unknown";
})(CommonErrorMsg || (CommonErrorMsg = {}));
var AuthEventType;
(function (AuthEventType) {
    AuthEventType["Unauthorized"] = "unauthorized";
    AuthEventType["UpdateToken"] = "updateToken";
})(AuthEventType || (AuthEventType = {}));
var ChildrenEventType;
(function (ChildrenEventType) {
    ChildrenEventType["ConnectionLost"] = "connectionLost";
})(ChildrenEventType || (ChildrenEventType = {}));

class Events {
    constructor() {
        this.handlers = {};
    }
    addListener(eventName, handler) {
        let list = this.handlers[eventName];
        if (!list) {
            list = [];
            this.handlers[eventName] = list;
        }
        list.push(handler);
    }
    removeListener(eventName, handler) {
        const list = this.handlers[eventName];
        if (!list) {
            return;
        }
        this.handlers[eventName] = list.filter((fn) => fn !== handler);
    }
    emit(eventName, value) {
        const list = this.handlers[eventName];
        if (!list) {
            return;
        }
        list.forEach((handler) => handler(value));
    }
    removeAllListeners() {
        this.handlers = {};
    }
}

const HEARTBEAT_TIMEOUT = 1000;
const DEFAULT_HEARTBEAT_INTERVAL = 60 * 1000;
const PERMISSIONS = [
    'autoplay',
    'fullscreen',
    'microphone',
    'clipboard-read',
    'clipboard-write',
];
class Parent {
    constructor(url, type) {
        this.url = url;
        this.type = type;
        this.heartbeatTimer = -1;
        this.emitEvent = (key, value) => {
            return this.iframe.emitEvent(key, value);
        };
        this.eventOn = (key, handler) => {
            this.events.addListener(key, handler);
        };
        this.eventOff = (key, handler) => {
            this.events.removeListener(key, handler);
        };
        this.events = new Events();
        this.iframe = new IframeController(this.events);
    }
    init(spec) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.iframeElement) {
                return false;
            }
            const { dom, eventsOn, checkHeartbeat = false } = spec;
            this.dom = dom;
            const iframeEl = (this.iframeElement = document.createElement('iframe'));
            iframeEl.src = this.url;
            iframeEl.allow = PERMISSIONS.join(';');
            iframeEl.id = 'GameIframe';
            dom.appendChild(iframeEl);
            const connection = this.iframe.connect({
                current: 'parent',
                eventsOn,
                iframe: iframeEl,
            });
            connection.then((isConnected) => {
                if (isConnected && checkHeartbeat) {
                    this.startCheckingHeartbeat(typeof checkHeartbeat === 'object' ? checkHeartbeat : undefined);
                }
            });
            return connection;
        });
    }
    destroy() {
        if (this.dom) {
            const node = document.getElementById('GameIframe');
            node && this.dom.removeChild(node);
        }
        this.stopCheckingHeartbeat();
        this.events.removeAllListeners();
        this.iframeElement = undefined;
        this.iframe.destroy();
    }
    startCheckingHeartbeat(heartbeatOptions = {}) {
        this.stopCheckingHeartbeat();
        const { interval = DEFAULT_HEARTBEAT_INTERVAL } = heartbeatOptions;
        this.heartbeatTimer = window.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const res = yield this.confirmHeartbeat();
            if (!res) {
                this.events.emit('children', {
                    type: ChildrenEventType.ConnectionLost,
                });
            }
            this.startCheckingHeartbeat(heartbeatOptions);
        }), interval);
    }
    stopCheckingHeartbeat() {
        clearTimeout(this.heartbeatTimer);
    }
    confirmHeartbeat() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.iframe.target || !this.iframe.isReady) {
                return false;
            }
            const timeout = new Promise((resolve) => setTimeout(() => resolve(false), HEARTBEAT_TIMEOUT));
            const confirm = this.iframe.target.receiveHeartbeat().catch(() => {
                return false;
            });
            return Promise.race([confirm, timeout]);
        });
    }
}

const NativeNamespace = 'application';
class WebviewController {
    constructor(events) {
        this.events = events;
        this.isReady = false;
        this.emitEvent = (key, value, callback) => {
            if (!this.isInWebviewOrRusty()) {
                return;
            }
            return dsbridge.call(`${NativeNamespace}.callApp`, {
                name: key,
                param: value,
            }, callback);
        };
    }
    isInRusty() {
        return process.env.RUSTY;
    }
    isInIosWebview() {
        return (typeof window.webkit !== 'undefined' &&
            window.webkit.messageHandlers);
    }
    isInWebviewOrRusty() {
        return this.isInIosWebview() || this.isInRusty();
    }
    connect(eventsOn) {
        return __awaiter(this, void 0, void 0, function* () {
            dsbridge.registerAsyn(NativeNamespace, {
                tag: NativeNamespace,
                callEngine: (props) => {
                    this.events.emit(props.name, props.param);
                    return eventsOn && eventsOn(props.name, props.param);
                },
            });
            this.isReady = true;
            return this.isReady;
        });
    }
}

class Children {
    constructor() {
        this.emitEvent = (key, value) => {
            if (this.isInIframe()) {
                return this.iframe.emitEvent(key, value);
            }
            if (this.isInWebviewOrRusty()) {
                return this.webview.emitEvent(key, value);
            }
        };
        this.callAsync = (key, value) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (this.isInIframe()) {
                    this.iframe.emitEvent(key, value);
                    resolve(undefined);
                    return;
                }
                this.webview.emitEvent(key, value, (res) => {
                    resolve(res);
                });
            });
        });
        this.eventOn = (key, handler) => {
            this.events.addListener(key, handler);
        };
        this.eventOff = (key, handler) => {
            this.events.removeListener(key, handler);
        };
        this.events = new Events();
        this.iframe = new IframeController(this.events);
        this.webview = new WebviewController(this.events);
    }
    connect(eventsOn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInIframe()) {
                return this.iframe.connect({ current: 'children', eventsOn });
            }
            if (this.isInWebviewOrRusty()) {
                return this.webview.connect(eventsOn);
            }
            return false;
        });
    }
    destroy() {
        if (this.isInIframe()) {
            this.iframe.destroy();
        }
        this.events.removeAllListeners();
    }
    isInIframe() {
        return window.self !== window.top;
    }
    isInWebviewOrRusty() {
        return this.webview.isInWebviewOrRusty();
    }
    isInIosWebview() {
        return this.webview.isInIosWebview();
    }
}

function create(param) {
    const { type, url } = param;
    return new Parent(url, type);
}
function createTool() {
    return new Children();
}

export { AuthEventType, ChildrenEventType, CommonErrorMsg, ErrorType, create, createTool };
