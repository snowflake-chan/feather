import type { IAgoraRTC } from 'agora-rtc-sdk-ng';
import { clientConfig } from 'src/config/client';

let ImportAgoraRTC: Promise<IAgoraRTC | undefined>;

if (!process.env.RUSTY && !clientConfig.isLocalGameServer) {
  ImportAgoraRTC = import('agora-rtc-sdk-ng').then((sdk) => sdk.default);
} else {
  ImportAgoraRTC = Promise.resolve(undefined);
}

/**
 * TODO 确保客户端脚本在agoraRTC之后加载
 * - 在80版本的chrome中，ses和agoraRTC存在冲突，ses必须在agoraRTC之后引入，否则ses lockdown会失败
 */
const ImportClientScript = ImportAgoraRTC.then(() =>
  import('./script').then(({ ClientScript }) => ClientScript),
);

export { ImportAgoraRTC, ImportClientScript };
