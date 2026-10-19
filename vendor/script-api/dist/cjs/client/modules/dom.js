"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaError = exports.MediaErrorCode = void 0;
var MediaErrorCode;
(function (MediaErrorCode) {
    MediaErrorCode[MediaErrorCode["MEDIA_ERR_ABORTED"] = 1] = "MEDIA_ERR_ABORTED";
    MediaErrorCode[MediaErrorCode["MEDIA_ERR_NETWORK"] = 2] = "MEDIA_ERR_NETWORK";
    MediaErrorCode[MediaErrorCode["MEDIA_ERR_DECODE"] = 3] = "MEDIA_ERR_DECODE";
    MediaErrorCode[MediaErrorCode["MEDIA_ERR_SRC_NOT_SUPPORTED"] = 4] = "MEDIA_ERR_SRC_NOT_SUPPORTED";
})(MediaErrorCode || (exports.MediaErrorCode = MediaErrorCode = {}));
/**
 * 客户端脚本音频用于构建error对象（不是浏览器自己的MediaError）
 * see: https://developer.mozilla.org/en-US/docs/Web/API/MediaError
 */
var MediaError = /** @class */ (function () {
    function MediaError(code, message) {
        this.code = code;
        this.message = message;
    }
    return MediaError;
}());
exports.MediaError = MediaError;
//# sourceMappingURL=dom.js.map