export interface NacosConfigParameters {
    namespace: string;
    group: string;
    dataId: string;
    serverList: string[];
    /**
     * default 5000(ms)
     */
    timeout?: number;
}
export declare class NacosConfigSubscription {
    private readonly _params;
    private currentServerIndex;
    private _content;
    private _md5;
    constructor(_params: NacosConfigParameters);
    getContent(): string | undefined;
    private _listening;
    /**
     * 调用nacos的api订阅配置更新
     * 其中参数Listening-Configs的格式为（%01分隔配置，%02分隔配置内的属性）：
     * dataId%02group%02contentMD5%02tenant%01
     * or
     * dataId%02group%02contentMD5%01
     * 接口返回的格式为：
     * 有更新：立即返回 dataId%02group%02tenant%01
     * 无更新：30s后返回 空字符串
     * @returns
     */
    private _pollingUpdate;
    private _getMD5String;
    /**
     * @returns
     */
    private _fetchConfig;
    private request;
    /**
     * @modifies {this.currentServerIndex}
     */
    private _updateCurrentServer;
    private _getCurrentServer;
}
//# sourceMappingURL=nacos.d.ts.map