import { registerWechatSDK, onWechatShare } from 'src/utils/wechat';
import { clientConfig } from 'src/config/client';

export const registerWeChat = () => {
  const { name, description, image } = clientConfig.mapInfo;
  // config wechat/qq sharing information
  registerWechatSDK({
    platformURL: clientConfig.PLATFORM_URL,
    isDev: process.env.NODE_ENV === 'development',
  });
  onWechatShare({
    title: name,
    desc: description,
    imgUrl: image,
  });
};
