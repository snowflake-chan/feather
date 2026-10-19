export var DeviceType;
(function (DeviceType) {
    DeviceType["Desktop"] = "Desktop";
    DeviceType["Mobile"] = "Mobile";
})(DeviceType || (DeviceType = {}));
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
export { ClientNavigator };
//# sourceMappingURL=navigator.js.map