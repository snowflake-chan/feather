export declare enum DeviceType {
    Desktop = "Desktop",
    Mobile = "Mobile"
}
export type DeviceInfo = {
    deviceType: DeviceType;
    screen: {
        width: number;
        height: number;
    };
};
export declare class ClientNavigator {
    getDeviceInfo: () => {
        deviceType: DeviceType;
        screen: {
            width: number;
            height: number;
        };
    };
    userAgent: string;
    language: string;
    /**
     * @ignore
     * @param getDeviceInfo
     * @param userAgent
     */
    constructor(getDeviceInfo: () => {
        deviceType: DeviceType;
        screen: {
            width: number;
            height: number;
        };
    }, userAgent: string, language: string);
}
export declare const navigator: ClientNavigator;
//# sourceMappingURL=navigator.d.ts.map