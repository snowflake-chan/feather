"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNavigator = exports.DeviceType = void 0;
var DeviceType;
(function (DeviceType) {
    DeviceType["Desktop"] = "Desktop";
    DeviceType["Mobile"] = "Mobile";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var ClientNavigator = /** @class */ (function () {
    /**
     * @ignore
     * @param getDeviceInfo
     * @param userAgent
     */
    function ClientNavigator(getDeviceInfo, userAgent, language) {
        this.getDeviceInfo = getDeviceInfo;
        this.userAgent = userAgent;
        this.language = language;
    }
    return ClientNavigator;
}());
exports.ClientNavigator = ClientNavigator;
//# sourceMappingURL=navigator.js.map