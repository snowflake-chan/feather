"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentResolver = void 0;
exports.isAbsoluteContentURL = isAbsoluteContentURL;
exports.resolveContentURL = resolveContentURL;
const _1 = require(".");
const stream_1 = require("@box/mudb/stream");
const image_1 = require("./image");
const data_1 = require("./data");
const loading_schema_1 = require("@box/utils/loading/loading-schema");
function isAbsoluteContentURL(hashOrURL) {
    return /^(?:https?:\/\/|\/\/|\/)/i.test(hashOrURL);
}
function resolveContentURL(hashOrURL, urlPrefix) {
    const isAbsoluteURL = isAbsoluteContentURL(hashOrURL);
    return isAbsoluteURL ? hashOrURL : `${urlPrefix}${hashOrURL}`;
}
const XHR_TIMEOUT = 5000;
const XHR_RETRY = 5;
class ContentRequest {
    constructor() {
        this.done = false;
        this.error = null;
        this.pending = [];
    }
    resolve(data) {
        this.data = data;
        this.done = true;
        for (let i = 0; i < this.pending.length; ++i) {
            this.pending[i][0](data);
        }
        this.pending.length = 0;
    }
    reject(error) {
        this.done = true;
        this.error = error || this.error || true;
        for (let i = 0; i < this.pending.length; ++i) {
            this.pending[i][1](error);
        }
        this.pending.length = 0;
    }
}
class ContentResolver {
    constructor(spec) {
        this._content = {};
        this._ossContent = {};
        this._images = {};
        this.loadingController = null;
        this.storeImageBuffer = async (raw, extension) => {
            let hash = '';
            if (this._contentServer) {
                hash = await this._contentServer.store(new Uint8Array(raw));
            }
            else {
                hash = await this.store(new Uint8Array(raw));
            }
            return hash + '.' + extension;
        };
        this.storeProjectDataDirectly = async (prjectDataJSON) => {
            let hash = '';
            if (this._contentServer) {
                hash = await this._contentServer.store(new TextEncoder().encode(prjectDataJSON));
            }
            else {
                hash = await this.store(new TextEncoder().encode(prjectDataJSON));
            }
            return hash;
        };
        this.storeImageFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const ex = (0, image_1.getImageExtension)(file.name);
                    if (ex) {
                        if (this._contentServer) {
                            this._contentServer
                                .store(new Uint8Array(event.target.result))
                                .then((hash) => {
                                resolve(hash + ex);
                            })
                                .catch(reject);
                        }
                        else {
                            this.store(new Uint8Array(event.target.result))
                                .then((hash) => {
                                resolve(hash + ex);
                            })
                                .catch(reject);
                        }
                    }
                    else {
                        reject(new Error(`Error in storeImageFile: the file ${file.name} is not an image type`));
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        };
        this.cdnPath = spec.cdnPath;
        this._urlPrefix = spec.cdnPath + '/block/';
        this._cacheIPFS = spec.cacheIPFS;
        this.ossCdnURL = spec.ossCdnURL;
        this.avatarCdnURL = spec.avatarCdnURL;
        if (spec.contentServer) {
            this._contentServer = spec.contentServer;
        }
        if (spec.ossContentServer) {
            this._ossContentServer = spec.ossContentServer;
        }
        if (spec.loadingController) {
            this.loadingController = spec.loadingController;
        }
    }
    setPrefetchCaches(prefetchCache) {
        const { xhr, images } = prefetchCache;
        if (typeof window !== 'undefined') {
            const prefetch = xhr;
            Object.keys(prefetch).forEach((hash) => {
                var _a;
                const xhr = prefetch[hash];
                if (xhr.loaded) {
                    const request = new ContentRequest();
                    this._content[hash] = request;
                    request.done = true;
                    request.data = xhr.data;
                }
                else {
                    (_a = xhr.abort) === null || _a === void 0 ? void 0 : _a.call(xhr);
                }
            });
            prefetchCache.xhr = null;
            const prefetchImage = images;
            if (prefetchImage) {
                this._images = prefetchImage;
                Object.keys(this._images).forEach((hash) => {
                    const req = this._images[hash];
                    const image = req.image;
                    if (image && 'complete' in image) {
                        if (image.complete) {
                            req.loaded = true;
                        }
                        image.onloadeddata = image.onload = function () {
                            req.loaded = true;
                        };
                        return;
                    }
                    if (image) {
                        req.loaded = true;
                    }
                });
            }
            prefetchCache.images = null;
        }
    }
    _createRequest(hashOrURL, urlPrefix, content, contentServer) {
        const existing = content[hashOrURL];
        if (existing) {
            return existing;
        }
        if (this.loadingController) {
            this.loadingController.startTask(hashOrURL, loading_schema_1.TaskTypeEnum.Get);
        }
        const request = new ContentRequest();
        content[hashOrURL] = request;
        if (contentServer) {
            contentServer
                .retrieve(hashOrURL)
                .then((data) => {
                if (this.loadingController) {
                    this.loadingController.endTask(hashOrURL, loading_schema_1.TaskTypeEnum.Downloaded);
                }
                request.resolve(data);
                if (!this._cacheIPFS) {
                    delete content[hashOrURL];
                }
            })
                .catch((e) => {
                request.reject(e);
            });
            return request;
        }
        else {
            const url = resolveContentURL(hashOrURL, urlPrefix);
            const data = {
                data: null,
                loaded: false,
                error: false,
            };
            (0, data_1.retrieveData)(data, url, XHR_RETRY, XHR_TIMEOUT)
                .then(() => {
                if (!this._cacheIPFS) {
                    delete content[hashOrURL];
                }
                if (this.loadingController) {
                    this.loadingController.endTask(hashOrURL, loading_schema_1.TaskTypeEnum.Downloaded);
                }
                request.resolve(data.data);
            })
                .catch((err) => {
                request.reject(err);
            });
            return request;
        }
    }
    retrieve(hash) {
        const request = this._createRequest(hash, this._urlPrefix, this._content, this._contentServer);
        return new Promise((resolve, reject) => {
            if (request.done) {
                if (request.error) {
                    reject(request.error);
                }
                else {
                    resolve(request.data);
                }
            }
            else {
                request.pending.push([resolve, reject]);
            }
        });
    }
    retrieveFromS3(hashOrURL, options) {
        const cdnPath = (options === null || options === void 0 ? void 0 : options.ossCdnPath) || _1.DEFAULT_OSS_CDN_PATH;
        const ossCdnURL = cdnPath === '/avatar/m/' && this.avatarCdnURL
            ? this.avatarCdnURL
            : this.ossCdnURL;
        const request = this._createRequest(hashOrURL, `${ossCdnURL}${cdnPath}`, this._ossContent, this._ossContentServer);
        return new Promise((resolve, reject) => {
            if (request.done) {
                if (request.error) {
                    reject(request.error);
                }
                else {
                    resolve(request.data);
                }
            }
            else {
                request.pending.push([resolve, reject]);
            }
        });
    }
    async fetchSchema(schema, hash) {
        const data = await this.retrieve(hash);
        if (!data) {
            return;
        }
        return schema.patch(schema.identity, new stream_1.MuReadStream(data));
    }
    fetchImage(hashOrURL, retrieveFunction = image_1.retrieveImage) {
        const isURL = isAbsoluteContentURL(hashOrURL);
        const taggedKey = isURL
            ? hashOrURL
            : hashOrURL.indexOf('.') < 0
                ? hashOrURL + '.png'
                : hashOrURL;
        const src = isURL
            ? resolveContentURL(hashOrURL, this._urlPrefix)
            : `${this._urlPrefix}${taggedKey}`;
        if (taggedKey in this._images) {
            return this._images[taggedKey];
        }
        if (typeof window === 'undefined') {
            return {
                image: null,
                loaded: false,
                error: true,
            };
        }
        if (this.loadingController) {
            this.loadingController.startTask(hashOrURL, loading_schema_1.TaskTypeEnum.Image);
        }
        const result = {
            image: null,
            loaded: false,
            error: false,
        };
        this._images[taggedKey] = result;
        retrieveFunction(result, src).then((res) => {
            if (res.loaded && this.loadingController) {
                this.loadingController.endTask(hashOrURL, loading_schema_1.TaskTypeEnum.Image);
            }
        });
        return this._images[taggedKey];
    }
    removeImageCache(hashOrURL) {
        const isURL = isAbsoluteContentURL(hashOrURL);
        const taggedKey = isURL
            ? hashOrURL
            : hashOrURL.indexOf('.') < 0
                ? hashOrURL + '.png'
                : hashOrURL;
        if (this._images[taggedKey]) {
            delete this._images[taggedKey];
        }
    }
    store(raw) {
        if (this._contentServer) {
            return this._contentServer.store(raw);
        }
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onerror = reject;
            xhr.onabort = reject;
            xhr.ontimeout = reject;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const info = JSON.parse(xhr.responseText);
                            resolve(info.Key);
                        }
                        catch (e) {
                            resolve(xhr.responseText);
                        }
                    }
                    else {
                        reject(new Error(`failed to store image. reason: ${xhr.statusText}`));
                    }
                }
            };
            xhr.open('POST', this._urlPrefix, true);
            xhr.send(raw);
        });
    }
    destroy() {
        Object.values(this._images).forEach((_) => {
            if (_.image instanceof ImageBitmap) {
                _.image.close();
            }
            _.image = null;
        });
    }
}
exports.ContentResolver = ContentResolver;
