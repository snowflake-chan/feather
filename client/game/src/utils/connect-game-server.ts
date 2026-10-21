import { retrieveData, type DataRequest } from '@box/content-server/data';
import { retrieveImage, type ImageRequest } from '@box/content-server/image';
import type { LoadingController } from '@box/utils/loading/loading-controller';
import { TaskTypeEnum } from '@box/utils/loading/loading-schema';
import { Semaphore } from '@box/utils/semaphore';
import axios from 'axios';
import { clientConfig } from 'src/config/client';
import { getToken } from 'src/utils/token';
import type { GameSession } from '/pages/api/createSession';
import type { GameServerTarget } from './remote-game-server';

let allowRuntimeRestartForPage = true;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 建立连接的超时时间
 */
const REMOTE_POLLING_TIMEOUT = 15 * 1000;
// Imported local projects may need to prebake thousands of assets before the
// first session can be returned. Do not abort a healthy cold start at 15s.
const LOCAL_POLLING_TIMEOUT = 120 * 1000;
const SLEEP_TIME = 3 * 1000;

/**
 * 拉取资源，和浏览器的 prefetch 不是一回事
 * @param item
 * @param prefetchImageCaches
 * @param prefetchXhrCaches
 * @returns
 */
async function prefetch(
  item: string,
  assetBaseURL: string,
  prefetchImageCaches: {
    [hash: string]: ImageRequest;
  },
  prefetchXhrCaches: { [hash: string]: DataRequest },
) {
  return new Promise((resolve, reject) => {
    // TODO: 不以Qm开头的hash不在ipfs上，暂不做prefetch
    if (!item.startsWith('Qm')) {
      reject(`Prefetch hash should start with 'Qm'`);
      return;
    }
    const url = assetBaseURL + '/block/' + item;
    if (item.indexOf('.') > 0) {
      const imageRequest: ImageRequest = {
        image: null,
        loaded: false,
        error: false,
      };
      prefetchImageCaches[item] = imageRequest;

      retrieveImage(imageRequest, url).then(resolve).catch(reject);
    } else {
      const request = (prefetchXhrCaches[item] = {
        data: null,
        loaded: false,
        error: false,
      });

      retrieveData(request, url).then(resolve).catch(reject);
    }
  });
}

/**
 * 向游戏服务器发起连接请求
 * 游戏服务器会建立对应的Session
 * 客户端会获得Session对应的配置
 * @param controller
 * @param target
 * @param visitorId
 * @param serverId
 * @param mode
 * @returns
 */
export async function connectGameServer(
  controller: LoadingController,
  target: GameServerTarget,
  visitorId: string,
  serverId?: string,
) {
  let timeout = clientConfig.isLocalGameServer
    ? LOCAL_POLLING_TIMEOUT
    : REMOTE_POLLING_TIMEOUT;

  let config: GameSession | undefined;
  let prefetchImageCaches: {
    [hash: string]: ImageRequest;
  } = {};
  let prefetchXhrCaches: { [hash: string]: DataRequest } = {};
  let prefetchAbortController = new AbortController();

  while (!config) {
    controller.startTask('loadingStart', TaskTypeEnum.Normal);
    try {
      const allowRuntimeRestart = allowRuntimeRestartForPage;
      allowRuntimeRestartForPage = false;
      const response = await axios.post(
        target.sessionURL,
        {
          mode: clientConfig.mode,
          contentId: clientConfig.mapInfo.contentId,
          containerName: clientConfig.name,
          fingerPrint: visitorId,
          serverId,
          ...(clientConfig.launcherServiceWorkerMode && clientConfig.launcherPackage
            ? {
                launcherServiceWorkerMode: true,
                launcherPackage: clientConfig.launcherPackage,
              }
            : {}),
        },
        {
          headers: {
            auth: getToken(),
            ...(allowRuntimeRestart
              ? { 'x-box-runtime-restart': '1' }
              : {}),
          },
          timeout,
        },
      );

      config = response.data.config;
      if (config && target.socketServerURL) {
        config.socketServerUrl = target.socketServerURL;
      }
      if (config && config.prefetchHashes.length > 0) {
        const { prefetchHashes } = config;

        // Keep the engine prefetch scheduler identical to boxes. The local
        // runtime serves these hashes from disk, so an artificial low cap only
        // lengthens cold starts for asset-heavy projects.
        const semaphore = new Semaphore(1000);

        const abortPrefetch = new Promise((resolve, reject) => {
          // 没有用signal.reason是因为浏览器兼容性要求较高
          prefetchAbortController.signal.onabort = () =>
            reject('Abort prefetch');
        });

        for (let i = 0; i < prefetchHashes.length; i++) {
          const hash = prefetchHashes[i];

          Promise.race([semaphore.p(1), abortPrefetch])
            .then(() =>
              prefetch(
                hash,
                target.assetBaseURL,
                prefetchImageCaches,
                prefetchXhrCaches,
              ),
            )
            .catch((err) => {
              /**
               * 这里的报错常见两种
               * - hash不是Qm开头，prefetch直接失败
               * - socket连接完成太快，请求被中断（详见contentResolver.setPrefetchCaches）
               *
               * 不是很重要所以不打印了
               */
            })
            .finally(() => {
              semaphore.v(1);
            });
        }
      } else {
        // FIXME 使用正确的轮询时间
        timeout *= 2;
        await sleep(SLEEP_TIME);
      }
    } catch (error) {
      const response = axios.isAxiosError(error) ? error.response : undefined;
      const responseCode = response?.data?.code;
      if (
        typeof responseCode === 'string' &&
        [
          'LAUNCHER_PACKAGE_INVALID',
          'LAUNCHER_PACKAGE_UNAVAILABLE',
          'LAUNCHER_PACKAGE_OUTDATED',
          'LAUNCHER_TICKET_INVALID',
        ].includes(responseCode)
      ) {
        throw new Error(response?.data?.message || '无法验证启动器地图版本，请返回启动器重试。');
      }
      await sleep(SLEEP_TIME);
    }
    controller.endTask('loadingStart', TaskTypeEnum.Normal);
  }
  config.prefetchCaches = {
    xhr: prefetchXhrCaches,
    images: prefetchImageCaches,
  };
  return { config, prefetchAbortController };
}
