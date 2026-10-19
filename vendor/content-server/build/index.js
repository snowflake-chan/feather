"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssStoreType = exports.RUSTY_OSS_CDN_PATH = exports.TEMP_OSS_CDN_PATH = exports.SCRIPT_OSS_CDN_PATH = exports.DEFAULT_OSS_CDN_PATH = exports.HashSchema = void 0;
const schema_1 = require("@box/mudb/schema");
exports.HashSchema = new schema_1.MuASCII();
exports.DEFAULT_OSS_CDN_PATH = '/engine/m/';
exports.SCRIPT_OSS_CDN_PATH = '/engine/s/';
exports.TEMP_OSS_CDN_PATH = '/tmp/';
exports.RUSTY_OSS_CDN_PATH = '/engine/rusty/';
var OssStoreType;
(function (OssStoreType) {
    OssStoreType["Script"] = "script";
    OssStoreType["Model"] = "model";
    OssStoreType["Temp"] = "tmp";
    OssStoreType["Rusty"] = "rusty";
})(OssStoreType || (exports.OssStoreType = OssStoreType = {}));
