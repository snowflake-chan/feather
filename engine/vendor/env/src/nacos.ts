import { createHash } from 'crypto';
import defineDebug from 'debug';
import FormData from 'form-data';
import { axios } from './request';

const debug = defineDebug('@box/env:nacos');

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

export class NacosConfigSubscription {
  private currentServerIndex: number;
  private _content: string | undefined;
  private _md5: string = '';
  constructor(private readonly _params: NacosConfigParameters) {
    this.currentServerIndex = Math.floor(
      Math.random() * _params.serverList.length,
    );

    this._listening();
  }
  public getContent() {
    return this._content;
  }

  private async _listening() {
    this._content = await this._fetchConfig();
    this._md5 = this._getMD5String(this._content);

    // 持续发起长轮询，更新配置。
    this._pollingUpdate();
  }

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
  private async _pollingUpdate() {
    const listeningConfigs = this._md5
      ? `${this._params.dataId}%02${this._params.group}%02${this._md5}%02${this._params.namespace}%01`
      : `${this._params.dataId}%02${this._params.group}%02${this._params.namespace}%01`;

    const formData = new FormData();
    formData.append('Listening-Configs', listeningConfigs);

    try {
      const update = await axios.request({
        url: `${this._getCurrentServer()}/v1/cs/configs/listener`,
        method: 'POST',
        data: formData,
        headers: {
          'Long-Pulling-Timeout': '30000',
          ...formData.getHeaders(),
        },
      });

      if (update.data) {
        debug('Config change detected, update now.');
        this._content = await this._fetchConfig();
        this._md5 = this._getMD5String(this._content);
      }
    } catch (error) {
      debug('Request to nacos listener error: %O. Start next pulling now...');
    }

    this._pollingUpdate();
  }

  private _getMD5String(val: string | undefined) {
    if (val === undefined) {
      return '';
    }
    // TODO 没有处理编码格式，参考 nacos nodejs sdk 看看要不要处理
    const md5 = createHash('md5');
    md5.update(val);
    return md5.digest('hex');
  }

  /**
   * @returns
   */
  private async _fetchConfig() {
    return this.request(
      `/v1/cs/configs?tenant=${this._params.namespace}&group=${this._params.group}&dataId=${this._params.dataId}`,
      { method: 'GET' },
    );
  }

  private async request(
    path: string,
    config: { method: 'GET' | 'POST'; data?: any },
  ) {
    const baseUrl = this._getCurrentServer();

    const endTime = Date.now() + (this._params.timeout || 5000);
    do {
      debug('Fetching nacos config: %s.', baseUrl);

      try {
        const response = await axios.request({
          method: config.method,
          url: `${baseUrl}${path}`,
          data: config.data,
        });
        debug('Fetching nacos config finished.');
        return response.data;
      } catch (err) {
        debug(
          'Fetch nacos config error: %O. Try next nacos server if not timeout...',
          err,
        );
        this._updateCurrentServer();
      }
    } while (Date.now() < endTime);

    throw new Error(`Fetching config time out!`);
  }

  /**
   * @modifies {this.currentServerIndex}
   */
  private _updateCurrentServer() {
    if (++this.currentServerIndex >= this._params.serverList.length) {
      this.currentServerIndex = 0;
    }
  }

  private _getCurrentServer() {
    const nacosServer = this._params.serverList[this.currentServerIndex];
    const protocol = nacosServer.startsWith('http') ? '' : 'http://';
    return `${protocol}${nacosServer}/nacos`;
  }
}
