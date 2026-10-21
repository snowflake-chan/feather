import { isMobile } from './mobile';
import { fetch } from '@box/utils/http-fetch/browser';

type WechatSDKConfig = {
  nonceStr: string;
  timestamp: number;
  signature: string;
  appId: string;
};

type ShareSpec = {
  title: string;
  desc: string;
  imgUrl: string;
};

const cache = {
  platformURL: '',
  isDev: false,
  lastURL: '',
};

export function registerWechatSDK(spec: {
  platformURL: string;
  isDev?: boolean;
}) {
  cache.platformURL = spec.platformURL;
  cache.isDev = spec.isDev || false;
}

export function onWechatShare(
  spec: ShareSpec & {
    link?: string;
    success?: () => void;
    fail?: (err: any) => void;
  },
) {
  if (!isMobile()) {
    return;
  }
  if (!cache.platformURL) {
    spec.fail &&
      spec.fail(
        new Error(
          `Can't initialize wechat sdk because platformURL is not defined.`,
        ),
      );
    return;
  }
  const url = spec.link || getWechatURL();
  const config = Object.assign({ link: url }, spec);
  if (url !== cache.lastURL) {
    cache.lastURL = url;
    initWechatSDK(cache)
      .then(() => {
        updateWechat({
          ...config,
          success: spec.success,
          fail: spec.fail,
        });
      })
      .catch(spec.fail);
    return;
  }
  updateWechat({
    ...config,
    success: spec.success,
    fail: spec.fail,
  });
}

function initWechatSDK(spec: typeof cache) {
  return new Promise<void>((resolve, reject) => {
    getSDK()
      .then((wx) => {
        const url = getWechatURL(spec.lastURL);
        fetch(
          'POST',
          `${spec.platformURL}/wechat_sdk_config`,
          JSON.stringify({
            url,
          }),
        )
          .then((configRes) => {
            try {
              const wxConfig = JSON.parse(configRes) as WechatSDKConfig;
              let error = false;
              wx.error((err) => {
                error = true;
                reject(err);
              });
              wx.ready(() => {
                if (!error) {
                  resolve();
                }
              });
              wx.config({
                debug: spec.isDev || false,
                appId: wxConfig.appId,
                timestamp: wxConfig.timestamp,
                nonceStr: wxConfig.nonceStr,
                signature: wxConfig.signature,
                jsApiList: [
                  // 'updateAppMessageShareData',
                  // 'updateTimelineShareData',
                  'onMenuShareAppMessage',
                  'onMenuShareTimeline',
                ],
              });
            } catch (e) {
              reject(
                new Error(`initWeChatShare: Failed on JSON.parse ${configRes}`),
              );
            }
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

function getWechatURL(_url?: string) {
  const url = _url || location.href;
  return url.split('#')[0];
}

function updateWechat(spec: {
  title: string;
  desc: string;
  imgUrl: string;
  link: string;
  success?: () => void;
  fail?: (err: any) => void;
}) {
  getSDK()
    .then((wx) => {
      // share to friends on both wechat and QQ
      // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
      wx.onMenuShareAppMessage({
        title: spec.title,
        desc: spec.desc,
        link: spec.link,
        imgUrl: spec.imgUrl,
        success: spec.success,
        fail: spec.fail,
      });

      // share to wechat moment or QQ Zone
      // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
      wx.onMenuShareTimeline({
        title: spec.title,
        link: spec.link,
        imgUrl: spec.imgUrl,
        success: spec.success,
        fail: spec.fail,
      });
    })
    .catch(spec.fail);
}

async function getSDK() {
  const sdk = await import(
    /* webpackMode: "lazy" */
    'weixin-js-sdk'
  );
  return sdk.default;
}
